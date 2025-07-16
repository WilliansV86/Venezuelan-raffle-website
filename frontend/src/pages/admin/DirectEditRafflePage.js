import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { isAdminLoggedIn } from '../../utils/adminAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

// Using the centralized API service from api.js
// This ensures consistent API URL and authentication across the application

const DirectEditRafflePage = () => {
  const { id: raffleId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    priceBS: 0,
    maxTickets: 0,
    drawDate: '',
    status: 'active',
    imageFile: null,
    imagePreview: ''
  });
  const [fetchError, setFetchError] = useState(null);

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
          
          // Add artificial delay to simulate loading
          setTimeout(() => {
            setInitialData(data);
            setFetchLoading(false);
          }, 500);
          return;
        }
      }
      
      try {
        console.log('🔍 DirectEditRafflePage - Loading raffle data');
        console.log('🔍 DirectEditRafflePage - Raffle ID:', raffleId);
        
        // Use the centralized API service that handles auth automatically
        const response = await api.get(`/api/raffles/${raffleId}`);
        
        console.log('✅ DirectEditRafflePage - API Response:', response.data);
        console.log('🔍 DEBUG - priceBS from API:', response.data.priceBS);
        
        // Set the state with the raffle data
        setInitialData(response.data);
        
        // Also map response data to our form structure
        setFormData({
          name: response.data.name || '',
          description: response.data.description || '',
          maxTickets: response.data.maxTickets || 0,
          price: response.data.price || 0,
          priceBS: response.data.priceBS || 0,
          drawDate: response.data.drawDate || '',
          status: response.data.status || 'draft',
          imagePreview: response.data.image || '',
          imageFile: null // Will be set when user selects a new file
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
      
      // Real API update for non-mock raffles using the centralized API service
      console.log('🔍 DEBUG - PUT request data:', JSON.stringify(formData, null, 2));
      console.log('🔍 DEBUG - priceBS value being sent:', formData.priceBS);

      const response = await api.put(`/api/raffles/${raffleId}`, formData);

      console.log('✅ DirectEditRafflePage - Update successful');
      console.log('✅ Response:', response.data);
      
      alert('Rifa actualizada con éxito');
      navigate('/admin');
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
    const { name, value, type } = e.target;
    
    // Handle different input types appropriately
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    
    // Create object with field names that match the backend expectations
    const raffleData = {
      name: formData.name,
      description: formData.description || initialData?.description || '',
      maxTickets: Number(formData.maxTickets),
      price: Number(formData.price), // Main price in USD
      priceBS: Number(formData.priceBS), // Price in Bs
      drawDate: formData.drawDate || initialData?.drawDate,
      status: formData.status,
      image: formData.imagePreview || initialData?.image
      // Other fields will be preserved from the original raffle data
    };
    
    console.log('🔍 DEBUG - Sending raffleData:', raffleData);
    
    // Send only the fields we've modified
    handleSubmit(raffleData);
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
                <div className="font-bold">{initialData.name}</div>
                <div className="text-sm text-gray-300">Precio: $ {initialData.price} / Bs. {initialData.priceBS || '0'}</div>
                <div className="flex justify-end mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${initialData.status === 'active' ? 'bg-green-700' : initialData.status === 'completed' ? 'bg-red-700' : 'bg-gray-600'} text-white`}>
                    {initialData.status === 'active' ? 'Activa' : initialData.status === 'completed' ? 'Completada' : 'Borrador'}
                  </span>
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
                
                {/* Title (name in backend) */}
                <div>
                  <label htmlFor="name" className="block font-bold mb-1">Título de la Rifa</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 bg-[#1e293b] border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block font-bold mb-1">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-[#1e293b] border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows="3"
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
                
                {/* Draw Date */}
                <div>
                  <label htmlFor="drawDate" className="block font-bold mb-1">Fecha del Sorteo</label>
                  <input
                    type="date"
                    id="drawDate"
                    name="drawDate"
                    value={formData.drawDate}
                    onChange={handleChange}
                    className="w-full p-2 bg-[#1e293b] border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {/* USD Price */}
                <div>
                  <label htmlFor="price" className="block font-bold mb-1">Precio del Ticket en USD ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 bg-[#1e293b] border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {/* Bs Price */}
                <div>
                  <label htmlFor="priceBS" className="block font-bold mb-1">Precio del Ticket en Bolivares (Bs)</label>
                  <input
                    type="number"
                    id="priceBS"
                    name="priceBS"
                    value={formData.priceBS}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-2 bg-[#1e293b] border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {/* Status dropdown */}
                <div>
                  <label htmlFor="status" className="block font-bold mb-1">Estado de la Rifa</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status || 'draft'}
                    onChange={handleChange}
                    className="w-full p-2 bg-[#1e293b] border border-blue-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="draft">Borrador</option>
                    <option value="active">Activa</option>
                    <option value="completed">Completada</option>
                  </select>
                </div>
                
                {/* Buttons */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
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
