// src/components/Header/Header.jsx
import '../styles/Header.css';

export default function Header({
  isLoggedIn,
  userName,
  currentRoute,
  onNavigate,
  onSignInClick,
  onLogoutClick,
}) {
  const handleHomeClick = (e) => {
    e.preventDefault();
    onNavigate('home');
  };

  const handleSavedClick = (e) => {
    e.preventDefault();
    onNavigate('saved');
  };

  const displayName = userName || 'Usuario';
  const isHome = currentRoute === 'home';

  return (
    <header className={`site-header ${isHome ? 'site-header--over-hero' : ''}`}>
      <div className="site-header-inner">
        {/* Marca / logo */}
        <div className="brand">NewsExplorer</div>

        {/* Navegación principal (centro-derecha) */}
        <nav className="mainnav" data-nav>
          <a
            href="#"
            className={`link-home ${currentRoute === 'home' ? 'is-active' : ''}`}
            onClick={handleHomeClick}
          >
            Inicio
          </a>

          {isLoggedIn && (
            <a
              href="#saved"
              className={`link-saved ${currentRoute === 'saved' ? 'is-active' : ''}`}
              onClick={handleSavedClick}
            >
              Artículos guardados
            </a>
          )}
        </nav>

        {/* Zona de auth (a la derecha del menú) */}
        {!isLoggedIn && (
          <div className="auth auth--guest" data-auth-guest>
            <button className="btn-outline" type="button" onClick={onSignInClick}>
              Iniciar sesión
            </button>
          </div>
        )}

        {isLoggedIn && (
          <div className="auth auth--user" data-auth-user>
            <button
              className="auth-user-pill"
              type="button"
              onClick={onLogoutClick}
              title="Cerrar sesión"
            >
              <span className="auth-user-pill__name">{displayName}</span>
              <span className="auth-user-pill__icon">↗</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
