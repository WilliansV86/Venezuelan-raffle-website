/**
 * API Configuration File
 * Centralizes all API URL configuration to avoid hardcoded URLs across the application
 */

// Get API URL from environment variables or use fallbacks
const API_URL = process.env.REACT_APP_API_URL || 'https://tu-suerte-esta-aqui-ve.onrender.com/api';

// Full URL for uploads directory
const UPLOADS_URL = API_URL.replace('/api', '/uploads');

// Export configuration
const apiConfig = {
  // Base URLs
  API_URL,
  UPLOADS_URL,
  
  // Specific endpoints
  endpoints: {
    raffles: `${API_URL}/raffles`,
    tickets: `${API_URL}/tickets`,
    admin: `${API_URL}/admin`,
    health: `${API_URL}/health`,
  },
  
  // Helper function to get image URL
  getImageUrl: (relativePath) => {
    if (!relativePath) return '/images/default-raffle-image.png';
    if (relativePath.startsWith('http')) return relativePath;
    return `${UPLOADS_URL}/${relativePath.replace(/^\/uploads\//, '')}`;
  }
};

export default apiConfig;
