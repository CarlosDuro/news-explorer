(function(){
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const out = document.querySelector('[data-search-out]');
  const resultsMount = document.getElementById('results');

  function setLoading(v){
    const btn = form?.querySelector('button[type="submit"]');
    if(btn){ btn.disabled = v; btn.textContent = v ? 'Searching...' : 'Search'; }
  }

  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const q = (input?.value||'').trim();
      if(!q){
        if(out) out.innerHTML = '<p class="hint">Enter a keyword to search news.</p>';
        if(resultsMount) resultsMount.innerHTML = '';
        return;
      }
      setLoading(true);
      try{
        // DEMO: resultados simulados. Luego se cambiará a fetch real al middleware.
        await new Promise(r=>setTimeout(r,600));
        const fake = Array.from({length:6}).map((_,i)=>({
          title:`${q}: headline #${i+1}`,
          source:'Demo',
          date:new Date().toISOString().slice(0,10),
          href:'https://example.com',
          text:'Lorem ipsum dolor sit amet...'
        }));
        if(out) out.innerHTML = '';
        // Emitimos con items para que app.js renderice
        window.dispatchEvent(new CustomEvent('news:searched',{detail:{query:q, count:fake.length, items: fake}}));
      }catch(err){
        if(out) out.innerHTML = '<p class="hint">Oops, something went wrong. Try again.</p>';
        console.error(err);
      }finally{
        setLoading(false);
      }
    });
  }
})();
