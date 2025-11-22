// src/components/AuthModal/AuthSuccessModal.jsx
import '../../styles/modal.css';
import '../../styles/auth.css';

export default function SuccessModal({ isOpen, onClose, onGoLogin }) {
  if (!isOpen) return null;

  return (
    <div className="modal" aria-hidden={!isOpen}>
      <div className="modal__overlay" data-auth-success-close onClick={onClose} />

      <div
        className="modal__dialog modal__dialog--success"
        role="dialog"
        aria-modal="true"
        aria-labelledby="authSuccessTitle"
      >
        <button
          className="modal__close"
          type="button"
          aria-label="Cerrar"
          data-auth-success-close
          onClick={onClose}
        >
          ×
        </button>

        <div className="modal-success">
          <h2 id="authSuccessTitle" className="modal-success__title">
            ¡El registro se ha completado con éxito!
          </h2>

          <button
            className="modal-success__link"
            type="button"
            data-auth-success-go-login
            onClick={onGoLogin}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
