/**
 * RESPONSABLE: Keila
 * MÓDULO: Autenticación
 *
 * Página de login para el personal de Tienda Prisma.
 * Solo acceso con credenciales válidas — NO hay registro público.
 *
 * ROLES DEL SISTEMA (RF02):
 *  - ADMIN: acceso completo a todas las vistas
 *  - VENDEDOR: acceso a POS, Caja e Inventario (solo lectura). NO ve Reportes Financieros.
 *
 * CONEXIÓN CON BACKEND:
 *  - POST /api/auth/login  → body: { username, password } → response: { token, role, name }
 *  - El token JWT debe guardarse en localStorage o httpOnly cookie y enviarse en cada
 *    request como header: Authorization: Bearer {token}
 *
 * TODO Keila: Reemplazar el login simulado por la llamada real a POST /api/auth/login.
 * TODO Keila: Guardar el token JWT en AuthContext y en localStorage.
 * TODO Keila: Al recibir 401 (token expirado), redirigir al login automáticamente.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAuthContext } from '../../core/context/AuthContext';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import { ROUTES } from '../../shared/constants/routes';

export const LoginPage = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // TODO Keila: reemplazar con llamada real a POST /api/auth/login
      // const { token, name, role } = await authService.login({ username, password });
      login({ username, name: username });
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card">
        {/* Marca */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Tienda Prisma</h1>
          <p className="text-sm text-gray-500 mt-1">Portal de Gestión Interna</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Usuario"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tuusuario"
            icon={User}
            required
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            required
          />

          {error && (
            <p className="text-xs text-red-500 text-center -mt-1">{error}</p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
            Iniciar Sesión
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Acceso restringido para personal autorizado de Tienda Prisma.
        </p>
      </div>
    </div>
  );
};
