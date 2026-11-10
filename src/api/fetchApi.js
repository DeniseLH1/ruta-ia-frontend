import { clearSession, getSession } from './session.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Cliente Fetch con Bearer token y errores consistentes para vistas nuevas.
export async function fetchApi(path, options = {}) {
  const session = getSession();
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
  } catch (error) {
    const connectionError = new Error(
      `No se pudo conectar con el backend en ${API_BASE_URL}. Verifica que esté activo y que CORS_ORIGINS incluya el origen del frontend.`
    );
    connectionError.cause = error;
    throw connectionError;
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`El servidor devolvió una respuesta inválida (${response.status}).`);
  }

  if (response.status === 401 && !path.includes('/login')) {
    clearSession();
    window.dispatchEvent(new Event('rutaIA:session-expired'));
  }
  if (!response.ok) {
    const error = new Error(payload.message || `Error HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  return payload.data;
}
