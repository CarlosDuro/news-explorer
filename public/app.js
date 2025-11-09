const cfg = window.APP_CONFIG || {};
const API = cfg.API_BASE || 'https://news-explorer-backend-bo7e.onrender.com';

const state = {
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null'),
};

// elementos del header ya existentes en el HTML
const nav = document.querySelector('[data-nav]');
const linkHome = document.querySelector('.link-home');
const linkSaved = document.querySelector('.link-saved');
const guestBox = document.querySelector('[data-auth-guest]');
const userBox = document.querySelector('[data-auth-user]');
const usernameSpan = document.querySelector('[data-username]');
const signInBtn = document.querySelector('[data-signin-btn]');
const logoutBtn = document.querySelector('[data-logout-btn]');

const savedSection = document.querySelector('#saved');
const savedContainer = document.querySelector('[data-saved]');
const resultsSection = document.querySelector('#results');
const heroSection = document.querySelector('.hero');

function persistState() {
  if (state.token) {
    localStorage.setItem('token', state.token);
  } else {
    localStorage.removeItem('token');
  }

  if (state.user) {
    localStorage.setItem('user', JSON.stringify(state.user));
  } else {
    localStorage.removeItem('user');
  }
}

function setAuthUI() {
  const isAuthed = !!state.token;

  if (guestBox) guestBox.style.display = isAuthed ? 'none' : '';
  if (userBox) userBox.style.display = isAuthed ? '' : 'none';
  if (usernameSpan) usernameSpan.textContent = state.user?.name || '';
}

async function api(path, opts = {}) {
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    opts.headers || {}
  );

  if (state.token) {
    headers.Authorization = 'Bearer ' + state.token;
  }

  const res = await fetch(API + path, {
    ...opts,
    headers,
    credentials: 'include',
  });

  // puede no tener body (204)
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }

  if (!res.ok) {
    throw Object.assign(
      new Error(data.message || 'Request error'),
      { status: res.status, data }
    );
  }

  return data;
}

async function handleSignIn() {
  const email = prompt('Email:');
  const password = prompt('Password:');
  if (!email || !password) return;

  try {
    const data = await api('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    state.token = data.token;
    state.user = data.user;
    persistState();
    setAuthUI();
    onRoute(location.hash);
  } catch (err) {
    alert('Login error: ' + err.message);
  }
}

function handleLogout() {
  state.token = '';
  state.user = null;
  persistState();
  setAuthUI();
  // volver al home
  location.hash = '';
}

function setActiveNav(hash) {
  if (!linkHome || !linkSaved) return;

  if (hash === '#saved') {
    linkHome.classList.remove('is-active');
    linkSaved.classList.add('is-active');
  } else {
    linkHome.classList.add('is-active');
    linkSaved.classList.remove('is-active');
  }
}

function renderSaved(items) {
  if (!savedContainer) return;
  savedContainer.innerHTML = '';

  if (!Array.isArray(items) || items.length === 0) {
    savedContainer.innerHTML = '<p>No saved articles.</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';

    card.innerHTML = `
      <div class="card__body">
        <h3>${item.title || 'Sin título'}</h3>
        <p class="meta">${item.source || 'Web'} • ${item.date || ''}</p>
        <p>${item.text || ''}</p>
        <div class="actions">
          <a href="${item.link}" target="_blank" class="btn btn-sm">Read</a>
          <button class="btn-outline btn-sm" data-delete="${item._id}">Delete</button>
        </div>
      </div>
    `;

    const delBtn = card.querySelector('[data-delete]');
    if (delBtn) {
      delBtn.addEventListener('click', async () => {
        try {
          await api('/articles/' + item._id, { method: 'DELETE' });
          await showSaved(); // recargar
        } catch (err) {
          alert('Delete error: ' + err.message);
        }
      });
    }

    savedContainer.appendChild(card);
  });
}

async function showSaved() {
  if (!state.token) {
    savedContainer.innerHTML = '<p>Please sign in to see saved articles.</p>';
    return;
  }

  try {
    const items = await api('/articles');
    renderSaved(items);
  } catch (err) {
    console.error('showSaved error:', err);
    if (savedContainer) {
      savedContainer.innerHTML = '<p>Error loading saved.</p>';
    }
  }
}

function onRoute(hash) {
  const h = hash || '';
  setActiveNav(h);

  if (h === '#saved') {
    if (heroSection) heroSection.style.display = 'none';
    if (resultsSection) resultsSection.style.display = 'none';
    if (savedSection) savedSection.style.display = '';
    showSaved();
  } else {
    if (heroSection) heroSection.style.display = '';
    if (resultsSection) resultsSection.style.display = '';
    if (savedSection) savedSection.style.display = 'none';
  }
}

// listeners
if (signInBtn) signInBtn.addEventListener('click', handleSignIn);
if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
if (linkHome) linkHome.addEventListener('click', (e) => {
  e.preventDefault();
  location.hash = '';
});
if (linkSaved) linkSaved.addEventListener('click', (e) => {
  e.preventDefault();
  location.hash = '#saved';
});

window.addEventListener('hashchange', () => onRoute(location.hash));

// init
setAuthUI();
onRoute(location.hash);
