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
 * TODO Keila: Cuando el backend devuelva el token JWT real, conectar la validación de expiración aquí.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { ROUTES } from '../../shared/constants/routes';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuthContext();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
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
