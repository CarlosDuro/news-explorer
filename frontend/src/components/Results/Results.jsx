// src/components/Results/Results.jsx
import '../../styles/results.css';
import ArticleCard from '../ArticleCard/ArticleCard.jsx';

function Results({
  items,
  totalCount,
  isLoading,
  error,
  hasSearched,
  onShowMore,
  canShowMore,
  savedMap = {},
  isLoggedIn,
  onToggleSave,
}) {
  // Si nunca se ha buscado nada, no mostramos el bloque
  if (!hasSearched && !isLoading && !error) {
    return null;
  }

  const hasItems = items && items.length > 0;

  return (
    <section className="results" id="results">
      <div className="results__inner">
        {/* Cabecera como en Figma */}
        <header className="results__header">
          <h2 className="results__title">Resultados de la búsqueda</h2>

          <p id="resultsCount" className="results__subtitle">
            {!isLoading && !error && totalCount > 0 ? `${totalCount} resultados` : ''}
          </p>
        </header>

        {/* Mensajes de estado */}
        {isLoading && (
          <p id="resultsStatus" className="results-status">
            Buscando noticias...
          </p>
        )}

        {!!error && !isLoading && (
          <p id="resultsStatus" className="results-status results-status--error">
            {error}
          </p>
        )}

        {!isLoading && !error && hasSearched && totalCount === 0 && (
          <p id="resultsStatus" className="results-status">
            No se ha encontrado nada
          </p>
        )}

        {/* Cards */}
        {!isLoading && !error && hasItems && (
          <>
            <div className="cards" data-results>
              {items.map((item) => (
                <ArticleCard
                  key={item.link || item.title}
                  item={item}
                  isSaved={!!savedMap[item.link]}
                  isLoggedIn={isLoggedIn}
                  onToggleSave={() => onToggleSave && onToggleSave(item)}
                />
              ))}
            </div>

            {/* Botón "Ver más" centrado */}
            {canShowMore && (
              <div className="results__more">
                <button
                  className="btn results__more-btn"
                  id="showMoreBtn"
                  type="button"
                  onClick={onShowMore}
                >
                  Ver más
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Results;
