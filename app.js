const API_BASE =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE) ||
  'https://news-explorer-backend-bo7e.onrender.com';

// estado en memoria
const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
};

// helper de fetch
async function api(path, opts = {}) {
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    opts.headers || {}
  );
  if (state.token) headers.Authorization = 'Bearer ' + state.token;

  const res = await fetch(API_BASE + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error(data.message || 'Request error'),
      { status: res.status, data }
    );
  }
  return data;
}

// actualiza el header EXISTENTE del HTML
function updateAuthUI() {
  const guestBox = document.querySelector('[data-auth-guest]');
  const userBox = document.querySelector('[data-auth-user]');
  const nameSpan = document.querySelector('[data-username]');
  const logoutBar = document.querySelector('[data-logout-bar]');

  const isAuthed = !!state.token;

  if (guestBox) guestBox.style.display = isAuthed ? 'none' : '';
  if (userBox) userBox.style.display = isAuthed ? '' : 'none';
  if (nameSpan) nameSpan.textContent = state.user?.name || '';

  if (logoutBar) logoutBar.style.display = isAuthed ? '' : 'none';

  // toggle clase para estilos globales si la usas
  document.body.classList.toggle('is-authenticated', isAuthed);
}

// login súper simple con prompt (como tenías)
async function handleSignIn() {
  const email = prompt('Email:', 'carlos@example.com');
  const password = prompt('Password:', 'Secret123');
  if (!email || !password) return;

  try {
    const data = await api('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', state.token);
    localStorage.setItem('user', JSON.stringify(state.user));
    updateAuthUI();
    // después de loguear, recarga guardados por si estás en #saved
    if (location.hash === '#saved') {
      showSaved();
    }
  } catch (err) {
    alert('Login error: ' + err.message);
  }
}

function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateAuthUI();
  // vuelve a home
  setRoute('');
}

// resalta el tab correcto y muestra/oculta secciones
function setRoute(hash) {
  const homeLink = document.querySelector('.link-home');
  const savedLink = document.querySelector('.link-saved');
  const resultsSection = document.getElementById('results');
  const savedSection = document.getElementById('saved');

  const isSaved = hash === '#saved';

  if (homeLink) homeLink.classList.toggle('is-active', !isSaved);
  if (savedLink) savedLink.classList.toggle('is-active', isSaved);

  if (resultsSection) resultsSection.style.display = isSaved ? 'none' : '';
  if (savedSection) savedSection.style.display = isSaved ? '' : 'none';

  if (isSaved) {
    showSaved();
  }
}

// obtiene y pinta artículos guardados
async function showSaved() {
  const container = document.querySelector('[data-saved]');
  if (!container) return;
  container.innerHTML = 'Loading...';

  try {
    const items = await api('/articles');
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '<p>No saved articles.</p>';
      return;
    }
    container.innerHTML = '';
    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'news-card';
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p class="meta">${item.source} • ${item.date}</p>
        <p>${item.text}</p>
        <div class="actions">
          <a class="btn-outline" href="${item.link}" target="_blank" rel="noreferrer">Read</a>
          <button class="btn-outline" data-delete="${item._id}">Delete</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<p>Error loading saved.</p>';
    console.error(err);
  }
}

// delega clicks de delete en saved
document.addEventListener('click', async (ev) => {
  const delBtn = ev.target.closest('[data-delete]');
  if (!delBtn) return;
  const id = delBtn.getAttribute('data-delete');
  if (!id) return;

  if (!confirm('Delete this article?')) return;

  try {
    await api('/articles/' + id, { method: 'DELETE' });
    showSaved();
  } catch (err) {
    alert('Delete error: ' + err.message);
  }
});

// listeners iniciales
document.addEventListener('DOMContentLoaded', () => {
  // botones auth
  const signBtn = document.querySelector('[data-signin-btn]');
  const logoutBtn = document.querySelector('[data-logout-btn]');
  const logoutBtn2 = document.querySelector('[data-logout-btn-secondary]');
  if (signBtn) signBtn.addEventListener('click', handleSignIn);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (logoutBtn2) logoutBtn2.addEventListener('click', handleLogout);

  // navegación
  const homeLink = document.querySelector('.link-home');
  const savedLink = document.querySelector('.link-saved');
  if (homeLink) homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = '';
    setRoute('');
  });
  if (savedLink) savedLink.addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = '#saved';
    setRoute('#saved');
  });

  updateAuthUI();
  setRoute(location.hash);
});

// por si cambias el hash manualmente
window.addEventListener('hashchange', () => {
  setRoute(location.hash);
});
