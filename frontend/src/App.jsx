// src/App.jsx
import { useEffect, useState } from 'react';
import './App.css';

import Header from './components/Header/Header.jsx';
import Footer from './components/Footer/Footer.jsx';
import AuthModal from './components/AuthModal/AuthModal.jsx';
import SuccessModal from './components/SuccessModal/SuccessModal.jsx';
import SearchBar from './components/SearchBar/SearchBar.jsx';
import Results from './components/Results/Results.jsx';
import SavedArticles from './components/SavedArticles/SavedArticles.jsx';
import AboutAuthor from './components/AboutAuthor/AboutAuthor.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const PAGE_SIZE = 3;

// Helper genérico para la API (sin auth)
async function api(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  const res = await fetch(API_BASE + path, {
    ...opts,
    headers,
  });

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }

  if (!res.ok) {
    throw Object.assign(
      new Error(data.message || `Request error (${res.status} ${res.statusText || ''})`),
      {
        status: res.status,
        data,
      }
    );
  }

  return data;
}

function App() {
  /* ---------- AUTH GLOBAL ---------- */
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const isLoggedIn = !!token;

  /* ---------- RUTA SIMPLE (home / saved) ---------- */
  const [currentRoute, setCurrentRoute] = useState('home');

  /* ---------- MODALES AUTH ---------- */
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthSuccessOpen, setIsAuthSuccessOpen] = useState(false);

  /* ---------- ESTADO BÚSQUEDA ---------- */
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  /* ---------- ESTADO ARTÍCULOS GUARDADOS ---------- */
  // mapa: link -> _id del artículo
  const [savedMap, setSavedMap] = useState({});

  const visibleItems = results.slice(0, visibleCount);
  const canShowMore = visibleCount < results.length;

  /* ---------- API con auth ---------- */
  const authedApi = (path, opts = {}) => {
    const headers = { ...(opts.headers || {}) };
    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }
    return api(path, { ...opts, headers });
  };

  const syncSavedFromServer = (items) => {
    const map = {};
    items.forEach((it) => {
      if (it.link && it._id) {
        map[it.link] = it._id;
      }
    });
    setSavedMap(map);
  };

  /* ---------- SINCRONIZAR AUTH CON localStorage ---------- */
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');

    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [token, user]);

  /* ---------- RESTAURAR ÚLTIMA BÚSQUEDA ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('lastSearchReact');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length) {
        setSearchQuery(parsed.query || '');
        setResults(parsed.items);
        setVisibleCount(Math.min(PAGE_SIZE, parsed.items.length));
        setHasSearched(true);
      }
    } catch (e) {
      console.warn('No se pudo restaurar la última búsqueda', e);
    }
  }, []);

  /* ---------- HANDLERS AUTH ---------- */
  const handleSignInClick = () => {
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCurrentRoute('home');
    setSavedMap({});
  };

  const handleNavigate = (route) => {
    if (route === 'saved' && !isLoggedIn) {
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }
    setCurrentRoute(route);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
  };

  const handleCloseAuthSuccess = () => {
    setIsAuthSuccessOpen(false);
  };

  const handleGoLoginFromSuccess = () => {
    setIsAuthSuccessOpen(false);
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  const handleAuthSubmit = async (mode, { email, password, name }) => {
    try {
      if (mode === 'login') {
        const data = await api('/auth/signin', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        setToken(data.token);
        setUser(data.user);

        // Opcional: precargar artículos guardados al iniciar sesión
        try {
          const saved = await api('/articles', {
            headers: { Authorization: 'Bearer ' + data.token },
          });
          const arr = Array.isArray(saved) ? saved : [];
          syncSavedFromServer(arr);
        } catch (e) {
          console.warn('No se pudieron cargar los artículos guardados al iniciar sesión', e);
        }

        setIsAuthOpen(false);
        return { ok: true };
      }

      // register
      await api('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });

      setIsAuthOpen(false);
      setIsAuthSuccessOpen(true);
      return { ok: true };
    } catch (err) {
      console.error(err);
      const msg =
        (err.data && err.data.message) ||
        err.message ||
        'Error en la petición. Inténtalo de nuevo.';
      return { ok: false, error: msg };
    }
  };

  /* ---------- HANDLERS BÚSQUEDA ---------- */
  const handleSearch = async (query) => {
    const q = (query || '').trim();
    if (!q) {
      alert('Por favor, introduzca una palabra clave');
      return;
    }

    setSearchQuery(q);
    setIsSearching(true);
    setSearchError('');
    setHasSearched(true);
    setResults([]);
    setVisibleCount(0);

    try {
      const res = await api('/search?q=' + encodeURIComponent(q));
      const items = Array.isArray(res.items) ? res.items : [];

      setResults(items);
      setVisibleCount(Math.min(PAGE_SIZE, items.length));

      try {
        localStorage.setItem('lastSearchReact', JSON.stringify({ query: q, items }));
      } catch (_) {
        /* ignore */
      }
    } catch (err) {
      console.error(err);
      setSearchError(
        'Lo sentimos, algo ha salido mal durante la solicitud. ' +
          'Es posible que haya un problema de conexión o que el servidor no funcione. ' +
          'Por favor, inténtalo más tarde.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, results.length));
  };

  /* ---------- GUARDAR / ELIMINAR DESDE RESULTADOS ---------- */
  const handleToggleSaveFromSearch = async (item) => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }

    const link = item.link;
    if (!link) return;

    const existingId = savedMap[link];

    if (!existingId) {
      // GUARDAR
      const payload = {
        keyword: item.keyword || searchQuery || 'news',
        title: item.title,
        text: item.text || item.description || 'demo',
        date: item.date || new Date().toISOString().slice(0, 10),
        source: item.source || 'Web',
        link,
        image: item.image || item.urlToImage || 'https://picsum.photos/400',
      };

      try {
        const created = await authedApi('/articles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setSavedMap((prev) => ({
          ...prev,
          [link]: created._id,
        }));
      } catch (err) {
        alert('Save error: ' + (err.message || 'Error al guardar'));
      }
    } else {
      // ELIMINAR
      try {
        await authedApi('/articles/' + existingId, { method: 'DELETE' });
        setSavedMap((prev) => {
          const copy = { ...prev };
          delete copy[link];
          return copy;
        });
      } catch (err) {
        alert('Delete error: ' + (err.message || 'Error al eliminar'));
      }
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="app-root">
      <Header
        isLoggedIn={isLoggedIn}
        userName={user?.name || ''}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onSignInClick={handleSignInClick}
        onLogoutClick={handleLogout}
      />

      <main className="page">
        {currentRoute === 'home' && (
          <>
            <section className="hero">
              <div className="hero__inner">
                <h1>¿Qué está pasando en el mundo?</h1>
                <p>
                  Encuentra las últimas noticias sobre cualquier tema y guárdalas en tu cuenta
                  personal.
                </p>

                <SearchBar
                  initialQuery={searchQuery}
                  onSearch={handleSearch}
                  isLoading={isSearching}
                />
              </div>
            </section>

            <Results
              items={visibleItems}
              totalCount={results.length}
              isLoading={isSearching}
              error={searchError}
              hasSearched={hasSearched}
              onShowMore={handleShowMore}
              canShowMore={canShowMore}
              savedMap={savedMap}
              isLoggedIn={isLoggedIn}
              onToggleSave={handleToggleSaveFromSearch}
            />
          </>
        )}

        {currentRoute === 'saved' && (
          <SavedArticles
            api={authedApi}
            token={token}
            userName={user?.name || ''}
            onSyncSaved={syncSavedFromServer}
          />
        )}
      </main>

      {/* Bloque "Acerca del autor" visible en todas las pantallas */}
      <AboutAuthor />

      {/* Footer visible en todas las pantallas */}
      <Footer />

      {/* Modal login/register */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={handleCloseAuth}
          onSubmit={handleAuthSubmit}
        />
      )}

      {/* Modal de éxito de registro */}
      {isAuthSuccessOpen && (
        <SuccessModal
          isOpen={isAuthSuccessOpen}
          onClose={handleCloseAuthSuccess}
          onGoLogin={handleGoLoginFromSuccess}
        />
      )}
    </div>
  );
}

export default App;
