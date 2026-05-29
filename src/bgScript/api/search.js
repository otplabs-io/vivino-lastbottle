import fetch from 'node-fetch';

const BASE_SEARCH_PARAMS = {
  app_caller_origin: 'default',
  country_code: 'us',
  language: 'en',
  app_version: '2026.21.0',
  os_version: '26.5',
  app_phone: 'iPhone17,1',
  app_platform: 'iphone',
  state: 'fl',
};

const BASE_PRICE_PARAMS = {
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

const ANON_UUID = 'B3C4D5E6-AAAA-BBBB-CCCC-000000000000';
const MIAMI_LAT = '25.7617';
const MIAMI_LON = '-80.1918';

const SEARCH_URL = 'https://api.vivino.com/v13/events/search';
const PRICE_URL = 'https://api.vivino.com/v/9.0.0/vintages/_prices';
const MAX_RESULTS = 5;

function buildQueryString(params) {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

async function callSearchApi(wineName, includeLocation) {
  const params = { ...BASE_SEARCH_PARAMS, uuid: ANON_UUID };
  if (includeLocation) {
    params.location_latitude = MIAMI_LAT;
    params.location_longitude = MIAMI_LON;
    params.location_accuracy = '10';
  }

  const response = await fetch(`${SEARCH_URL}?${buildQueryString(params)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: wineName }),
  });

  if (!response.ok) {
    throw new Error(`Search API responded with ${response.status}`);
  }

  return response.json();
}

function parseSearchResults(data) {
  const raw = data.results || data.matches || data.wines || data.vintages || [];
  if (!Array.isArray(raw)) return [];

  const wines = [];
  for (const item of raw) {
    if (wines.length >= MAX_RESULTS) break;

    const vintage = item.vintage || item;
    const wine = vintage.wine || item.wine || {};

    const id = vintage.id || item.id;
    if (!id) continue;

    const name = vintage.name || wine.name || item.name || '';
    if (!name) continue;

    const ratingsAverage = wine.ratings_average != null ? wine.ratings_average
      : vintage.ratings_average != null ? vintage.ratings_average
      : item.ratings_average != null ? item.ratings_average
      : null;
    const ratingsCount = wine.ratings_count != null ? wine.ratings_count
      : vintage.ratings_count != null ? vintage.ratings_count
      : item.ratings_count != null ? item.ratings_count
      : 0;

    const imageObj = vintage.image || wine.image || item.image || {};
    const rawImageUrl = imageObj.location || imageObj.url || '';
    const imageUrl = rawImageUrl ? rawImageUrl.replace('/thumbs/', '/x600-/') : '';

    const seoName = wine.seo_name || vintage.seo_name || '';
    const vintageYear = vintage.year || '';
    const wineUrl = seoName
      ? `https://www.vivino.com/wines/${seoName}${vintageYear ? `/${vintageYear}` : ''}`
      : '';

    wines.push({ id: String(id), name, ratingsAverage, ratingsCount, imageUrl, wineUrl });
  }

  return wines;
}

async function callPriceApi(vintageIds, includeLocation) {
  const params = {
    ...BASE_PRICE_PARAMS,
    uuid: ANON_UUID,
    vintage_ids: vintageIds.join(','),
  };
  if (includeLocation) {
    params.location_latitude = MIAMI_LAT;
    params.location_longitude = MIAMI_LON;
    params.location_accuracy = '10';
  }

  const response = await fetch(`${PRICE_URL}?${buildQueryString(params)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) return {};

  const data = await response.json();
  const source = data.vintages || data;
  const priceMap = {};

  for (const [vid, info] of Object.entries(source)) {
    if (!info || typeof info !== 'object') continue;
    const median = (info.median && info.median.amount != null) ? info.median.amount : null;
    const best = (info.price && info.price.amount != null) ? info.price.amount : null;
    priceMap[vid] = {
      median: median !== null ? parseFloat(median).toFixed(2) : null,
      best: best !== null ? parseFloat(best).toFixed(2) : null,
    };
  }

  return priceMap;
}

export default async function search(wineName) {
  let searchData;

  try {
    searchData = await callSearchApi(wineName, false);
    const wines = parseSearchResults(searchData);

    if (!wines.length) {
      searchData = await callSearchApi(wineName, true);
    }
  } catch (_) {
    searchData = await callSearchApi(wineName, true);
  }

  const wines = parseSearchResults(searchData);
  if (!wines.length) return [];

  const vintageIds = wines.map(w => w.id);

  let priceMap = {};
  try {
    priceMap = await callPriceApi(vintageIds, false);
    const hasAny = Object.keys(priceMap).length > 0;
    if (!hasAny) {
      priceMap = await callPriceApi(vintageIds, true);
    }
  } catch (_) {
    try {
      priceMap = await callPriceApi(vintageIds, true);
    } catch (_2) {
      priceMap = {};
    }
  }

  return wines.map(wine => ({
    ...wine,
    pricing: priceMap[wine.id] || { median: null, best: null },
  }));
}
