// src/components/ArticleCard/ArticleCard.jsx
import '../../styles/results.css';

function ArticleCard({ item, isSaved = false, onToggleSave, onDelete }) {
  const { keyword, title, text, description, date, source, link, image } = item;

  const displayText = text || description || '';
  const displaySource = typeof source === 'string' ? source : source?.name || '';
  const displayDate = date || '';

  const hasDelete = typeof onDelete === 'function';
  const canBookmark = !hasDelete && typeof onToggleSave === 'function';

  const handleBookmarkClick = () => {
    if (!canBookmark) return;
    onToggleSave(item);
  };

  const handleDeleteClick = () => {
    if (!hasDelete) return;
    onDelete(item);
  };

  return (
    <article className="news-card">
      {/* Línea superior: keyword + icono (guardar o borrar) */}
      <div className="card-topline">
        {keyword && <span className="card-tag">{keyword}</span>}

        {hasDelete && (
          <button
            className="icon-btn icon-trash"
            type="button"
            onClick={handleDeleteClick}
            aria-label="Eliminar artículo guardado"
          />
        )}

        {canBookmark && (
          <button
            className={`icon-btn icon-bookmark ${isSaved ? 'icon-bookmark--active' : ''}`}
            type="button"
            onClick={handleBookmarkClick}
            aria-label={isSaved ? 'Quitar de guardados' : 'Guardar artículo'}
          />
        )}
      </div>

      {/* Imagen de la noticia */}
      {image && (
        <a href={link} target="_blank" rel="noreferrer" className="news-card__image-link">
          <img src={image} alt={title} className="news-card__image" />
        </a>
      )}

      {/* Fecha */}
      {displayDate && <p className="meta">{displayDate}</p>}

      {/* Título */}
      <h3>{title}</h3>

      {/* Texto / descripción */}
      {displayText && <p>{displayText}</p>}

      {/* Fuente */}
      {displaySource && <p className="meta meta--source">{displaySource}</p>}

      {/* Botón "Read" */}
      <div className="actions">
        {link && (
          <a href={link} target="_blank" rel="noreferrer" className="btn-outline">
            Leer
          </a>
        )}
      </div>
    </article>
  );
}

export default ArticleCard;
