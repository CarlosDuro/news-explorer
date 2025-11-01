(function(){
  const cfg = window.APP_CONFIG || {};
  const API = cfg.API_BASE || '';
  const state = {
    token: localStorage.getItem('token') || null,
    user:  JSON.parse(localStorage.getItem('user') || 'null')
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

    const res  = await fetch(API+path, { ...opts, headers }).catch((e)=>{ throw Object.assign(new Error('Network error'), {cause:e}); });
    let data  = null;
    const txt = await res.text().catch(()=>null);
    try { data = txt ? JSON.parse(txt) : null; } catch(_) { data = null; }

    if(!res.ok){
      // Mensaje “bonito”
      const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
      const err = Object.assign(new Error(msg), {status: res.status, data});

      // Si credenciales inválidas: forzar logout para evitar “Save error” confuso
      if(res.status === 401 || res.status === 403){
        setAuth(null);
      }
      throw err;
    }
    return (data ?? {});
  }

  function renderHeader(){
    const body = document.body;
    if(state.token){ body.classList.add('is-authenticated'); } else { body.classList.remove('is-authenticated'); }
    const nameSpan = document.querySelector('.auth.auth--user span');
    if(nameSpan) nameSpan.textContent = state.user?.name || '';
  }

  async function handleSignIn(){
    const email = prompt('Email:');
    const pass  = prompt('Password:');
    if(!email || !pass) return;
    try{
      const data = await api('/auth/signin', {method:'POST', body: JSON.stringify({ email, password: pass })});
      setAuth({ token: data.token, user: data.user });
      alert('Signed in: '+(data.user?.email||''));
    }catch(e){
      alert('Signin error: ' + (e.message || 'Unknown error'));
    }
  }

  async function handleSignUp(){
    const name  = prompt('Name:');
    const email = prompt('Email:');
    const pass  = prompt('Password (min 6):');
    if(!name||!email||!pass) return;
    try{
      await api('/auth/signup', {method:'POST', body: JSON.stringify({ name, email, password: pass })});
      alert('User created. Now sign in.');
    }catch(e){ alert('Signup error: ' + (e.message || 'Unknown error')); }
  }

  function handleLogout(){ setAuth(null); }

  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

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
          if(!state.token){ alert('Please sign in first.'); return; }

          btn.disabled = true;
          const prevText = btn.textContent;
          btn.textContent = 'Saving...';

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
            btn.textContent = 'Saved';
          }catch(e){
            // Mensaje claro
            const msg = e?.message || 'Request error';
            alert('Save error: ' + msg);
            btn.textContent = prevText;
          }finally{
            btn.disabled = false;
          }
        });
      });
    }
  }

  async function showSaved(){
    const view = document.getElementById('savedView');
    const list = document.getElementById('savedList');
    view?.classList.add('active');
    if(!list) return;

    if(!state.token){
      list.innerHTML='<p>Sign in to view saved articles.</p>';
      return;
    }

    try{
      const data = await api('/articles');
      if(!Array.isArray(data) || data.length===0){
        list.innerHTML='<p>No saved articles.</p>';
        return;
      }
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
          btn.disabled = true;
          try{
            await api('/articles/'+id, {method:'DELETE'});
            btn.closest('.card')?.remove();
          }catch(e){
            alert('Delete error: ' + (e.message || 'Unknown error'));
          }finally{
            btn.disabled = false;
          }
        });
      });
    }catch(e){
      const msg = (e.status===401||e.status===403) ? 'Please sign in again.' : (e.message || 'Unknown error');
      list.innerHTML = `<p>Error loading saved: ${escapeHtml(msg)}</p>`;
    }
  }

  function hideSaved(){ document.getElementById('savedView')?.classList.remove('active'); }

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

  // init
  renderHeader();
  wireHeader();
  onRoute();
})();
