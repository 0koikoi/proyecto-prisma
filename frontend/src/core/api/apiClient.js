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

const CANDIDATE_URLS = [
  import.meta.env.VITE_API_URL,
  '/proyecto-prisma/api',
  '/api',
  'http://127.0.0.1:8080/api',
  'http://localhost:8080/api',
].filter(Boolean);

let activeBaseUrl = CANDIDATE_URLS[0] || 'http://127.0.0.1:8080/api';

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

const executeWithFailover = async (endpoint, options) => {
  const urlsToTry = [
    activeBaseUrl,
    ...CANDIDATE_URLS.filter((url) => url !== activeBaseUrl),
  ];

  let lastError;
  for (const baseUrl of urlsToTry) {
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, options);
      activeBaseUrl = baseUrl;
      return await handleResponse(res);
    } catch (err) {
      lastError = err;
      // Solo intentar la siguiente URL candidata si fue fallo de red/conexión (TypeError: Failed to fetch)
      if (!(err instanceof TypeError)) {
        throw err;
      }
    }
  }

  throw lastError;
};

export const apiClient = {
  get(endpoint, extraHeaders = {}) {
    return executeWithFailover(endpoint, {
      method: 'GET',
      headers: getHeaders(extraHeaders),
    });
  },

  post(endpoint, data, extraHeaders = {}) {
    return executeWithFailover(endpoint, {
      method: 'POST',
      headers: getHeaders(extraHeaders),
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data, extraHeaders = {}) {
    return executeWithFailover(endpoint, {
      method: 'PUT',
      headers: getHeaders(extraHeaders),
      body: JSON.stringify(data),
    });
  },

  patch(endpoint, data, extraHeaders = {}) {
    return executeWithFailover(endpoint, {
      method: 'PATCH',
      headers: getHeaders(extraHeaders),
      body: JSON.stringify(data),
    });
  },

  delete(endpoint, extraHeaders = {}) {
    return executeWithFailover(endpoint, {
      method: 'DELETE',
      headers: getHeaders(extraHeaders),
    });
  },
};
