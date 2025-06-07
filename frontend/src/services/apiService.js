import axios from 'axios';
import { getAdminKey } from '../utils/adminAuth';

const apiClient = axios.create({
  baseURL: '/api', // Assuming proxy is set up for /api to backend
});

// Request interceptor to add admin key to headers
apiClient.interceptors.request.use(
  (config) => {
    const adminKey = getAdminKey();
    if (adminKey) {
      config.headers['x-admin-key'] = adminKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Generic API methods
export const fetchRaffles = () => apiClient.get('/raffles');
export const fetchRaffleById = (id) => apiClient.get(`/raffles/${id}`);

// Admin specific methods
export const createRaffleAdmin = (raffleData) => apiClient.post('/raffles', raffleData);
export const updateRaffleAdmin = (id, raffleData) => apiClient.put(`/raffles/${id}`, raffleData);
export const deleteRaffleAdmin = (id) => apiClient.delete(`/raffles/${id}`);
// TODO: Need a way to fetch ALL raffles for admin, including inactive ones.
// For now, fetchRaffles will get active ones. An admin version might be GET /raffles?all=true or similar.

export const createTicket = (ticketData) => apiClient.post('/tickets', ticketData);


export default apiClient;
