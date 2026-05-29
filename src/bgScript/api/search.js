import fetch from 'node-fetch';

// The Vivino website embeds full search results as JSON in the page HTML
// under the key "initialExploreResults". No authentication required.
const SEARCH_BASE = 'https://www.vivino.com/search/wines';

// The price API returns median market prices. Also works without auth.
const PRICE_URL = 'https://api.vivino.com/v/9.0.0/vintages/_prices';

const MAX_RESULTS = 5;

const PRICE_PARAMS = {
  app_caller_origin: 'default',
  country: 'us',
  country_code: 'us',
  language: 'en',
  app_version: '2026.21.0',
  os_version: '26.5',
  app_phone: 'iPhone17,1',
  app_platform: 'iphone',
  state: 'Florida',
};

function buildQueryString(params) {
  return Object.entries(params)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Extract the "initialExploreResults" JSON blob embedded in the page HTML.
// The page encodes it as HTML entities inside a script/data attribute.
function extractEmbeddedResults(html) {
  const decoded = decodeHtmlEntities(html);
  const marker = '"initialExploreResults":';
  const start = decoded.indexOf(marker);
  if (start === -1) return null;

  // Walk forward from the opening brace to find the matching closing brace
  let objStart = decoded.indexOf('{', start + marker.length);
  if (objStart === -1) return null;

  let depth = 0, i = objStart;
  for (; i < decoded.length; i++) {
    if (decoded[i] === '{') depth++;
    else if (decoded[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }

  try {
    return JSON.parse(decoded.slice(objStart, i + 1));
  } catch (_) {
    return null;
  }
}

async function fetchSearchPage(wineName) {
  const url = SEARCH_BASE + '?q=' + encodeURIComponent(wineName);
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error('Vivino search page returned ' + response.status);
  }

  return response.text();
}

function parseMatches(results) {
  if (!results || !Array.isArray(results.matches)) return [];

  const wines = [];
  for (var i = 0; i < results.matches.length && wines.length < MAX_RESULTS; i++) {
    var match = results.matches[i];
    var vintage = match.vintage;
    if (!vintage || !vintage.id) continue;

    var stats = vintage.statistics || {};
    var ratingsAverage = stats.ratings_average != null ? stats.ratings_average : null;
    var ratingsCount = stats.ratings_count != null ? stats.ratings_count : 0;

    var imageObj = vintage.image || {};
    var variations = imageObj.variations || {};
    // Prefer bottle_medium (clean white background), fall back to label
    var imageUrl = variations.bottle_medium || variations.bottle_small || imageObj.location || '';
    // Ensure protocol
    if (imageUrl && imageUrl.indexOf('//') === 0) imageUrl = 'https:' + imageUrl;

    var wine = vintage.wine || {};
    // vintage.seo_name includes the year (e.g. "opus-one-opus-one-2016")
    // wine.seo_name is the generic label — prefer the vintage-specific one
    var seoName = vintage.seo_name || wine.seo_name || '';
    var wineUrl = seoName
      ? 'https://www.vivino.com/wines/' + seoName
      : '';

    // Best available price is already embedded in the match
    var bestPrice = null;
    if (match.price && match.price.amount != null) {
      bestPrice = parseFloat(match.price.amount).toFixed(2);
    }

    wines.push({
      id: String(vintage.id),
      name: vintage.name || wine.name || '',
      ratingsAverage: ratingsAverage,
      ratingsCount: ratingsCount,
      imageUrl: imageUrl,
      wineUrl: wineUrl,
      bestPrice: bestPrice,
    });
  }

  return wines;
}

async function fetchMedianPrices(vintageIds) {
  if (!vintageIds.length) return {};

  var params = Object.assign({}, PRICE_PARAMS, {
    vintage_ids: vintageIds.join(','),
  });

  var response = await fetch(PRICE_URL + '?' + buildQueryString(params));
  if (!response.ok) return {};

  var data = await response.json();
  var source = data.vintages || data;
  var priceMap = {};

  var keys = Object.keys(source);
  for (var j = 0; j < keys.length; j++) {
    var vid = keys[j];
    var info = source[vid];
    if (!info || typeof info !== 'object') continue;
    var median = (info.median && info.median.amount != null) ? parseFloat(info.median.amount).toFixed(2) : null;
    priceMap[vid] = median;
  }

  return priceMap;
}

export default async function search(wineName) {
  var html = await fetchSearchPage(wineName);
  var results = extractEmbeddedResults(html);

  if (!results) {
    throw new Error('Could not find embedded results in Vivino search page');
  }

  var wines = parseMatches(results);
  if (!wines.length) return [];

  var vintageIds = wines.map(function(w) { return w.id; });

  var medianMap = {};
  try {
    medianMap = await fetchMedianPrices(vintageIds);
  } catch (_) {
    medianMap = {};
  }

  return wines.map(function(wine) {
    return Object.assign({}, wine, {
      pricing: {
        median: medianMap[wine.id] || null,
        best: wine.bestPrice,
      },
    });
  });
}
