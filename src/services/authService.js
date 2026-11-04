import { fetchApi } from '../api/fetchApi.js';
import { saveSession } from '../api/session.js';

// Guarda cada sesión autenticada después de obtenerla del backend.
export const authService = {
  iniciarSesionEstudiante: async (email, password) => {
    const session = await fetchApi('/auth/student/login', {
      method: 'POST',
      body: { email, password }
    });
    saveSession(session);
    return session;
  },
  iniciarSesionAdmin: async (username, password) => {
    const session = await fetchApi('/auth/admin/login', {
      method: 'POST',
      body: { username, password }
    });
    saveSession(session);
    return session;
  },
  registrarEstudiante: async (studentData) => {
    const result = await fetchApi('/students', {
      method: 'POST',
      body: studentData
    });
    saveSession(result.data || result);
    return result.data || result;
  }
};
