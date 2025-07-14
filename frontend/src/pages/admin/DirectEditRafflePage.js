import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { isAdminLoggedIn } from '../../utils/adminAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

// Define API URL constants with multiple possible backend server URLs
const API_URLS = [
  'http://localhost:5100/api', // Current active backend server 
  '/api',                     // Production/relative path
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

const DirectEditRafflePage = () => {
  const { id: raffleId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const adminKey = localStorage.getItem('admin_key');
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    maxTickets: 0,
    ticketPriceUSD: 0,
    ticketPriceBS: 0,
    status: 'active',
    imageFile: null,
    imagePreview: ''
  });
  const [fetchError, setFetchError] = useState(null);
  const [apiUrl, setApiUrl] = useState(API_URLS[0]); // Initialize with first option

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      setFetchError("Acceso denegado. Por favor, configura la Admin Key.");
      setFetchLoading(false);
      return;
    }
    
    const loadRaffleData = async () => {
      setFetchLoading(true);
      setFetchError(null);
      
      // Check if we're in dev mode with mock raffles
      const devMode = localStorage.getItem('dev_mode') === 'true';
      const isMockRaffle = raffleId && raffleId.startsWith('mock-raffle');
      
      // If in dev mode and this is a mock raffle, use mock data
      if (devMode && isMockRaffle) {
        console.log('🔍 DirectEditRafflePage - Using mock data for raffle:', raffleId);
        
        // Create mock data based on the raffle ID
        const mockRaffles = {
          'mock-raffle-1': {
            _id: 'mock-raffle-1',
            title: 'Gran Regreso a Clases',
            description: 'Rifa para el regreso a clases',
            imageUrl: '/images/raffle-default.png',
            ticketPrice: 1.5,
            priceBS: 300,
            exchangeRate: 200,
            currencyCode: 'USD',
            maxTickets: 10000,
            soldTickets: 0,
            status: 'active',
            startDate: '2025-08-01',
            endDate: '2025-09-30',
            drawDate: '2025-10-05',
            minTicketsPerPurchase: {
              'pago-movil': 2,
              'zelle': 10,
              'binance': 10
            },
            prize: {
              name: 'Kit Escolar Completo',
              description: 'Incluye mochila, útiles y tablet'
            }
          },
          'mock-raffle-2': {
            _id: 'mock-raffle-2',
            title: 'Rifa de Navidad',
            description: 'Rifa especial de Navidad',
            imageUrl: '/images/raffle-default.png',
            ticketPrice: 2,
            priceBS: 500,
            exchangeRate: 250,
            currencyCode: 'USD',
            maxTickets: 5000,
            soldTickets: 0,
            status: 'inactive',
            startDate: '2025-11-01',
            endDate: '2025-12-20',
            drawDate: '2025-12-24',
            minTicketsPerPurchase: {
              'pago-movil': 2,
              'zelle': 10,
              'binance': 10
            },
            prize: {
              name: 'Cesta Navideña',
              description: 'Incluye productos típicos navideños'
            }
          },
          'mock-raffle-3': {
            _id: 'mock-raffle-3',
            title: 'Rifa de Año Nuevo',
            description: 'Celebra el año nuevo con esta rifa',
            imageUrl: '/images/raffle-default.png',
            ticketPrice: 3,
            priceBS: 750,
            exchangeRate: 250,
            currencyCode: 'USD',
            maxTickets: 3000,
            soldTickets: 3000,
            status: 'completed',
            startDate: '2025-12-01',
            endDate: '2025-12-30',
            drawDate: '2026-01-05',
            minTicketsPerPurchase: {
              'pago-movil': 2,
              'zelle': 10,
              'binance': 10
            },
            prize: {
              name: 'Viaje para 2 personas',
              description: 'Incluye boletos y hospedaje'
            }
          }
        };
        
        // Get the mock raffle data
        const data = mockRaffles[raffleId];
        
        if (data) {
          console.log('✅ DirectEditRafflePage - Using mock raffle data:', data);
          setApiUrl('http://localhost:5100/api'); // Default API URL for mock mode
          
          // Add artificial delay to simulate loading
          setTimeout(() => {
            setInitialData(data);
            setFetchLoading(false);
          }, 500);
          return;
        }
      }
      
      try {
        // Try to find a working API URL first
        console.log('🔍 DirectEditRafflePage - Finding working API URL...');
        const workingUrl = await findWorkingApiUrl();
        setApiUrl(workingUrl);
        console.log('🔍 DirectEditRafflePage - Using API URL:', workingUrl);
        
        console.log('🔍 DirectEditRafflePage - Loading raffle data');
        console.log('🔍 DirectEditRafflePage - Raffle ID:', raffleId);
        console.log('🔍 DirectEditRafflePage - API URL:', `${workingUrl}/raffles/${raffleId}`);
        console.log('🔍 DirectEditRafflePage - Admin Key present:', !!localStorage.getItem('admin_key'));
        
        const response = await axios.get(
          `${workingUrl}/raffles/${raffleId}`,
          {
            headers: {
              'x-admin-key': localStorage.getItem('admin_key')
            }
          }
        );
        
        console.log('✅ DirectEditRafflePage - API Response:', response.data);
        console.log('🔍 DEBUG - priceBS from API:', response.data.priceBS);
        console.log('🔍 DEBUG - ticketPriceBS from API:', response.data.ticketPriceBS);
        
        const data = response.data;
        
        // Format initial data for the form
        setInitialData({
          title: data.title || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          ticketPrice: data.ticketPrice || 0,
          ticketPriceBS: data.priceBS || 0, // Add this line to grab priceBS from API response
          currencyCode: data.currencyCode || 'USD',
          exchangeRate: data.exchangeRate || 0,
          startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
          drawDate: data.drawDate ? new Date(data.drawDate).toISOString().split('T')[0] : '',
          maxTickets: data.maxTickets || 10000,
          minTicketsPerPurchase: data.minTicketsPerPurchase || {
            'pago-movil': 2,
            'zelle': 10,
            'binance': 10
          },
          prize: data.prize || {},
          status: data.status || 'draft'
        });
      } catch (err) {
        console.error('❌ DirectEditRafflePage - Error loading raffle data:', err);
        
        // Detailed error logging
        if (err.response) {
          console.error('❌ Status:', err.response.status);
          console.error('❌ Data:', err.response.data);
          console.error('❌ Headers:', err.response.headers);
        } else if (err.request) {
          console.error('❌ No response received. Request:', err.request);
        } else {
          console.error('❌ Error setting up request:', err.message);
        }
        
        setFetchError(`Error al cargar los datos de la rifa: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
      } finally {
        setFetchLoading(false);
      }
    };

    loadRaffleData();
  }, [raffleId]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        maxTickets: initialData.maxTickets || 1000,
        ticketPriceUSD: initialData.ticketPrice || 0,
        ticketPriceBS: initialData.ticketPriceBS || 0,
        status: initialData.status || 'active',
        imageFile: null,
        imagePreview: initialData.imageUrl || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 DirectEditRafflePage - Submitting raffle update');
      console.log('🔍 DirectEditRafflePage - Form data:', formData);
      console.log('🔍 DirectEditRafflePage - Using API URL:', apiUrl);
      
      // Check if we're in dev mode with a mock raffle
      const devMode = localStorage.getItem('dev_mode') === 'true';
      const isMockRaffle = raffleId && raffleId.startsWith('mock-raffle');
      
      // If this is a mock raffle in dev mode, just simulate a successful update
      if (devMode && isMockRaffle) {
        console.log('🔍 DirectEditRafflePage - Development mode detected with mock raffle');
        console.log('🔍 DirectEditRafflePage - Simulating successful update');
        
        // Simulate a delay like a network request
        setTimeout(() => {
          console.log('✅ DirectEditRafflePage - Mock update successful');
          alert('Rifa actualizada con éxito (Modo desarrollo)');
          navigate('/admin');
          setLoading(false);
        }, 500);
        return;
      }
      
      // Real API update for non-mock raffles
      // Get admin key from localStorage
      const adminKey = localStorage.getItem('admin_key');
      
      if (!adminKey) {
        console.error('❌ No admin key found in localStorage');
        setError('Error de autenticación: No se encontró la clave de administrador');
        return;
      }
      
      console.log('🔑 Admin key present, attempting request...');
      
      // Try different authentication header formats
      try {
        // Log the exact data being sent to server
        console.log('🔍 DEBUG - PUT request URL:', `${apiUrl}/raffles/${raffleId}`);
        console.log('🔍 DEBUG - PUT request data:', JSON.stringify(formData, null, 2));
        console.log('🔍 DEBUG - priceBS value being sent:', formData.priceBS);
        
        // Send the request
        const response = await axios.put(
          `${apiUrl}/raffles/${raffleId}`,
          formData,
          {
            headers: {
              'x-admin-key': adminKey
            }
          }
        );
        
        console.log('🔍 DEBUG - PUT response:', response.data);
        
        console.log('✅ DirectEditRafflePage - Update successful');
        alert('Rifa actualizada con éxito');
        navigate('/admin');
      } catch (headerError) {
        console.error('First auth header failed, trying alternative:', headerError);
        
        // Try alternative header format
        await axios.put(
          `${apiUrl}/raffles/${raffleId}`,
          formData,
          {
            headers: {
              'X-Admin-Key': adminKey,  // Capitalized header
              'Authorization': `Bearer ${adminKey}`  // Try bearer format too
            }
          }
        );
        
        console.log('✅ DirectEditRafflePage - Update successful with alternative auth');
        alert('Rifa actualizada con éxito');
        navigate('/admin');
      }
    } catch (err) {
      console.error('❌ DirectEditRafflePage - Error updating raffle:', err);
      
      // Detailed error logging
      if (err.response) {
        console.error('❌ Status:', err.response.status);
        console.error('❌ Data:', err.response.data);
        console.error('❌ Headers:', err.response.headers);
      }
      
      setError(`Error al actualizar la rifa: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancelando edición');
    navigate('/admin'); // Navigate back to admin page
  };

  if (fetchLoading) {
    return <LoadingSpinner message="Cargando datos de la rifa..." />;
  }

  if (fetchError) {
    return (
      <div className="p-4">
        <ErrorAlert message={fetchError} />
        <button 
          onClick={() => navigate('/admin')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Volver al Panel de Administración
        </button>
      </div>
    );
  }



  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    
    console.log('🔍 DEBUG - Current formData:', formData);
    console.log('🔍 DEBUG - Current ticketPriceBS value:', formData.ticketPriceBS);
    
    const raffleData = {
      title: formData.title,
      maxTickets: formData.maxTickets,
      ticketPrice: formData.ticketPriceUSD, // Main price in USD
      priceBS: Number(formData.ticketPriceBS), // Convert to number and send as priceBS
      ticketPriceBS: Number(formData.ticketPriceBS), // Try both field names
      status: formData.status === true || formData.status === 'active' ? 'active' : 'inactive',
      imageUrl: formData.imagePreview || initialData.imageUrl
      // Include other fields from initialData that we aren't showing in this simplified form
    };
    
    console.log('🔍 DEBUG - Sending raffleData:', raffleData);
    
    // Combine with other existing data from the initialData
    const updatedRaffle = { ...initialData, ...raffleData };
    handleSubmit(updatedRaffle);
  };

  return (
    <div className="min-h-screen bg-blue-950 p-4 text-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Rifas</h1>
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                // Make sure we're staying on admin section, this will reuse authentication
                navigate('/admin', { state: { authenticated: true, adminKey, showRaffles: true } });
              }}
              className="bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 rounded-md focus:outline-none border border-blue-700 transition duration-200"
            >
              Volver a Gestión de Rifas
            </button>
            <button 
              onClick={handleCancel}
              className="bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 rounded-md focus:outline-none border border-blue-700 transition duration-200"
            >
              Volver al Panel Admin
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Active Raffles */}
          <div className="bg-[#111827] p-4 rounded-lg shadow border border-blue-900">
            <h2 className="text-xl font-bold mb-4">Rifas Activas</h2>
            {initialData && (
              <div className="border border-blue-800 p-3 rounded-lg bg-[#0f172a] mb-2">
                <div className="font-bold">{initialData.title}</div>
                <div className="text-sm text-gray-300">Precio: $ {initialData.ticketPrice} / Bs. {initialData.ticketPriceBS || '0'}</div>
                <div className="flex justify-end mt-2">
                  <span className="px-2 py-1 text-xs rounded bg-green-700 text-white">Activa</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Middle column - Instructions */}
          <div className="bg-[#111827] p-4 rounded-lg shadow border border-blue-900">
            <h2 className="text-xl font-bold mb-4">Instrucciones</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Selecciona una rifa de la lista para editar sus detalles.</li>
              <li>Configura precios independientes para USD y Bolivares.</li>
              <li>Selecciona la moneda predeterminada para mostrar primero.</li>
              <li>Guarda los cambios para actualizarlos inmediatamente.</li>
            </ol>
          </div>
          
          {/* Right column - Edit Form */}
          <div className="bg-[#111827] p-4 rounded-lg shadow border border-blue-900">
            <h2 className="text-xl font-bold mb-4">Editar Rifa</h2>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-white p-3 rounded-md mb-4">{error}</div>}
            
            {initialData && (
              <form onSubmit={handleSaveChanges} className="space-y-4">
                {/* Statistics */}
                <div className="mb-4">
                  <h3 className="font-bold mb-2">Estadísticas de Venta</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-[#1a1e2c] p-2 rounded-lg border border-blue-800">
                      <div className="text-gray-300">Vendidos:</div>
                      <div className="font-bold text-yellow-400 text-lg">{initialData.soldTickets || 0}</div>
                    </div>
                    <div className="bg-[#1a1e2c] p-2 rounded-lg border border-blue-800">
                      <div className="text-gray-300">Disponibles:</div>
                      <div className="font-bold text-green-400 text-lg">{initialData.maxTickets - (initialData.soldTickets || 0)}</div>
                    </div>
                    <div className="bg-[#1a1e2c] p-2 rounded-lg border border-blue-800">
                      <div className="text-gray-300">Total:</div>
                      <div className="font-bold text-blue-400 text-lg">{initialData.maxTickets}</div>
                    </div>
                  </div>
                </div>
                
                {/* Image upload */}
                <div className="mb-4">
                  <label className="block font-bold mb-2">Imagen de la Rifa</label>
                  <div className="flex items-center space-x-2">
                    {formData.imagePreview && (
                      <img 
                        src={formData.imagePreview} 
                        alt="Preview" 
                        className="w-12 h-12 object-cover rounded-md" 
                      />
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button 
                      type="button" 
                      onClick={handleTriggerFileInput}
                      className="px-3 py-2 bg-blue-800 hover:bg-blue-700 rounded-md text-sm flex items-center"
                    >
                      <span>Choose File</span>
                    </button>
                    <span className="text-sm">{formData.imageFile ? formData.imageFile.name : 'No file chosen'}</span>
                  </div>
                </div>
                
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block font-bold mb-1">Título de la Rifa</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2 bg-[#1e293b] border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {/* Max tickets */}
                <div>
                  <label htmlFor="maxTickets" className="block font-bold mb-1">Total de Tickets</label>
                  <input
                    type="number"
                    id="maxTickets"
                    name="maxTickets"
                    value={formData.maxTickets}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-2 bg-[#1e293b] border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {/* USD Price */}
                <div>
                  <label htmlFor="ticketPriceUSD" className="block font-bold mb-1">Precio del Ticket en USD ($)</label>
                  <input
                    type="number"
                    id="ticketPriceUSD"
                    name="ticketPriceUSD"
                    value={formData.ticketPriceUSD}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 bg-[#1e293b] border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {/* Bs Price */}
                <div>
                  <label htmlFor="ticketPriceBS" className="block font-bold mb-1">Precio del Ticket en Bolivares (Bs)</label>
                  <input
                    type="number"
                    id="ticketPriceBS"
                    name="ticketPriceBS"
                    value={formData.ticketPriceBS}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-2 bg-[#1e293b] border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {/* Status checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="status" className="font-bold">Activa</label>
                </div>
                
                {/* Buttons */}
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-green-700 hover:bg-green-600 rounded-md font-medium focus:outline-none transition-all duration-200"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md font-medium focus:outline-none transition-all duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectEditRafflePage;
