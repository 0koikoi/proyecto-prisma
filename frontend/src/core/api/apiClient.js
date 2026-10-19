/**
 * RESPONSABLE: Keila
 * MÓDULO: Cliente HTTP Global (API Client)
 *
 * Cliente centralizado para todas las peticiones a la API de Spring Boot.
 * Inyecta automáticamente el token JWT en las cabeceras si existe sesión activa.
 *
 * ROLES Y SEGURIDAD:
 *  - En peticiones protegidas envía: Authorization: Bearer <token>
 *  - Maneja respuestas 401 (No autorizado) limpiando y cerrando la sesión.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    // Una respuesta 401 invalida la sesión en toda la aplicación.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  if (!res.ok) {
    let errorMessage = `Error ${res.status}: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.message || errorJson.detail) errorMessage = errorJson.message || errorJson.detail;
    } catch {
      // Ignorar si la respuesta de error no es JSON
    }
    const error = new Error(errorMessage);
    error.status = res.status;
    throw error;
  }

  // Si no hay contenido (ej: 204 No Content), devolver null
  if (res.status === 204) return null;
  return res.json();
};

export const apiClient = {
  async get(endpoint, extraHeaders = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(extraHeaders),
    });
    return handleResponse(res);
  },

  async post(endpoint, data, extraHeaders = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(extraHeaders),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async put(endpoint, data, extraHeaders = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(extraHeaders),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async patch(endpoint, data, extraHeaders = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(extraHeaders),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async delete(endpoint, extraHeaders = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(extraHeaders),
    });
    return handleResponse(res);
  },
};
