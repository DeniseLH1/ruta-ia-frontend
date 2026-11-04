// Importamos la instancia de Axios para realizar peticiones HTTP
import axiosClient from '../api/axiosClient.js';

//Gestiona las peticiones con cursos del backend
export const courseService = {
  obtenerCursos: async (filtros = {}) => {
    const response = await axiosClient.get('/courses', { params: filtros });
    return response.data;
  },
  obtenerCursoPorId: async (id) => {
    const response = await axiosClient.get(`/courses/${id}`);
    return response.data;
  },
  crearCurso: async (datosCurso) => {
    const response = await axiosClient.post('/courses', datosCurso);
    return response.data;
  },
  actualizarCurso: async (id, datosActualizados) => {
    const response = await axiosClient.put(`/courses/${id}`, datosActualizados);
    return response.data;
  },
  desactivarCurso: async (id) => {
    const response = await axiosClient.patch(`/courses/${id}/disable`);
    return response.data;
  }
};