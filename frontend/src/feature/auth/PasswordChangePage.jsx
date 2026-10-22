import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useAuthContext } from '../../core/context/AuthContext';
import { ROUTES } from '../../shared/constants/routes';

const passwordRules = [
  { label: 'Al menos 8 caracteres', test: (value) => value.length >= 8 },
  { label: 'Una letra mayúscula', test: (value) => /[A-Z]/.test(value) },
  { label: 'Un número', test: (value) => /\d/.test(value) },
  { label: 'Un símbolo', test: (value) => /[\W_]/.test(value) },
];

export const PasswordChangePage = () => {
  const { changePassword } = useAuthContext();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requirementsMet = passwordRules.every(({ test }) => test(newPassword));
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmation;
  const canSubmit = currentPassword.length > 0 && requirementsMet && passwordsMatch && !isSubmitting;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!currentPassword) {
      setError('Escribe tu contraseña temporal.');
      return;
    }
    if (!requirementsMet) {
      setError('La nueva contraseña no cumple con todos los requisitos.');
      return;
    }
    if (!passwordsMatch) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (changeError) {
      setError(changeError.message || 'No se pudo actualizar la contraseña. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-screen-wrapper">
      <section className="login-card" aria-labelledby="password-change-title">
        <div className="login-brand">
          <div className="login-brand-icon">
            <LockKeyhole size={23} strokeWidth={2.2} />
          </div>
          <p className="login-eyebrow">TIENDA PRISMA</p>
          <h1 className="login-title" id="password-change-title">Actualiza tu contraseña</h1>
          <p className="login-subtitle">
            Por seguridad, cambia la contraseña temporal para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <label className="login-label" htmlFor="current-password">Contraseña temporal</label>
          <div className="login-input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              autoComplete="current-password"
              id="current-password"
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Escribe tu contraseña actual"
              maxLength={100}
              disabled={isSubmitting}
            />
            <PasswordVisibilityButton
              visible={showPasswords}
              onClick={() => setShowPasswords((visible) => !visible)}
            />
          </div>

          <label className="login-label" htmlFor="new-password">Nueva contraseña</label>
          <div className="login-input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              autoComplete="new-password"
              id="new-password"
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Crea una contraseña segura"
              maxLength={100}
              disabled={isSubmitting}
            />
            <PasswordVisibilityButton
              visible={showPasswords}
              onClick={() => setShowPasswords((visible) => !visible)}
            />
          </div>

          <ul className="password-requirements" aria-label="Requisitos de la contraseña">
            {passwordRules.map(({ label, test }) => {
              const met = test(newPassword);
              return (
                <li className={met ? 'password-requirement-met' : ''} key={label}>
                  <Check size={14} aria-hidden="true" />
                  {label}
                </li>
              );
            })}
          </ul>

          <label className="login-label" htmlFor="confirm-password">Confirma la nueva contraseña</label>
          <div className="login-input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              autoComplete="new-password"
              id="confirm-password"
              type={showPasswords ? 'text' : 'password'}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Vuelve a escribir la contraseña"
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>
          {confirmation && !passwordsMatch && (
            <p className="password-match-error" role="status">Las contraseñas nuevas no coinciden.</p>
          )}

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="login-submit" type="submit" disabled={!canSubmit}>
            <span>{isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}</span>
            {!isSubmitting && <ArrowRight size={19} aria-hidden="true" />}
          </button>
        </form>
      </section>
    </main>
  );
};

const PasswordVisibilityButton = ({ visible, onClick }) => (
  <button
    className="login-password-toggle"
    type="button"
    onClick={onClick}
    aria-label={visible ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
    aria-pressed={visible}
  >
    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
);
