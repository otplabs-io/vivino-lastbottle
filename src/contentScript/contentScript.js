import search from './api/search';

const SIDEBAR_WIDTH = '300px';
const SIDEBAR_ID = 'vivino-sidebar-host';

// ─── Wine name detection ────────────────────────────────────────────────────

function extractWineName() {
  const candidates = [];

  // 1. Primary: the page's h1 (Shopify product pages have exactly one h1 — the product name)
  const h1 = document.querySelector('h1');
  if (h1) candidates.push(h1.textContent);

  // 2. Common Shopify / LastBottle product title selectors
  const selectors = [
    '.product__title',
    '.product-title',
    '.product-single__title',
    '[data-product-title]',
    '.offer-name',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) candidates.push(el.textContent);
  }

  // 3. Open Graph title meta tag
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) candidates.push(ogTitle.getAttribute('content'));

  // 4. Standard title meta tag
  const metaTitle = document.querySelector('meta[name="title"]');
  if (metaTitle) candidates.push(metaTitle.getAttribute('content'));

  // 5. Page <title> element (strip common site suffixes)
  if (document.title) {
    candidates.push(
      document.title
        .replace(/\s*[|\-–—]\s*Last Bottle.*/i, '')
        .replace(/\s*Wine\s*[-–]\s*Last Bottle.*/i, '')
    );
  }

  // Pick the first non-empty candidate and clean it up
  for (const raw of candidates) {
    const name = cleanWineName(raw);
    if (name) return name;
  }

  return null;
}

function cleanWineName(raw) {
  if (!raw) return null;
  let name = raw.trim();

  // Strip image alt-style suffixes like "Wine - Last Bottle"
  name = name.replace(/\s*Wine\s*[-–]\s*Last Bottle.*/i, '').trim();

  // Remove trailing 4-digit vintage year (we search without it for broader results)
  if (/\d{4}$/.test(name)) {
    name = name.slice(0, -4).trim();
  }

  // Remove non-vintage markers
  name = name.replace(/\bN\.?V\.?\b/gi, '').trim();

  return name || null;
}

// ─── Sidebar UI ─────────────────────────────────────────────────────────────

function createSidebar() {
  const host = document.createElement('div');
  host.id = SIDEBAR_ID;
  host.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: ${SIDEBAR_WIDTH};
    height: 100vh;
    z-index: 2147483647;
    font-family: sans-serif;
  `;
  document.body.appendChild(host);
  document.body.style.marginRight = SIDEBAR_WIDTH;

  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :host { display: block; }

      #panel {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100vh;
        background: #fff;
        box-shadow: -3px 0 12px rgba(0,0,0,0.18);
        overflow: hidden;
      }

      #header {
        flex-shrink: 0;
        background: #6B1A2B;
        color: #fff;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #header svg { flex-shrink: 0; }

      #header-text {
        flex: 1;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.3px;
      }

      #wine-query {
        font-size: 10px;
        font-weight: 400;
        opacity: 0.75;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #body {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* Loading */
      #loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        gap: 12px;
        color: #888;
        font-size: 13px;
      }

      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #e0e0e0;
        border-top-color: #6B1A2B;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin { to { transform: rotate(360deg); } }

      /* Error */
      #error {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        gap: 8px;
        color: #888;
        font-size: 13px;
        text-align: center;
        padding: 20px;
      }

      #error strong { color: #6B1A2B; font-size: 14px; }

      /* Empty */
      #empty {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        gap: 8px;
        color: #888;
        font-size: 13px;
        text-align: center;
        padding: 20px;
      }

      /* Results */
      #results { display: none; flex-direction: column; gap: 12px; }

      .card {
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        overflow: hidden;
        background: #fafafa;
      }

      .card-img-wrap {
        background: #f5f0eb;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 160px;
        overflow: hidden;
      }

      .card-img-wrap img {
        height: 150px;
        width: auto;
        object-fit: contain;
        display: block;
      }

      .card-img-wrap.no-img { display: none; }

      .card-body { padding: 10px 12px; }

      .card-name {
        font-size: 13px;
        font-weight: 600;
        color: #1a1a1a;
        line-height: 1.3;
        margin-bottom: 8px;
      }

      .card-stats {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: #444;
        margin-bottom: 10px;
      }

      .stat-row { display: flex; align-items: center; gap: 6px; }
      .stat-label { font-weight: 600; min-width: 80px; color: #666; }

      .stars { color: #c0392b; letter-spacing: 1px; font-size: 13px; }
      .rating-count { color: #888; font-size: 11px; }

      .price-val {
        font-weight: 700;
        font-size: 14px;
        color: #6B1A2B;
      }

      .price-sub { font-size: 10px; color: #888; }

      .card-link {
        display: inline-block;
        font-size: 11px;
        color: #6B1A2B;
        text-decoration: none;
        border: 1px solid #6B1A2B;
        border-radius: 4px;
        padding: 4px 10px;
        transition: background 0.15s, color 0.15s;
      }

      .card-link:hover { background: #6B1A2B; color: #fff; }

      #footer {
        flex-shrink: 0;
        padding: 8px 12px;
        font-size: 10px;
        color: #bbb;
        border-top: 1px solid #eee;
        text-align: center;
      }

      #footer a { color: #bbb; }
    </style>

    <div id="panel">
      <div id="header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8 2 5 5.5 5 9c0 3 1.5 5.5 4 6.7V20H8v2h8v-2h-1v-4.3C17.5 14.5 19 12 19 9c0-3.5-3-7-7-7z" fill="rgba(255,255,255,0.9)"/>
        </svg>
        <div>
          <div id="header-text">Vivino Market Prices</div>
          <div id="wine-query"></div>
        </div>
      </div>

      <div id="body">
        <div id="loading">
          <div class="spinner"></div>
          <span>Searching Vivino…</span>
        </div>

        <div id="error">
          <strong>Couldn't load results</strong>
          <span id="error-msg"></span>
        </div>

        <div id="empty">
          <strong>No matches found</strong>
          <span>Vivino returned no results for this wine.</span>
        </div>

        <div id="results"></div>
      </div>

      <div id="footer">
        Prices sourced from <a href="https://www.vivino.com" target="_blank">Vivino</a>
      </div>
    </div>
  `;

  return shadow;
}

function renderStars(rating) {
  if (rating === null || isNaN(rating)) return '—';
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
}

function formatPrice(val) {
  if (val === null || val === undefined) return '—';
  const n = parseFloat(val);
  return isNaN(n) ? '—' : `$${n.toFixed(2)}`;
}

function renderResults(shadow, wines) {
  const loading = shadow.getElementById('loading');
  const empty = shadow.getElementById('empty');
  const results = shadow.getElementById('results');

  loading.style.display = 'none';

  if (!wines || wines.length === 0) {
    empty.style.display = 'flex';
    return;
  }

  results.style.display = 'flex';

  for (const wine of wines) {
    const hasImage = !!wine.imageUrl;
    const hasRating = wine.ratingsAverage !== null && !isNaN(wine.ratingsAverage);
    const medianPrice = formatPrice(wine.pricing && wine.pricing.median);
    const bestPrice = formatPrice(wine.pricing && wine.pricing.best);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-wrap${hasImage ? '' : ' no-img'}">
        ${hasImage ? `<img src="${wine.imageUrl}" alt="${escapeHtml(wine.name)}" loading="lazy">` : ''}
      </div>
      <div class="card-body">
        <div class="card-name">${escapeHtml(wine.name)}</div>
        <div class="card-stats">
          <div class="stat-row">
            <span class="stat-label">Rating</span>
            ${hasRating
              ? `<span class="stars">${renderStars(wine.ratingsAverage)}</span>
                 <span>${wine.ratingsAverage.toFixed(1)}</span>
                 <span class="rating-count">(${Number(wine.ratingsCount).toLocaleString()})</span>`
              : '<span>—</span>'
            }
          </div>
          <div class="stat-row">
            <span class="stat-label">Market avg</span>
            <span class="price-val">${medianPrice}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Best price</span>
            <span class="price-val">${bestPrice}</span>
            <span class="price-sub">online</span>
          </div>
        </div>
        ${wine.wineUrl
          ? `<a class="card-link" href="${wine.wineUrl}" target="_blank">View on Vivino ↗</a>`
          : ''
        }
      </div>
    `;
    results.appendChild(card);
  }
}

function showError(shadow, message) {
  shadow.getElementById('loading').style.display = 'none';
  const errorEl = shadow.getElementById('error');
  errorEl.style.display = 'flex';
  shadow.getElementById('error-msg').textContent = message || '';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Entry point ─────────────────────────────────────────────────────────────

function shouldRun() {
  const href = window.location.href;
  return (
    href === 'https://www.lastbottlewines.com/' ||
    href.startsWith('https://www.lastbottlewines.com/products/') ||
    href.includes('https://www.lastbottlewines.com/product/detail/')
  );
}

async function initialize() {
  if (!shouldRun()) return;
  if (document.getElementById(SIDEBAR_ID)) return;

  const shadow = createSidebar();

  const wineName = extractWineName();
  if (!wineName) {
    showError(shadow, 'Could not detect the wine name on this page.');
    return;
  }

  shadow.getElementById('wine-query').textContent = wineName;

  try {
    const wines = await search(wineName);
    renderResults(shadow, wines);
  } catch (err) {
    showError(shadow, 'Failed to reach the Vivino API.');
    console.error('[Vivino sidebar]', err);
  }
}

// Run on DOM ready; retry on full load in case the page hydrates lazily
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
