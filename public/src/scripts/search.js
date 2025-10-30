(function(){
  const form  = document.querySelector('#searchForm') || document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const cnt   = document.getElementById('resultsCount');
  const API   = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '';

  function setStatus(t){ if (cnt) cnt.textContent = t; }

  async function doSearch(q){
    const query = (q ?? (input && input.value) ?? '').trim();
    if(!query){ setStatus(''); window.dispatchEvent(new CustomEvent('news:searched',{detail:{items:[]}})); return; }
    const url = API + '/search?q=' + encodeURIComponent(query);
    console.log('[search] GET', url);
    setStatus('Searching…');
    try{
      const res = await fetch(url);
      const data = await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(data?.message || ('HTTP '+res.status));
      const items = Array.isArray(data?.items) ? data.items : [];
      setStatus(`Found ${items.length} results for "${query}"`);
      window.dispatchEvent(new CustomEvent('news:searched',{detail:{items}}));
    }catch(e){
      console.error('[search] error:', e);
      setStatus('Search error: '+ e.message);
      window.dispatchEvent(new CustomEvent('news:searched',{detail:{items:[]}}));
    }
  }

  if (form){
    form.addEventListener('submit', (ev)=>{ ev.preventDefault(); doSearch(); });
  } else {
    console.warn('[search] no form found');
  }

  // exposición para probar desde consola
  window.__search = { doSearch };
})();
