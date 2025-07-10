// Direct ticket service for emergency bypassing any issues with the regular service
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5100';

const directTicketService = {
  // Direct purchase tickets bypassing any middleware issues
  purchaseTickets: async (formData) => {
    console.log('[EMERGENCY FIX] Sending purchase request directly to API');
    
    try {
      // Log form data for debugging
      console.log('[EMERGENCY FIX] Form data entries:');
      for (let pair of formData.entries()) {
        console.log(`[EMERGENCY FIX] ${pair[0]}: ${pair[1]}`);
      }
      
      // Send directly via axios
      const response = await axios.post(`${API_BASE_URL}/api/tickets/purchase`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[EMERGENCY FIX] Purchase API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[EMERGENCY FIX] Error purchasing tickets:', error);
      
      // Better error debugging
      if (error.response) {
        console.error('[EMERGENCY FIX] Error response data:', error.response.data);
        console.error('[EMERGENCY FIX] Error response status:', error.response.status);
      } else if (error.request) {
        console.error('[EMERGENCY FIX] Error request (no response received):', error.request);
      } else {
        console.error('[EMERGENCY FIX] Error setting up request:', error.message);
      }
      
      throw error;
    }
  }
};

export default directTicketService;
