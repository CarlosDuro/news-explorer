// src/components/AuthModal/AuthModal.jsx
import { useEffect, useState } from 'react';
import '../../styles/modal.css';
import '../../styles/auth.css';

function validateFields(mode, { email, password, name }) {
  const errors = {};

  if (!email) {
    errors.email = 'El email es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Introduce un email válido.';
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria.';
  } else if (password.length < 6) {
    errors.password = 'Mínimo 6 caracteres.';
  }

  if (mode === 'register') {
    if (!name) {
      errors.name = 'El nombre es obligatorio.';
    } else if (name.length < 2) {
      errors.name = 'Mínimo 2 caracteres.';
    }
  }

  return errors;
}

export default function AuthModal({ isOpen, mode, onModeChange, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset cuando cambia modo o se abre
  useEffect(() => {
    if (!isOpen) return;
    setEmail('');
    setPassword('');
    setName('');
    setErrors({});
    setServerError('');
  }, [isOpen, mode]);

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;

    const handler = (ev) => {
      if (ev.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleChangeMode = (nextMode) => {
    if (nextMode === mode) return;
    onModeChange(nextMode);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');

    const nextErrors = validateFields(mode, { email, password, name });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await onSubmit(mode, { email, password, name });
    setIsSubmitting(false);

    if (!result.ok) {
      setServerError(result.error || 'Error en la petición. Inténtalo de nuevo.');
    }
  };

  const hasClientErrors = Object.keys(errors).length > 0;
  const isFormValid = !hasClientErrors && email && password && (mode === 'login' || name);

  return (
    <div className="modal" aria-hidden={!isOpen}>
      <div className="modal__overlay" data-modal-backdrop onClick={onClose} />

      <div
        className="modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="authModalTitle"
      >
        <button className="modal__close" type="button" aria-label="Cerrar" onClick={onClose}>
          ×
        </button>

        <div className="modal__tabs">
          <button
            type="button"
            className={`modal__tab ${mode === 'login' ? 'modal__tab--active' : ''}`}
            onClick={() => handleChangeMode('login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`modal__tab ${mode === 'register' ? 'modal__tab--active' : ''}`}
            onClick={() => handleChangeMode('register')}
          >
            Inscribirse
          </button>
        </div>

        <h2 id="authModalTitle" className="modal__title">
          {mode === 'login' ? 'Iniciar sesión' : 'Inscribirse'}
        </h2>

        {serverError && <p className="modal__message modal__message--error">{serverError}</p>}

        <form className="modal__form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <label className="modal__field">
            <span className="modal__label">Correo electrónico</span>
            <input
              className="modal__input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              autoComplete="email"
              required
            />
            {errors.email && <span className="modal__error">{errors.email}</span>}
          </label>

          {/* Password */}
          <label className="modal__field">
            <span className="modal__label">Contraseña</span>
            <input
              className="modal__input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              autoComplete="current-password"
              required
            />
            {errors.password && <span className="modal__error">{errors.password}</span>}
          </label>

          {/* Name solo en registro */}
          {mode === 'register' && (
            <label className="modal__field">
              <span className="modal__label">Nombre</span>
              <input
                className="modal__input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                autoComplete="name"
                required
              />
              {errors.name && <span className="modal__error">{errors.name}</span>}
            </label>
          )}

          <button
            className="modal__submit btn"
            type="submit"
            disabled={!isFormValid || isSubmitting}
          >
            {mode === 'login' ? 'Iniciar sesión' : 'Inscribirse'}
          </button>
        </form>
      </div>
    </div>
  );
}
