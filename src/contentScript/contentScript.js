import search from './api/search';

const SIDEBAR_WIDTH = '300px';
const SIDEBAR_ID = 'vivino-sidebar-host';

console.log('[Vivino] Content script loaded on', window.location.href);

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

      #notice {
        flex-shrink: 0;
        padding: 8px 12px;
        background: #fdf8f0;
        border-bottom: 1px solid #f0e6d0;
        font-size: 11px;
        color: #999;
        line-height: 1.5;
      }

    </style>

    <div id="panel">
      <div id="header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L14.83 9.17L21 12L14.83 14.83L12 21L9.17 14.83L3 12L9.17 9.17Z" fill="rgba(255,255,255,0.95)"/>
          <path d="M20 1.5L20.71 3.29L22.5 4L20.71 4.71L20 6.5L19.29 4.71L17.5 4L19.29 3.29Z" fill="rgba(255,255,255,0.85)"/>
          <path d="M4 17L4.57 18.43L6 19L4.57 19.57L4 21L3.43 19.57L2 19L3.43 18.43Z" fill="rgba(255,255,255,0.75)"/>
        </svg>
        <div>
          <div id="header-text">Market Prices</div>
          <div id="wine-query"></div>
        </div>
      </div>

      <div id="notice">
        Results are auto-matched — give them a quick look to confirm they're the right wine before comparing prices.
      </div>

      <div id="body">
        <div id="loading">
          <div class="spinner"></div>
          <span>Searching…</span>
        </div>

        <div id="error">
          <strong>Couldn't load results</strong>
          <span id="error-msg"></span>
        </div>

        <div id="empty">
          <strong>No matches found</strong>
          <span>No results found for this wine.</span>
        </div>

        <div id="results"></div>
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
  const { pathname } = window.location;
  const result = (
    pathname === '/' ||
    pathname.startsWith('/products/') ||
    pathname.startsWith('/product/detail/')
  );
  console.log('[Vivino] shouldRun check — pathname:', pathname, '→', result);
  return result;
}

async function initialize() {
  console.log('[Vivino] initialize() called, readyState:', document.readyState);

  if (!shouldRun()) return;
  if (document.getElementById(SIDEBAR_ID)) {
    console.log('[Vivino] Sidebar already present, skipping.');
    return;
  }

  const shadow = createSidebar();
  console.log('[Vivino] Sidebar created.');

  const wineName = extractWineName();
  console.log('[Vivino] Wine name detected:', wineName);

  if (!wineName) {
    showError(shadow, 'Could not detect the wine name on this page.');
    return;
  }

  shadow.getElementById('wine-query').textContent = wineName;

  try {
    console.log('[Vivino] Searching for:', wineName);
    const wines = await search(wineName);
    console.log('[Vivino] Search returned', wines && wines.length, 'results.');
    renderResults(shadow, wines);
  } catch (err) {
    showError(shadow, 'Failed to reach the Vivino API.');
    console.error('[Vivino] Search error:', err);
  }
}

// Run on DOM ready; also listen for load in case Shopify hydrates content lazily
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
