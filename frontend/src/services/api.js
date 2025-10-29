import axios from 'axios';
import apiConfig from '../config/apiConfig';

// Create an axios instance with the base URL from the centralized config
// This allows us to use different URLs for development and production
const api = axios.create({
  // We're not removing the '/api' suffix to maintain consistent URL paths across all devices
  baseURL: apiConfig.API_URL.includes('/api') ? apiConfig.API_URL.replace('/api', '') : apiConfig.API_URL,
  timeout: 60000, // 60-second timeout for cold starts
  timeoutErrorMessage: 'Error de conexión: No se puede conectar al servidor. Por favor, asegúrese de que el servidor backend esté funcionando.'
});

// Add an interceptor to automatically include the auth token in every request
api.interceptors.request.use(
  (config) => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
      if (adminInfo && adminInfo.token) {
        config.headers['Authorization'] = `Bearer ${adminInfo.token}`;
      }
    } catch (error) {
      console.error('Could not parse adminInfo from localStorage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      localStorage.removeItem('adminInfo');
      window.location.href = '/login';
    } else if (!error.response) {
      // Handle network errors (e.g., backend is down)
      alert('Error de conexión: No se puede conectar al servidor. Por favor, asegúrese de que el servidor backend esté funcionando.');
    }
    return Promise.reject(error);
  }
);

export default api;
