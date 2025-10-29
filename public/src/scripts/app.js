(function(){
  const cfg = window.APP_CONFIG || {};
  const API = cfg.API_BASE || '';
  const state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null')
  };

  function setAuth(auth){
    state.token = auth?.token || null;
    state.user  = auth?.user  || null;
    if(state.token) localStorage.setItem('token', state.token); else localStorage.removeItem('token');
    if(state.user)  localStorage.setItem('user', JSON.stringify(state.user)); else localStorage.removeItem('user');
    renderHeader();
  }

  async function api(path, opts={}){
    const headers = Object.assign({'Content-Type':'application/json'}, (opts.headers||{}));
    if(state.token) headers['Authorization'] = 'Bearer '+state.token;
    const res = await fetch(API+path, { ...opts, headers });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw Object.assign(new Error(data.message || 'Request error'), {status:res.status, data});
    return data;
  }

  function renderHeader(){
    const body = document.body;
    if(state.token){ body.classList.add('is-authenticated'); } else { body.classList.remove('is-authenticated'); }
    const nameSpan = document.querySelector('.auth.auth--user span');
    if(nameSpan && state.user?.name) nameSpan.textContent = state.user.name;
  }

  async function handleSignIn(){
    const email = prompt('Email:');
    const pass  = prompt('Password:');
    if(!email || !pass) return;
    try{
      const data = await api('/auth/signin', {method:'POST', body: JSON.stringify({ email, password: pass })});
      setAuth({ token: data.token, user: data.user });
      alert('Signed in: '+(data.user?.email||''));
    }catch(e){ alert('Signin error: '+(e.data?.message||e.message)); }
  }

  async function handleSignUp(){
    const name = prompt('Name:');
    const email = prompt('Email:');
    const pass  = prompt('Password (min 6):');
    if(!name||!email||!pass) return;
    try{
      const data = await api('/auth/signup', {method:'POST', body: JSON.stringify({ name, email, password: pass })});
      alert('User created: '+(data?.email||email)+'\nAhora inicia sesión.');
    }catch(e){ alert('Signup error: '+(e.data?.message||e.message)); }
  }

  function handleLogout(){ setAuth(null); }

  function renderResults(items){
    const mount = document.getElementById('results');
    if(!mount) return;
    if(!Array.isArray(items) || items.length===0){
      mount.innerHTML = '<p class="text-muted">No results.</p>';
      return;
    }
    mount.innerHTML = items.map((it,idx)=>`
      <article class="card">
        <h3>${escapeHtml(it.title||'Untitled')}</h3>
        <div class="meta">${escapeHtml(it.source||'Source')} • ${escapeHtml(it.date||'')}</div>
        ${it.text ? `<p>${escapeHtml(it.text)}</p>` : ''}
        <div class="actions">
          <a class="btn-outline" href="${it.href||it.link||'#'}" target="_blank" rel="noopener">Read</a>
          ${state.token ? `<button class="btn" data-save="${idx}">Save</button>` : ''}
        </div>
      </article>
    `).join('');

    if(state.token){
      mount.querySelectorAll('button[data-save]').forEach(btn=>{
        btn.addEventListener('click', async ()=>{
          const i = +btn.getAttribute('data-save');
          const it = items[i];
          try{
            await api('/articles', {
              method:'POST',
              body: JSON.stringify({
                keyword: (it.keyword||'news'),
                title: it.title || 'Untitled',
                text:  it.text  || '',
                date:  it.date  || new Date().toISOString().slice(0,10),
                source: it.source|| 'Web',
                link:  it.href  || it.link || 'https://example.com',
                image: it.image || 'https://picsum.photos/400'
              })
            });
            alert('Saved!');
          }catch(e){ alert('Save error: '+(e.data?.message||e.message)); }
        });
      });
    }
  }

  async function showSaved(){
    document.getElementById('savedView')?.classList.add('active');
    const list = document.getElementById('savedList');
    if(!state.token){ list.innerHTML='<p>Sign in to view saved articles.</p>'; return; }
    try{
      const data = await api('/articles');
      if(!data.length){ list.innerHTML='<p>No saved articles.</p>'; return; }
      list.innerHTML = data.map(a=>`
        <article class="card">
          <h3>${escapeHtml(a.title||'Untitled')}</h3>
          <div class="meta">${escapeHtml(a.source||'')} • ${escapeHtml(a.date||'')}</div>
          <div class="actions">
            <a class="btn-outline" href="${a.link}" target="_blank" rel="noopener">Read</a>
            <button class="btn-outline" data-del="${a._id}">Delete</button>
          </div>
        </article>
      `).join('');
      list.querySelectorAll('button[data-del]').forEach(btn=>{
        btn.addEventListener('click', async ()=>{
          const id = btn.getAttribute('data-del');
          try{ await api('/articles/'+id, {method:'DELETE'}); btn.closest('.card')?.remove(); }
          catch(e){ alert('Delete error: '+(e.data?.message||e.message)); }
        });
      });
    }catch(e){ list.innerHTML='<p>Error loading saved.</p>'; console.error(e); }
  }
  function hideSaved(){ document.getElementById('savedView')?.classList.remove('active'); }

  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

  function wireHeader(){
    const btnSignin = document.querySelector('.auth.auth--guest .btn-outline, .auth.auth--guest .btn');
    const btnLogout = document.querySelector('.auth.auth--user .btn, .auth.auth--user .btn-outline');
    const linkSaved = document.querySelector('.link-saved');
    if(btnSignin) btnSignin.onclick = async ()=>{
      const mode = confirm('OK = Sign in, Cancel = Sign up');
      if(mode) await handleSignIn(); else await handleSignUp();
    };
    if(btnLogout) btnLogout.onclick = handleLogout;
    if(linkSaved){
      linkSaved.addEventListener('click', (e)=>{
        e.preventDefault();
        location.hash = '#saved';
      });
    }
  }

  function onRoute(){ if(location.hash === '#saved') showSaved(); else hideSaved(); }

  window.addEventListener('news:searched', (e)=> renderResults(e.detail?.items||e.detail||[]));
  window.addEventListener('hashchange', onRoute);

  renderHeader();
  wireHeader();
  onRoute();
})();
