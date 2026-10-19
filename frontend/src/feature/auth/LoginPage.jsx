import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Store, UserRound } from 'lucide-react';
import { useAuthContext } from '../../core/context/AuthContext';
import { ROUTES } from '../../shared/constants/routes';

export const LoginPage = () => {
  const { login, isAuthenticated, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(ROUTES.DASHBOARD, { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Escribe tu nombre de usuario.');
      return;
    }
    if (!password) {
      setError('Escribe tu contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const signedInUser = await login({ username: username.trim(), password });
      navigate(signedInUser.mustChangePassword ? ROUTES.PASSWORD_CHANGE : ROUTES.DASHBOARD, { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesión. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Store size={23} strokeWidth={2.2} />
          </div>
          <p className="login-eyebrow">TIENDA PRISMA</p>
          <h1 className="login-title">Bienvenida de nuevo</h1>
          <p className="login-subtitle">Ingresa a tu espacio de trabajo</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <label className="login-label" htmlFor="username">Usuario</label>
          <div className="login-input-wrap">
            <UserRound size={18} aria-hidden="true" />
            <input
              autoComplete="username"
              autoCapitalize="none"
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ingresa tu usuario"
              maxLength={50}
              disabled={isSubmitting}
            />
          </div>

          <label className="login-label" htmlFor="password">Contraseña</label>
          <div className="login-input-wrap">
            <LockKeyhole size={18} aria-hidden="true" />
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contraseña"
              maxLength={100}
              disabled={isSubmitting}
            />
            <button
              className="login-password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}</span>
            {!isSubmitting && <ArrowRight size={19} aria-hidden="true" />}
          </button>
        </form>

        <p className="login-footer">
          Acceso exclusivo para el personal autorizado
        </p>
      </div>
    </div>
  );
};
