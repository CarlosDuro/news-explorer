(function(){
  const API = (window.APP_CONFIG||{}).API_BASE || '';

  async function doSearch(q){
    const res = await fetch(API + '/search?q=' + encodeURIComponent(q));
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    window.dispatchEvent(new CustomEvent('news:searched', { detail: items }));
  }

  const form = document.getElementById('searchForm');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const q = (new FormData(form).get('q') || '').toString().trim();
      if(q) doSearch(q);
    });
  }
})();
