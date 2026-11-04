import { fetchApi } from '../api/fetchApi.js';

// Agrupa las operaciones que solo puede realizar un administrador.
export const adminService = {
  obtenerEstadisticas: () => fetchApi('/consultation/stats'),
  obtenerEstudiantes: () => fetchApi('/students'),
  obtenerCursos: () => fetchApi('/courses/admin'),
  desactivarCurso: (id) => fetchApi(`/courses/${id}/disable`, { method: 'PATCH' })
};
