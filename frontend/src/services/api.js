import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5100/api',
  timeout: 30000, // 30-second timeout for cold starts
  timeoutErrorMessage: 'Error de conexión: No se puede conectar al servidor. Por favor, asegúrese de que el servidor backend está funcionando.'
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
    if (adminInfo && adminInfo.token) {
      config.headers.Authorization = `Bearer ${adminInfo.token}`;
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
