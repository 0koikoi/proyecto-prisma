import { apiClient } from '../../core/api/apiClient';

export const authService = {
  async login(credentials) {
    try {
      return await apiClient.post('/auth/login', credentials);
    } catch (error) {
      if (error.status === 401) {
        if (error.message.includes('Te quedan')) throw error;
        throw new Error('El usuario o la contraseña no son correctos.');
      }
      if (!error.status) {
        throw new Error('No fue posible conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.');
      }
      if (error.status === 423) throw error;
      throw new Error('Ocurrió un problema al iniciar sesión. Inténtalo nuevamente.');
    }
  },

  getCurrentUser() {
    return apiClient.get('/auth/me');
  },

  async changePassword(passwords) {
    try {
      return await apiClient.post('/auth/change-password', passwords);
    } catch (error) {
      if (error.status === 400) throw new Error(error.message);
      if (!error.status) {
        throw new Error('No fue posible conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.');
      }
      throw new Error('No se pudo actualizar la contraseña. Inténtalo nuevamente.');
    }
  },
};
