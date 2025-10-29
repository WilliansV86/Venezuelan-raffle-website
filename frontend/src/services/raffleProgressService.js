import axios from 'axios';
import api from './apiService';
import { getAdminKey } from '../utils/adminAuth';

/**
 * Update the display progress settings for a raffle
 * @param {string} raffleId - The ID of the raffle to update
 * @param {string} mode - The display mode ('automatic' or 'manual')
 * @param {number|null} value - The progress percentage (0-100) when in manual mode
 * @returns {Promise} - The API response
 */
export const updateRaffleDisplayProgress = async (raffleId, mode, value = null) => {
  try {
    // First, attempt to get the admin info from localStorage directly
    const adminInfoStr = localStorage.getItem('adminInfo');
    let headers = {};
    
    if (adminInfoStr) {
      try {
        // Try to use the token from adminInfo
        const adminInfo = JSON.parse(adminInfoStr);
        if (adminInfo && adminInfo.token) {
          console.log('Using token from adminInfo object');
          headers = { 'Authorization': `Bearer ${adminInfo.token}` };
        }
      } catch (e) {
        console.log('Error parsing adminInfo:', e);
      }
    }
    
    // If no token was found, try to use x-admin-key
    if (!headers.Authorization) {
      const adminKey = getAdminKey();
      if (adminKey) {
        console.log('Using admin key');
        headers = { 'x-admin-key': adminKey };
      } else {
        throw new Error('No valid admin credentials found');
      }
    }
    
    // Log what headers we're using
    console.log('Request headers:', headers);
    
    // Make the API call with the headers
    return await axios.put(`/api/raffles/${raffleId}/display-progress`, {
      displayProgressMode: mode,
      displayProgressValue: value
    }, { headers });
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

export default {
  updateRaffleDisplayProgress
};
