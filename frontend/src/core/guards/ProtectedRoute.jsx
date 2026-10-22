/**
 * RESPONSABLE: Keila
 * MÓDULO: Autenticación y Control de Acceso (Guards)
 *
 * Guard de rutas protegidas del sistema de gestión.
 * Verifica si el usuario tiene sesión activa (JWT) y si su rol tiene permisos.
 *
 * ROLES (RF02 / HU02):
 *  - ADMIN: acceso total a todos los módulos.
 *  - VENDEDOR: acceso restringido a POS, Inventario (lectura), Caja y Pedidos.
 *             NO puede ver Reportes Financieros ni Configuración.
 *
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { ROUTES } from '../../shared/constants/routes';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm font-medium text-gray-500">
        Verificando sesión...
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const isPasswordChangeRoute = location.pathname === ROUTES.PASSWORD_CHANGE;
  if (user?.mustChangePassword && !isPasswordChangeRoute) {
    return <Navigate to={ROUTES.PASSWORD_CHANGE} replace />;
  }
  if (!user?.mustChangePassword && isPasswordChangeRoute) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Si se especificaron roles permitidos y el usuario no lo tiene, redirigir al dashboard
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'VENDEDOR';
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    }
  }

  // Permite uso como wrapper (<ProtectedRoute><Component /></ProtectedRoute>)
  // o como layout route (<Route element={<ProtectedRoute />}>)
  return children ? children : <Outlet />;
};
