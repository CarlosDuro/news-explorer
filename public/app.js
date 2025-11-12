const API_BASE =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE) ||
  'https://news-explorer-backend-bo7e.onrender.com';

const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
};

async function api(path, opts) {
  const options = opts || {};
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {}
  );
  if (state.token) {
    headers['Authorization'] = 'Bearer ' + state.token;
  }
  const res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }
  if (!res.ok) {
    throw Object.assign(new Error(data.message || 'Request error'), {
      status: res.status,
      data: data,
    });
  }
  return data;
}

function updateAuthUI() {
  const guestBox = document.querySelector('[data-auth-guest]');
  const userBox = document.querySelector('[data-auth-user]');
  const nameSpan = document.querySelector('[data-username]');
  const logoutBar = document.querySelector('[data-logout-bar]');
  const isAuthed = !!state.token;

  if (guestBox) guestBox.style.display = isAuthed ? 'none' : '';
  if (userBox) userBox.style.display = isAuthed ? '' : 'none';
  if (nameSpan) nameSpan.textContent = (state.user && state.user.name) ? state.user.name : '';
  if (logoutBar) logoutBar.style.display = isAuthed ? '' : 'none';
  document.body.classList.toggle('is-authenticated', isAuthed);
}
async function handleSignIn() {
  const email = prompt('Email:', 'carlos@example.com');
  const password = prompt('Password:', 'Secret123');
  if (!email || !password) return;

  try {
    const data = await api('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password }),
    });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', state.token);
    localStorage.setItem('user', JSON.stringify(state.user));
    updateAuthUI();
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
  setRoute('');
}

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
    items.forEach(function (item) {
      const card = document.createElement('article');
      card.className = 'news-card';
      card.innerHTML =
        '<h3>' + item.title + '</h3>' +
        '<p class="meta">' + item.source + ' • ' + item.date + '</p>' +
        '<p>' + item.text + '</p>' +
        '<div class="actions">' +
          '<a class="btn-outline" href="' + item.link + '" target="_blank" rel="noreferrer">Read</a>' +
          '<button class="btn-outline" data-delete="' + item._id + '">Delete</button>' +
        '</div>';
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<p>Error loading saved.</p>';
    console.error(err);
  }
}
function renderSearchResults(list) {
  const container = document.querySelector('[data-results]');
  const countEl = document.getElementById('resultsCount');
  if (!container) return;

  container.innerHTML = '';
  if (countEl) countEl.textContent = list.length + ' results';

  list.forEach(function (item) {
    const card = document.createElement('article');
    card.className = 'news-card';

    const kw = item.keyword || '';
    const img = item.image || '';

    card.innerHTML =
      '<h3>' + item.title + '</h3>' +
      '<p class="meta">' + item.source + ' • ' + item.date + '</p>' +
      '<p>' + item.text + '</p>' +
      '<div class="actions">' +
        '<a class="btn-outline" href="' + item.link + '" target="_blank" rel="noreferrer">Read</a>' +
        '<button ' +
          'class="btn-primary" ' +
          'data-save="1" ' +
          'data-kw="' + kw + '" ' +
          'data-title="' + item.title + '" ' +
          'data-text="' + item.text + '" ' +
          'data-date="' + item.date + '" ' +
          'data-source="' + item.source + '" ' +
          'data-link="' + item.link + '" ' +
          'data-image="' + img + '"' +
        '>Save</button>' +
      '</div>';

    container.appendChild(card);
  });
}

async function doSearch(q) {
  const res = await api('/search?q=' + encodeURIComponent(q));
  const items = Array.isArray(res.items) ? res.items : [];
  renderSearchResults(items);
}
document.addEventListener('click', async function (ev) {
  const delBtn = ev.target.closest('[data-delete]');
  if (delBtn) {
    const id = delBtn.getAttribute('data-delete');
    if (!id) return;
    if (!confirm('Delete this article?')) return;
    try {
      await api('/articles/' + id, { method: 'DELETE' });
      showSaved();
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
    return;
  }

  const saveBtn = ev.target.closest('[data-save]');
  if (saveBtn) {
    if (!state.token) {
      alert('Please sign in first.');
      return;
    }
    const payload = {
      keyword: saveBtn.getAttribute('data-kw') || '',
      title: saveBtn.getAttribute('data-title') || '',
      text: saveBtn.getAttribute('data-text') || '',
      date: saveBtn.getAttribute('data-date') || '',
      source: saveBtn.getAttribute('data-source') || '',
      link: saveBtn.getAttribute('data-link') || '',
      image: saveBtn.getAttribute('data-image') || '',
    };
    try {
      await api('/articles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      alert('Article saved');
    } catch (err) {
      alert('Save error: ' + err.message);
    }
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const signBtn = document.querySelector('[data-signin-btn]');
  const logoutBtn = document.querySelector('[data-logout-btn]');
  const logoutBtn2 = document.querySelector('[data-logout-btn-secondary]');
  if (signBtn) signBtn.addEventListener('click', handleSignIn);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (logoutBtn2) logoutBtn2.addEventListener('click', handleLogout);

  const homeLink = document.querySelector('.link-home');
  const savedLink = document.querySelector('.link-saved');
  if (homeLink) homeLink.addEventListener('click', function (e) {
    e.preventDefault();
    location.hash = '';
    setRoute('');
  });
  if (savedLink) savedLink.addEventListener('click', function (e) {
    e.preventDefault();
    location.hash = '#saved';
    setRoute('#saved');
  });

  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  if (form && input) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      doSearch(q);
    });
  }

  updateAuthUI();
  setRoute(location.hash || '');
});

window.addEventListener('hashchange', function () {
  setRoute(location.hash || '');
});
// --- patch: save con valores por defecto ---
document.addEventListener('click', async function (ev) {
  // borrar
  const delBtn = ev.target.closest('[data-delete]');
  if (delBtn) {
    const id = delBtn.getAttribute('data-delete');
    if (!id) return;
    if (!confirm('Delete this article?')) return;
    try {
      await api('/articles/' + id, { method: 'DELETE' });
      showSaved();
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
    return;
  }

  // guardar
  const saveBtn = ev.target.closest('[data-save]');
  if (saveBtn) {
    if (!state.token) {
      alert('Please sign in first.');
      return;
    }
 // lo que vino de la card
    const payload = {
      keyword: saveBtn.getAttribute('data-kw') || '',
      title:   saveBtn.getAttribute('data-title') || '',
      text:    saveBtn.getAttribute('data-text') || '',
      date:    saveBtn.getAttribute('data-date') || '',
      source:  saveBtn.getAttribute('data-source') || '',
      link:    saveBtn.getAttribute('data-link') || '',
      image:   saveBtn.getAttribute('data-image') || '',
    };

    // --- aquí metemos defaults para que NO falle el validateArticle ---
    if (!payload.date) {
      // yyyy-mm-dd
      payload.date = new Date().toISOString().slice(0, 10);
    }
    if (!payload.source) {
      payload.source = 'Web';
    }
    if (!payload.image) {
      payload.image = 'https://picsum.photos/400';
    }
    if (!payload.text) {
      payload.text = 'demo';
    }
    if (!payload.keyword) {
      // usa el valor que está en el input de búsqueda si existe
      const q = document.querySelector('[data-search-input]')?.value || '';
      payload.keyword = q || 'news';
    }

  try {
      await api('/articles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      alert('Article saved');
    } catch (err) {
      alert('Save error: ' + err.message);
    }
  }
});
/* --- override de guardado con defaults (se ejecuta antes que el viejo) --- */
document.addEventListener('click', async function (ev) {
  const btn = ev.target.closest('[data-save]');
  if (!btn) return;

  // lo manejamos aquí y no dejamos que lleguen los otros listeners
  ev.stopPropagation();
  ev.preventDefault();

  if (!state.token) {
    alert('Please sign in first.');
    return;
  }

  // 1. leer lo que venía en data-save
  let item = {};
  const raw = btn.getAttribute('data-save');
  if (raw) {
    try {
      item = JSON.parse(raw);
    } catch (e) {
      item = {};
    }
  }

  // 2. intentar tomar la palabra buscada como keyword
  const qInput = document.querySelector('[data-search-input]');
  const q = qInput ? qInput.value.trim() : '';

  // 3. armar payload completo con defaults
  const payload = {
    keyword: item.keyword || q || 'news',
    title: item.title || 'Untitled',
    text: item.text || 'demo',
    date: item.date || new Date().toISOString().slice(0, 10),
    source: item.source || 'Web',
    link: item.link || 'https://example.com',
    image: item.image || 'https://picsum.photos/400',
  };

  try {
    await api('/articles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    alert('Article saved');
  } catch (err) {
    alert('Save error: ' + err.message);
  }
}, true);
