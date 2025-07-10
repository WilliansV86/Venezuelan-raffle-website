import api from './api';

// Always use real API data
const checkUseMockData = () => {
  return false; // Always use real API
};

// Log the API base URL for debugging
console.log('API base URL:', api.defaults.baseURL);

const raffleService = {
  // Get all active raffles
  getActiveRaffles: async () => {
    try {
      console.log('Attempting to fetch active raffles from API...');
      const response = await api.get('/raffles/active');
      console.log('Active raffles API response:', response);
      console.log('Active raffles data:', response.data);
      
      // Ensure we return the expected format
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data;
      } else if (response.data) {
        // If we got a response but in unexpected format, try to normalize it
        return {
          success: true,
          count: Array.isArray(response.data) ? response.data.length : 1,
          data: Array.isArray(response.data) ? response.data : [response.data]
        };
      }
      return { success: false, count: 0, data: [], error: 'Invalid response format' };
    } catch (error) {
      console.error('Error fetching active raffles in raffleService:', error.message);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      // Return an empty structure
      return { success: false, count: 0, data: [], error: error.message };
    }
  },
  
  // Get past raffles
  getPastRaffles: async () => {
    try {
      console.log('Attempting to fetch past raffles from API...');
      const response = await api.get('/raffles/past');
      console.log('Past raffles API response:', response);
      console.log('Past raffles data:', response.data);
      
      // Ensure we return the expected format
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data;
      } else if (response.data) {
        // If we got a response but in unexpected format, try to normalize it
        return {
          success: true,
          count: Array.isArray(response.data) ? response.data.length : 1,
          data: Array.isArray(response.data) ? response.data : [response.data]
        };
      }
      return { success: false, count: 0, data: [], error: 'Invalid response format' };
    } catch (error) {
      console.error('Error fetching past raffles:', error.message);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      // Return an empty structure
      return { success: false, count: 0, data: [], error: error.message };
    }
  },

  // Get a single raffle by ID
  getRaffleById: async (raffleId) => {
    console.log(`Fetching raffle with ID: ${raffleId}`);
    
    try {
      // First try the specific ID endpoint
      const response = await api.get(`/raffles/${raffleId}`);
      console.log('Raffle response:', response);
      return response.data;
    } catch (error) {
      console.error(`Error fetching raffle ${raffleId}:`, error);
      
      // Fallback - if specific ID endpoint fails, try getting from general raffles endpoint
      try {
        console.log('Attempting fallback to general raffles endpoint');
        const allRafflesResponse = await api.get('/raffles');
        const raffles = allRafflesResponse.data.data || [];
        const foundRaffle = raffles.find(raffle => raffle._id === raffleId);
        
        if (foundRaffle) {
          console.log('Found raffle in general endpoint:', foundRaffle);
          return { success: true, data: foundRaffle };
        } else {
          throw new Error('Raffle not found');
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw error; // Throw original error
      }
    }
  },

  // Get statistics for a raffle (including progress bar data)
  getRaffleStats: async (raffleId) => {
    const useMockData = checkUseMockData();
    try {
      if (useMockData) {
        // Mock data implementation
      } else {
        const response = await api.get(`/tickets/stats/${raffleId}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching stats for raffle ${raffleId}:`, error);
      throw error;
    }
  }
};

export default raffleService;
