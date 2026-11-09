// Importamos la instancia centralizada de Axios
import axiosClient from '../api/axiosClient.js';
import { fetchApi } from '../api/fetchApi.js';

//Maneja las peticiones de consultas y chat RAG de backend
export const consultationService = {
  // Envía una nueva consulta del estudiante al backend.
  enviarConsulta: async (mensaje) => {
    try {
      // Petición POST al endpoint de consultas de tu backend
      const response = await axiosClient.post('/consultation', { mensaje }, { timeout: 65000 });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Envía la calificación y el comentario de una consulta ya respondida.
  calificarConsulta: async (id, calificacion, comentario) => {
    try {
      // Petición POST de calificación
      const response = await axiosClient.post(`/consultation/${id}/rate`, {
        calificacion,
        comentario
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  obtenerHistorialEstudiante: async () => {
    return await fetchApi('/consultation/mine');
  },
  eliminarConsulta: (id) => fetchApi(`/consultation/${id}`, { method: 'DELETE' }),
  editarCalificacion: (id, calificacion, comentario) => fetchApi(`/consultation/${id}/rate`, {
    method: 'PUT',
    body: { calificacion, comentario }
  })
};