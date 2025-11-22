// src/components/SavedArticles/SavedArticles.jsx
import { useEffect, useState } from 'react';
import '../../styles/results.css';
import ArticleCard from '../ArticleCard/ArticleCard.jsx';

function buildKeywordsSummary(items) {
  const counts = {};

  items.forEach((item) => {
    const kw = (item.keyword || '').trim();
    if (!kw) return;
    counts[kw] = (counts[kw] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([kw]) => kw);

  if (!sorted.length) return '';
  if (sorted.length === 1) return sorted[0];
  if (sorted.length === 2) return `${sorted[0]}, ${sorted[1]}`;

  const rest = sorted.length - 2;
  return `${sorted[0]}, ${sorted[1]} y ${rest} más`;
}

function SavedArticles({ api, token, userName, onSyncSaved }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSaved() {
      if (!token) {
        setError('Inicia sesión para ver tus artículos guardados.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const data = await api('/articles');
        const arr = Array.isArray(data) ? data : [];

        if (!cancelled) {
          setItems(arr);
          onSyncSaved && onSyncSaved(arr);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('No se pudieron cargar los artículos guardados.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSaved();

    // se ejecuta SOLO cuando cambia el token
    return () => {
      cancelled = true;
    };
  }, [token]); // 👈 sólo depende del token

  const total = items.length;
  const keywordsSummary = buildKeywordsSummary(items);

  const handleDelete = async (articleId) => {
    if (!window.confirm('¿Eliminar este artículo guardado?')) return;

    try {
      await api(`/articles/${articleId}`, { method: 'DELETE' });

      setItems((prev) => {
        const next = prev.filter((it) => it._id !== articleId);
        onSyncSaved && onSyncSaved(next);
        return next;
      });
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el artículo.');
    }
  };

  return (
    <section className="saved" id="saved">
      <div className="saved__inner">
        {/* ENCABEZADO ESTILO FIGMA */}
        <header className="saved__header">
          <p className="saved__section-label">Artículos guardados</p>

          <h2 className="saved__title">
            {userName
              ? `${userName}, tienes ${total} artículo${
                  total === 1 ? '' : 's'
                } guardado${total === 1 ? '' : 's'}.`
              : `Tienes ${total} artículo${
                  total === 1 ? '' : 's'
                } guardado${total === 1 ? '' : 's'}.`}
          </h2>

          {keywordsSummary && (
            <p className="saved__keywords">
              Por palabras clave: <span>{keywordsSummary}</span>
            </p>
          )}
        </header>

        {/* ESTADOS */}
        {isLoading && <p className="results-status">Loading saved articles…</p>}

        {!isLoading && error && <p className="results-status results-status--error">{error}</p>}

        {!isLoading && !error && !items.length && (
          <p className="results-status">No tienes artículos guardados todavía.</p>
        )}

        {/* GRID */}
        {!isLoading && !error && !!items.length && (
          <div className="cards">
            {items.map((item) => (
              <ArticleCard
                key={item._id || item.link}
                item={item}
                isSaved
                isLoggedIn={!!token}
                onDelete={() => handleDelete(item._id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default SavedArticles;
