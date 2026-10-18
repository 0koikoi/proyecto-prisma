import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../../feature/auth/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    let active = true;
    if (!localStorage.getItem('token')) return undefined;

    authService.getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(toSessionUser(currentUser));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const sessionUser = toSessionUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  };

  const changePassword = async (passwords) => {
    const response = await authService.changePassword(passwords);
    const sessionUser = toSessionUser(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, changePassword, isLoading, isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const toSessionUser = ({ id, username, fullName, role, mustChangePassword }) => ({
  id,
  username,
  name: fullName,
  role,
  mustChangePassword: Boolean(mustChangePassword),
});

export const useAuthContext = () => useContext(AuthContext);
