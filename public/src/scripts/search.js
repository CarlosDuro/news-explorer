(function () {
  // Tolera páginas sin data-attrs (usa fallback genérico)
  const form  = document.querySelector('[data-search-form]') ||
                document.querySelector('form');
  const input = document.querySelector('[data-search-input]') ||
                document.querySelector('input[type="search"], input[type="text"]');

  const API = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '';

  function setStatus(txt) {
    const el = document.getElementById('searchStatus');
    if (el) el.textContent = txt || '';
  }

  async function doSearch(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();

    const q = (input && input.value ? input.value : '').trim();
    if (!q) {
      setStatus('');
      window.dispatchEvent(new CustomEvent('news:searched', { detail: { items: [] } }));
      return;
    }

    try {
      setStatus('Searching…');
      const url = `${API}/search?q=${encodeURIComponent(q)}`;
      console.log('[search] GET', url);

      const res  = await fetch(url, { method: 'GET' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw Object.assign(new Error(data?.message || `HTTP ${res.status}`), { status: res.status, data });
      }

      const items = Array.isArray(data?.items) ? data.items : [];
      setStatus(`Found ${items.length} results`);
      window.dispatchEvent(new CustomEvent('news:searched', { detail: { items } }));
    } catch (e) {
      console.error('[search] error:', e);
      setStatus('Search error: ' + (e.message || 'Failed to fetch'));
      window.dispatchEvent(new CustomEvent('news:searched', { detail: { items: [] } }));
    }
  }

  if (form) form.addEventListener('submit', doSearch);
  // Útil para probar desde la consola
  window.__search = doSearch;
})();
