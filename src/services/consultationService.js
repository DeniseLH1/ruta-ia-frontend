// Importamos la instancia centralizada de Axios
import axiosClient from '../api/axiosClient.js';

//Maneja las peticiones de consultas y chat RAG de backend
export const consultationService = {
  // Envía una nueva consulta del estudiante al backend.
  enviarConsulta: async (studentId, mensaje) => {
    try {
      // Petición POST al endpoint de consultas de tu backend
      const response = await axiosClient.post('/consultation', { studentId, mensaje });
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
  obtenerHistorialEstudiante: async (studentId) => {
    try {
      const response = await axiosClient.get(`/consultation/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

};