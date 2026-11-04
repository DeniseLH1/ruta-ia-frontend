import axiosClient from '../api/axiosClient.js';

export const studentService = {
  obtenerEstudiantes: async () => {
    const response = await axiosClient.get('/students');
    return response.data;
  },
  registrarEstudiante: async (datosEstudiante) => {
    const response = await axiosClient.post('/students', datosEstudiante);
    return response.data;
  }
};
