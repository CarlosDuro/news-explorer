// src/components/Footer/Footer.jsx
import '../../styles/Header.css'; // reutilizamos los estilos del header para el footer

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-left">
          <span>© {year} Carlos Durán</span>
          <span className="site-footer-separator">·</span>
          <span>NewsExplorer · Powered by NewsAPI.org</span>
        </div>

        <nav className="site-footer-right">
          <a href="/" className="site-footer-link">
            Inicio
          </a>

          <a
            href="https://practicum.com"
            className="site-footer-link"
            target="_blank"
            rel="noreferrer"
          >
            Practicum
          </a>

          <a
            href="https://github.com/CarlosDuro/news-explorer-frontend"
            className="site-footer-link"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
