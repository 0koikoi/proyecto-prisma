/**
 * RESPONSABLE: Keila
 * MÓDULO: Autenticación — Contexto Global
 *
 * Contexto de autenticación que provee el usuario autenticado a toda la app.
 *
 * FLUJO ACTUAL (Sprint 1-4, modo mock):
 *  - El usuario está siempre "autenticado" con datos fijos (modo desarrollo).
 *
 * TODO Keila: Reemplazar el estado fijo por la llamada real al backend (Sprint 6-8):
 *   1. POST /api/auth/login → recibe { token, name, role }
 *   2. Guardar el token en localStorage: localStorage.setItem('token', token)
 *   3. En cada petición axios, incluir el header: Authorization: Bearer {token}
 *   4. En logout: eliminar el token con localStorage.removeItem('token')
 *   5. Al cargar la app, verificar si hay token guardado y si es válido (GET /api/auth/me)
 *
 * TODO Keila: Agregar manejo de expiración del token (interceptor de Axios que redirige al login en 401).
 */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // TODO Keila: al cargar la app, verificar si hay un token guardado en localStorage
  const [user, setUser] = useState({
    id: 1,
    name: 'Administradora',
    role: 'ADMIN',
    email: 'admin@prisma.com',
  });

  const login = (credentials) => {
    // TODO Keila: llamar a authService.login() y guardar el token JWT
    setUser({
      id: 1,
      name: credentials.name ?? credentials.username ?? 'Admin Prisma',
      role: 'ADMIN',
    });
  };

  const logout = () => {
    // TODO Keila: eliminar token de localStorage
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
