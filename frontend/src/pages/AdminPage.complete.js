import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import apiConfig from '../config/apiConfig';


// Define API URL constants with multiple possible backend server URLs
const API_URLS = [
  '/api',                     // Production/relative path
  apiConfig.API_URL.replace("/api", "") + "/api", // Most common dev server
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
  const [adminKey, setAdminKey] = useState(localStorage.getItem('admin_key') || '');
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

  // Check if adminKey exists in localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
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
          'x-admin-key': key,
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
        localStorage.removeItem('admin_key');
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
      // Final cleanup
      setStatusLoading(false);
    } catch (err) {
      console.error('Error fetching raffles for manager:', err);
      setStatusError('Error al cargar las rifas: ' + err.message);
      setStatusLoading(false);
    }
  };

  const fetchRaffles = async (key, apiUrl = API_URLS[0]) => {
    try {
      setRaffleLoading(true);
      setRaffleError(null);
      
      console.log(`🔎 Fetching admin raffles from ${apiUrl}/raffles/admin/all`);
      
      try {
        const response = await axios.get(`${apiUrl}/raffles/admin/all`, {
          headers: { 'x-admin-key': key }
        });
        
        console.log('✅ Admin raffles response:', response.data);
        
        if (response.data && response.data.success) {
          setRaffles(response.data.data);
        } else if (Array.isArray(response.data)) {
          setRaffles(response.data);
        } else if (response.data && Array.isArray(response.data.raffles)) {
          setRaffles(response.data.raffles);
        } else {
          console.warn('Unexpected format for admin raffles');
          setRaffleError('Formato de respuesta inesperado');
        }
      } catch (error) {
        console.warn(`⚠️ Admin/all endpoint failed: ${error.message}`);
        
        // Try fallback to just /raffles endpoint
        try {
          console.log(`🔎 Trying fallback to ${apiUrl}/raffles`);
          const fallbackResponse = await axios.get(`${apiUrl}/raffles`, {
            headers: { 'x-admin-key': key }
          });
          
          if (Array.isArray(fallbackResponse.data)) {
            setRaffles(fallbackResponse.data);
          } else if (fallbackResponse.data && Array.isArray(fallbackResponse.data.data)) {
            setRaffles(fallbackResponse.data.data);
          } else {
            setRaffleError('No se pudieron cargar las rifas');
          }
        } catch (fallbackError) {
          console.error('❌ Both raffle endpoints failed');
          setRaffleError('Error al cargar las rifas: ' + error.message);
        }
      }
    } catch (err) {
      console.error('❌ Unhandled error in fetchRaffles:', err);
      setRaffleError(err.message || 'Error al obtener rifas');
    } finally {
      setRaffleLoading(false);
    }
  };

  const processEmails = async () => {
    try {
      const response = await callAdminAPI('/admin/process-emails', 'POST');
      console.log(response);
      alert('Emails processed successfully');
    } catch (err) {
      console.error(err);
      alert('Error processing emails');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_key');
    setAuthenticated(false);
    setAdminKey('');
  };

  const handlePromoteRaffle = async (raffleId) => {
    try {
      setStatusLoading(true);
      setUpdateSuccess(false);
      
      const response = await callAdminAPI(`/raffles/${raffleId}/status`, 'PUT', {
        status: 'active'
      });
      
      if (response.success) {
        setUpdateSuccess(true);
        await fetchRafflesForManager();
      } else {
        setStatusError('Error promoting raffle');
      }
    } catch (err) {
      console.error(err);
      setStatusError(err.message || 'Error updating raffle status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDemoteActiveRaffle = async () => {
    try {
      if (!rafflesForManager.active || !rafflesForManager.active._id) {
        setStatusError('No active raffle found');
        return;
      }
      
      setStatusLoading(true);
      setUpdateSuccess(false);
      
      const response = await callAdminAPI(
        `/raffles/${rafflesForManager.active._id}/status`, 
        'PUT', 
        { status: 'inactive' }
      );
      
      if (response.success) {
        setUpdateSuccess(true);
        await fetchRafflesForManager();
      } else {
        setStatusError('Error demoting active raffle');
      }
    } catch (err) {
      console.error(err);
      setStatusError(err.message || 'Error updating raffle status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSwapPositions = async (raffleId, direction) => {
    try {
      setStatusLoading(true);
      
      await callAdminAPI(`/raffles/${raffleId}/position`, 'PUT', {
        direction // 'up' or 'down'
      });
      
      await fetchRafflesForManager();
    } catch (err) {
      console.error(err);
      setStatusError('Error updating raffle position');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleEditRaffle = (raffle) => {
    navigate(`/admin/raffles/${raffle._id}/edit`, { 
      state: { 
        raffle,
        adminKey
      } 
    });
  };

  const openTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeTransactionDetails = () => {
    setSelectedTransaction(null);
  };

  const updateTransactionStatus = async (id, status, notes) => {
    try {
      const response = await callAdminAPI(`/admin/transactions/${id}/status`, 'PUT', {
        status,
        adminNotes: notes
      });
      
      if (response.success) {
        setTransactions(transactions.map(t => 
          t._id === id ? { ...t, status, adminNotes: notes } : t
        ));
        setSelectedTransaction(null);
      } else {
        throw new Error('Failed to update transaction status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating transaction: ' + err.message);
    }
  };

  // Handle login submit
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    if (!adminKey) {
      alert('Please enter admin key');
      return;
    }
    
    try {
      // Try to verify admin key with multiple API URLs
      for (const apiUrl of API_URLS) {
        try {
          console.log(`Attempting to verify admin key with ${apiUrl}/admin/verify`);
          const response = await axios.post(`${apiUrl}/admin/verify`, {
            adminKey
          });
          
          if (response.data && response.data.success) {
            console.log('Admin key verified successfully');
            localStorage.setItem('admin_key', adminKey);
            setAuthenticated(true);
            setWorkingApiUrl(apiUrl);
            return; // Success, exit the function
          }
        } catch (err) {
          console.warn(`Admin key verification failed with ${apiUrl}:`, err.message);
          // Continue to next API URL
        }
      }
      
      // If we reach here, all API URLs failed
      throw new Error('Could not verify admin key with any API endpoint');
    } catch (err) {
      console.error('Admin authentication failed:', err);
      alert('Admin authentication failed: ' + err.message);
    }
  };

  // Render login screen if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Admin Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter admin key"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main admin panel layout
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-yellow-400 text-2xl font-bold">Panel Administrativo</h1>
        </div>
        
        {/* Status Indicator */}
        {statusLoading && (
          <div className="mb-4 flex items-center">
            <div className="animate-spin mr-2 h-5 w-5 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <span className="text-blue-400">Cargando datos...</span>
          </div>
        )}
        
        {statusError && (
          <div className="mb-4 bg-red-900 border-l-4 border-red-500 text-red-100 p-4 rounded">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{statusError}</span>
            </div>
          </div>
        )}
        
        {/* Button Row with improved styling */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setShowRaffleManager(!showRaffleManager)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            disabled={statusLoading}
          >
            {showRaffleManager ? 'Mostrar Transacciones' : 'Gestionar Rifas'}
          </button>
          <button 
            onClick={processEmails}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
            disabled={statusLoading}
          >
            Procesar Emails Pendientes
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {showRaffleManager ? (
        <div className="space-y-6">
          {statusLoading ? (
            <div className="text-center py-12 bg-gray-800/60 rounded-lg shadow-lg">
              <LoadingSpinner />
              <p className="mt-4 text-gray-400 animate-pulse">Cargando gestión de rifas...</p>
            </div>
          ) : statusError ? (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 mb-6 text-red-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {statusError}
            </div>
          ) : (
            <div className="space-y-6">
              {updateSuccess && (
                <div className="bg-green-900/30 border border-green-800 rounded-lg p-6 mb-6 text-green-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  ¡Status actualizado con éxito!
                </div>
              )}

              {/* Rest of the raffle manager UI */}
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                {/* Your existing raffle manager code here */}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Transaction Table */}
          {!showRaffleManager && (
            <>
              <div className="bg-gray-800 rounded-lg shadow-lg mb-8">
                <div className="flex justify-between items-center border-b border-gray-700 p-4">
                  <h3 className="text-xl font-bold text-yellow-400">Transacciones Recientes</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => fetchTransactions(adminKey)}
                      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200 text-sm"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Actualizar
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {loading ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="text-blue-400 mt-4">Cargando transacciones...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-900 border-l-4 border-red-500 text-red-100 p-4 rounded mb-4">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="bg-gray-700 text-gray-300 p-6 rounded text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No hay transacciones disponibles</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg">
                      <table className="w-full bg-gray-900 text-white text-sm">
                        <thead>
                          <tr className="bg-gray-800">
                            <th className="p-2 text-left border-b border-gray-700">ID</th>
                            <th className="p-2 text-left border-b border-gray-700">Email</th>
                            <th className="p-2 text-left border-b border-gray-700">Monto</th>
                            <th className="p-2 text-left border-b border-gray-700">Estado</th>
                            <th className="p-2 text-left border-b border-gray-700">Fecha</th>
                            <th className="p-2 text-left border-b border-gray-700">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((transaction) => (
                            <tr key={transaction._id} className="hover:bg-gray-800 transition-colors duration-150">
                              <td className="p-2 border-b border-gray-700">{transaction._id.substring(0, 8)}...</td>
                              <td className="p-2 border-b border-gray-700">{transaction.email || 'N/A'}</td>
                              <td className="p-2 border-b border-gray-700">
                                {new Intl.NumberFormat('es-VE', {
                                  style: 'currency',
                                  currency: 'USD'
                                }).format(transaction.amount || 0)}
                              </td>
                              <td className="p-2 border-b border-gray-700">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    transaction.status === 'completed'
                                      ? 'bg-green-900 text-green-200'
                                      : transaction.status === 'pending'
                                      ? 'bg-yellow-900 text-yellow-200'
                                      : 'bg-red-900 text-red-200'
                                  }`}
                                >
                                  {transaction.status === 'completed'
                                    ? 'Completado'
                                    : transaction.status === 'pending'
                                    ? 'Pendiente'
                                    : 'Fallido'}
                                </span>
                              </td>
                              <td className="p-2 border-b border-gray-700">
                                {new Date(transaction.createdAt).toLocaleDateString('es-VE')}
                              </td>
                              <td className="p-2 border-b border-gray-700">
                                <button
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition duration-200 text-sm flex items-center"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Detalles
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
