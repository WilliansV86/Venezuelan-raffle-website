import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

// Define API URL constants with multiple possible backend server URLs
const API_URLS = [
  '/api',                     // Production/relative path
  'http://localhost:5100/api', // Most common dev server
  'http://localhost:5000/api', // Alternative common port
  'http://localhost:3001/api', // Another common API port
  'http://localhost:8080/api'  // Another possibility
];

// Function to find a working API URL
const findWorkingApiUrl = async (testEndpoint = '/health') => {
  for (const url of API_URLS) {
    try {
      // Try a simple test endpoint
      await axios.get(`${url}${testEndpoint}`); 
      console.log(`Found working API URL: ${url}`);
      return url;
    } catch (err) {
      console.warn(`API URL ${url} failed health check`);
      // Continue to next URL
    }
  }
  
  // If we reach here, no URLs worked with the test endpoint
  // Let's try the first URL anyway as our best guess
  return API_URLS[0];
};

const AdminPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminInfo, setadminInfo] = useState(localStorage.getItem('adminInfo') || '');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [raffles, setRaffles] = useState([]);
  const [raffleError, setRaffleError] = useState(null);
  const [raffleLoading, setRaffleLoading] = useState(false);
  
  const [showRaffleManager, setShowRaffleManager] = useState(false);

  const [rafflesForManager, setRafflesForManager] = useState({
    active: null,
    previous: null,
    others: []
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const navigate = useNavigate();
  
  // Variable to store working API URL once found
  const [workingApiUrl, setWorkingApiUrl] = useState(API_URLS[0]);

  // Check if adminInfo exists in localStorage
  useEffect(() => {
    const saveinfo = localStorage.getItem('adminInfo');
    if (savedinfo) {
      setadminInfo(savedinfo);
      setAuthenticated(true);
    }
  }, []);

  // Effect for initial data loading once authenticated
  useEffect(() => {
    if (authenticated) {
      (async () => {
        try {
          // Find a working API URL first
          const apiUrl = await findWorkingApiUrl();
          setWorkingApiUrl(apiUrl);
          
          // Then fetch data using that URL
          await fetchTransactions(adminKey, apiUrl);
          await fetchRafflesForManager(apiUrl);
        } catch (err) {
          console.error('Failed to initialize data:', err);
          setError('Error al cargar datos iniciales');
        }
      })();
    }
  }, [authenticated]);
  
  // Reusable API call function with admin authentication
  const callAdminAPI = async (endpoint, method = 'GET', data = null, customHeaders = {}, apiUrl = API_URLS[0]) => {
    const key = localStorage.getItem('admin_key');
    if (!key) {
      throw new Error('Admin key not found. Please log in again.');
    }

    try {
      console.log(`🔄 API Call: ${method} ${apiUrl}${endpoint}`);
      
      const config = {
        method,
        url: `${apiUrl}${endpoint}`,
        headers: {
          'x-aadminInfo': key,
          ...customHeaders
        },
        ...(data && { data })
      };
      
      const response = await axios(config);
      console.log(`✅ API Response:`, response);
      return response.data;
    } catch (err) {
      console.error(`❌ API Error for ${endpoint}:`, err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminInfo');
        setAuthenticated(false);
      }
      throw err;
    }
  };

  const fetchTransactions = async (key, apiUrl = API_URLS[0]) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Fetching transactions from ${apiUrl}/admin/transactions`);

      const adminKey = key || localStorage.getItem('admin_key');
      
      if (!adminKey) {
        setError('Admin key not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${apiUrl}/admin/transactions`, {
        headers: { 'x-admin-key': adminKey }
      });
      
      console.log('✅ Transaction data received:', response.data);
      
      if (Array.isArray(response.data)) {
        setTransactions(response.data);
      } else if (response.data && Array.isArray(response.data.transactions)) {
        setTransactions(response.data.transactions);
      } else {
        console.warn('Transaction data format not recognized:', response.data);
        setTransactions([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch transactions:', err);
      setError('Error al obtener transacciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRafflesForManager = async (apiUrl = API_URLS[0]) => {
    try {
      setStatusLoading(true);
      setStatusError(null);
      
      console.log('🔄 Fetching raffles for manager...');
      
      const adminKey = localStorage.getItem('admin_key');
      
      if (!adminKey) {
        setStatusError('Admin key not found. Please log in again.');
        setStatusLoading(false);
        return;
      }
      
      // Try multiple endpoints with the working API URL
      let rafflesArray = [];
      let success = false;
      
      // Try the standard raffles endpoint
      try {
        console.log(`🔎 Fetching from ${apiUrl}/raffles`);
        const response = await axios.get(`${apiUrl}/raffles`, {
          headers: { 'x-admin-key': adminKey }
        });
        console.log('✅ Raffles API response:', response.data);
        
        if (Array.isArray(response.data)) {
          rafflesArray = response.data;
          success = true;
        } else if (response.data && Array.isArray(response.data.data)) {
          rafflesArray = response.data.data;
          success = true;
        } else if (response.data && Array.isArray(response.data.raffles)) {
          rafflesArray = response.data.raffles;
          success = true;
        }
      } catch (err) {
        console.warn('⚠️ Standard raffles endpoint failed:', err.message);
        // Fall through to admin endpoint
      }
      
      // If standard endpoint failed, try admin/all endpoint
      if (!success) {
        try {
          console.log(`🔎 Trying ${apiUrl}/raffles/admin/all`);
          const response = await axios.get(`${apiUrl}/raffles/admin/all`, {
            headers: { 'x-admin-key': adminKey }
          });
          console.log('✅ Admin raffles response:', response.data);
          
          if (Array.isArray(response.data)) {
            rafflesArray = response.data;
            success = true;
          } else if (response.data && Array.isArray(response.data.data)) {
            rafflesArray = response.data.data;
            success = true;
          } else if (response.data && Array.isArray(response.data.raffles)) {
            rafflesArray = response.data.raffles;
            success = true;
          }
        } catch (err) {
          console.warn('⚠️ Admin raffles endpoint failed:', err.message);
          // Fall through
        }
      }
      
      // If we still don't have raffles, try one more fallback
      if (!success) {
        try {
          console.log(`🔎 Final attempt: ${apiUrl}/admin/raffles`);
          const response = await axios.get(`${apiUrl}/admin/raffles`, {
            headers: { 'x-admin-key': adminKey }
          });
          
          if (Array.isArray(response.data)) {
            rafflesArray = response.data;
          } else if (response.data && Array.isArray(response.data.data)) {
            rafflesArray = response.data.data;
          } else if (response.data && Array.isArray(response.data.raffles)) {
            rafflesArray = response.data.raffles;
          }
        } catch (err) {
          console.error('❌ All raffle endpoints failed:', err.message);
          setStatusError('No se pudieron cargar las rifas: ' + err.message);
        }
      }
      
      if (rafflesArray.length === 0) {
        console.warn('No raffles found in any API responses');
      }
      
      // Categorize raffles by status as described in our application requirements
      const activeRaffles = rafflesArray.filter(raffle => raffle.status === 'active');
      const previousRaffles = rafflesArray.filter(raffle => raffle.status === 'completed');
      const otherRaffles = rafflesArray.filter(
        raffle => raffle.status !== 'active' && raffle.status !== 'completed'
      );

      console.log('Active raffles:', activeRaffles);
      console.log('Previous raffles:', previousRaffles);
      console.log('Other raffles:', otherRaffles);

      setRafflesForManager({
        active: activeRaffles.length > 0 ? activeRaffles[0] : null,
        previous: previousRaffles.length > 0 ? previousRaffles[0] : null,
        others: otherRaffles,
        allRaffles: rafflesArray
      });
