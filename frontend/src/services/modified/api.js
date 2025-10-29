// Simplified api.js 
import axios from 'axios'; 
 
// Create an axios instance with the base URL 
const api = axios.create({ 
  baseURL: 'https://tu-suerte-esta-aqui-ve.onrender.com/api', 
  timeout: 60000, 
  timeoutErrorMessage: 'Error de conexión: No se puede conectar al servidor.' 
}); 
 
export default api; 
