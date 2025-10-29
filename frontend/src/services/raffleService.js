import api from './api.js';

const raffleService = {
  // Get all active raffles
  getActiveRaffles: async () => {
    try {
      console.log('Fetching active raffles...');
      // Correct API path for all environments
      const response = await api.get('/api/raffles');
      console.log('Active raffles API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching active raffles:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get past raffles
  getPastRaffles: async () => {
    try {
      const response = await api.get('/api/raffles/past');
      return response.data;
    } catch (error) {
      console.error('Error fetching past raffles:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a single raffle by ID
  getRaffleById: async (id) => {
    try {
      const response = await api.get(`/api/raffles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching raffle ${id}:`, error);
      throw error;
    }
  },

  // Create a new raffle
  createRaffle: async (raffleData) => {
    try {
      const response = await api.post('/api/raffles', raffleData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating raffle:', error);
      throw error;
    }
  },

  // Update a raffle
  updateRaffle: async (id, raffleData) => {
    try {
      const response = await api.put(`/api/raffles/${id}`, raffleData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating raffle ${id}:`, error);
      throw error;
    }
  },

  // Delete a raffle
  deleteRaffle: async (id) => {
    try {
      const response = await api.delete(`/api/raffles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting raffle ${id}:`, error);
      throw error;
    }
  },

  // Get statistics for a raffle
  getRaffleStats: async (raffleId) => {
    try {
      const response = await api.get(`/api/tickets/stats/${raffleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for raffle ${raffleId}:`, error);
      throw error;
    }
  },
};

export default raffleService;
