// Importamos la librería Axios para realizar peticiones HTTP
import axios from 'axios';
import { clearSession, getSession } from './session.js';

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
    const session = getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
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
    const isNetworkError = !error.response && Boolean(error.request);
    const errorMessage = error.response?.data?.message
      || error.response?.data?.mensaje
      || (isNetworkError
        ? `No se pudo conectar con ${axiosClient.defaults.baseURL}. Verifica que el backend esté activo y que CORS_ORIGINS permita el origen del frontend.`
        : null)
      || error.message
      || 'Error desconocido en el servidor';
    console.error('API ErrorInterceptor:', errorMessage);
    if (error.response?.status === 401) {
      clearSession();
      window.dispatchEvent(new Event('rutaIA:session-expired'));
    }
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