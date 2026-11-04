// Importamos la instancia de Axios para realizar peticiones HTTP
import axiosClient from '../api/axiosClient.js';

//Gestiona las peticiones con cursos del backend
export const courseService = {
  // Lista todos los cursos disponibles
  obtenerCursos: async () => {
    try {
      // Petición GET para traer todos los cursos
      const response = await axiosClient.get('/courses');
      return response;
    } catch (error) {
      throw error;
    }
  },
  // Obtenemos la infromación de un curso por su ID
  obtenerCursoPorId: async (id) => {
    try {
      // Petición GET especificando el ID en la ruta
      const response = await axiosClient.get(`/courses/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  // Crear un nuevo curso
  crearCurso: async (datosCurso) => {
    try {
      // Petición POST enviando la información del nuevo curso
      const response = await axiosClient.post('/courses', datosCurso);
      return response;
    } catch (error) {
      throw error;
    }
  },
  // Actualiza un curso
  actualizarCurso: async (id, datosActualizados) => {
    try {
      // Petición PUT o PATCH para actualizar los campos
      const response = await axiosClient.patch(`/courses/${id}`, datosActualizados);
      return response;
    } catch (error) {
      throw error;
    }
  },
  // Elimina un curso por su ID
  eliminarCurso: async (id) => {
    try {
      // Petición DELETE
      const response = await axiosClient.delete(`/courses/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

};