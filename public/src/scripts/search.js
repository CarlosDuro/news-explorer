(function(){
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const out = document.querySelector('[data-search-out]');
  const API = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '';
  const resultsMount = document.getElementById('results');

  function msg(el, html){ if(el) el.innerHTML = html; }
  function setLoading(v){
    const btn = form?.querySelector('button[type="submit"]');
    if(btn){ btn.disabled = v; btn.textContent = v ? 'Searching...' : 'Search'; }
  }

  async function doSearch(q){
    const url = API + '/search?q=' + encodeURIComponent(q);
    const r = await fetch(url);
    const data = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data?.message || 'Search error');
    return data.items || [];
  }

  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const q = (input?.value||'').trim();
      if(!q){
        msg(out, '<p class="hint">Enter a keyword to search news.</p>');
        if(resultsMount) resultsMount.innerHTML = '';
        return;
      }
      setLoading(true);
      msg(out, '<p class="hint">Searching…</p>');
      try{
        const items = await doSearch(q);
        msg(out, `<p class="hint">Found ${items.length} results for "<b>${q}</b>".</p>`);
        window.dispatchEvent(new CustomEvent('news:searched',{detail:{query:q, count:items.length, items}}));
      }catch(err){
        console.error('Search error:', err);
        msg(out, `<p class="hint" style="color:#ef4444">Error: ${err.message}</p>`);
      }finally{
        setLoading(false);
      }
    });
  }
})();
