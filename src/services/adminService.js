import { fetchApi } from '../api/fetchApi.js';

// Agrupa las operaciones que solo puede realizar un administrador.
export const adminService = {
  obtenerEstadisticas: () => fetchApi('/consultation/stats'),
  obtenerEstudiantes: () => fetchApi('/students'),
  obtenerCursos: () => fetchApi('/courses/admin'),
  obtenerHistorial: () => fetchApi('/consultation'),
  crearCurso: (datosCurso) => fetchApi('/courses', { method: 'POST', body: datosCurso }),
  actualizarCurso: (id, datosCurso) => fetchApi(`/courses/${id}`, { method: 'PUT', body: datosCurso }),
  desactivarCurso: (id) => fetchApi(`/courses/${id}/disable`, { method: 'PATCH' }),
  reactivarCurso: (id) => fetchApi(`/courses/${id}/enable`, { method: 'PATCH' })
};
