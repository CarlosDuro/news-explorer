(function(){
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const out = document.querySelector('[data-search-out]');
  const API = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || '';

  function setLoading(v){
    const btn = form?.querySelector('button[type="submit"]');
    if(btn){ btn.disabled = v; btn.textContent = v ? 'Searching...' : 'Search'; }
  }

  async function doSearch(q){
    const url = API + '/search?q=' + encodeURIComponent(q);
    const r = await fetch(url);
    const data = await r.json();
    if(!r.ok) throw new Error(data?.message || 'Search error');
    return data.items || [];
  }

  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const q = (input?.value||'').trim();
      if(!q){ out && (out.innerHTML = '<p class="hint">Enter a keyword to search news.</p>'); return; }
      setLoading(true);
      try{
        const items = await doSearch(q);
        out && (out.innerHTML = '');
        window.dispatchEvent(new CustomEvent('news:searched',{detail:{query:q, count:items.length, items}}));
      }catch(err){
        out && (out.innerHTML = '<p class="hint">Oops, something went wrong. Try again.</p>');
        console.error(err);
      }finally{
        setLoading(false);
      }
    });
  }
})();
