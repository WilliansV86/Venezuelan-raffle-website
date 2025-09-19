import axios from 'axios';
import apiConfig from '../config/apiConfig';


const API_URL = process.env.REACT_APP_API_URL || apiConfig.API_URL.replace("/api", "") + "/api";

const transactionService = {
  /**
   * Create a new transaction.
   * @param {object} formData - The form data for the new transaction.
   * @returns {Promise<object>} The created transaction.
   */
  createTransaction: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/transactions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error.response ? error.response.data : error.message);
      throw error.response ? error.response.data : new Error('Server Error');
    }
  },

  // You can add other transaction-related functions here in the future,
  // such as getTransactionById, confirmTransaction, etc.
};

export default transactionService;
