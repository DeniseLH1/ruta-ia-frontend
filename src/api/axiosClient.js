// Importamos la librería Axios para realizar peticiones HTTP
import axios from 'axios';

// Creamos un instancia de axios para reutilizar la configuración en el frontend.
const axiosClient = axios.create({
  // Obtenemos la URL base desde las variables de entorno de vite
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  // Tiempo límite de 10 segundos para las peticiones
  timeout: 10000,
  // Cabecera HTTP para todas las peticiones
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor de solicitudes
axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    // Manejo de errores antes de enviar la petición
    return Promise.reject(error);
  }
);

//Interceptor de respuestas 
axiosClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa retornamos los datos 
    return response.data;
  },
  (error) => {
    // Manejo global de errores HTTP 
    const errorMessage = error.response?.data?.message
      || error.response?.data?.mensaje
      || error.message
      || 'Error desconocido en el servidor';
    console.error('API ErrorInterceptor:', errorMessage);
    // Rechazamos la promesa para que el servicio pueda capturar el error si lo necesita
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      originalError: error
    });
  }
);

// Exportamos la instancia 
export default axiosClient;