import axios from 'axios';

// Create a base API instance
// Determine API URL based on environment
const API_URL = process.env.NODE_ENV === 'production'
  ? '/api'  // In production, use relative path (same domain)
  : 'http://localhost:5100/api'; // In development, connect to local backend server

// Log the API URL for debugging purposes
console.log('API URL being used:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a longer timeout for slow connections
  timeout: 10000,
});

// Request interceptor for adding authorization token
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed for admin features
    // const token = localStorage.getItem('adminToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    console.log('Making request to:', `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - backend server may be down');
    } else if (!error.response) {
      console.error('Network error - cannot connect to backend server at', API_URL);
      alert('Error de conexión: No se puede conectar al servidor. Por favor, asegúrese de que el servidor backend esté funcionando.');
    } else {
      console.error('API Error:', error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);



export default api;
