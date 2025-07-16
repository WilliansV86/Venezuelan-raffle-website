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
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    // description field removed
    price: 0,
    priceBS: 0,
    maxTickets: 0,
    drawDate: '',
    status: 'active',
    imageFile: null,
    imagePreview: '',
    image: '' // To store the original image path
  });
  const [fetchError, setFetchError] = useState(null);

  // Extract the loadRaffleData function so it can be reused
  const loadRaffleData = async () => {
    if (!isAdminLoggedIn()) {
      setFetchError("Acceso denegado. Por favor, configura la Admin Key.");
      setFetchLoading(false);
      return;
    }
    
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
        
        // Map response data to our form structure using consistent field names
        setFormData({
          title: response.data.title || '',
          description: response.data.description || '',
          maxTickets: response.data.maxTickets || 0,
          ticketPriceUSD: response.data.ticketPrice || 0,
          ticketPriceBS: response.data.priceBS || 0,
          drawDate: response.data.drawDate || '',
          status: response.data.status || 'draft',
          imagePreview: response.data.imageUrl || '',
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

  // Add useEffect to call loadRaffleData on component mount
  useEffect(() => {
    loadRaffleData();
  }, [raffleId]);

  useEffect(() => {
    if (initialData) {
      console.log('Setting form data from:', initialData);
      setFormData({
        // Use consistent field names that match the backend model
        name: initialData.name || initialData.title || '',
        // description field removed as requested
        price: initialData.price || initialData.ticketPrice || 0,
        priceBS: initialData.priceBS || initialData.ticketPriceBS || 0,
        maxTickets: initialData.maxTickets || initialData.totalTickets || 1000,
        drawDate: initialData.drawDate || '',
        status: initialData.status || 'active',
        imageFile: null,
        imagePreview: initialData.image || initialData.imageUrl || ''
      });
    }
  }, [initialData]);

  // Submit form data to the API
  const submitFormToAPI = async (formDataToSend) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('🔍 DirectEditRafflePage - Submitting raffle update');
      
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
          setSuccess(true);
          // Stay on the same page instead of navigating away
          setLoading(false);
        }, 500);
        return;
      }
      
      // Real API update for non-mock raffles using the centralized API service
      console.log('🔍 DEBUG - Sending data to API');

      // If no raffle ID, assume we're creating a new raffle (but this component is primarily for editing)
      const isNew = !raffleId;
      const endpoint = isNew ? '/api/raffles' : `/api/raffles/${raffleId}`;
      const method = isNew ? 'post' : 'put';
      
      console.log(`🔍 DEBUG - API ${method.toUpperCase()} request to ${endpoint}`);
      
      try {
        const response = await api[method](endpoint, formDataToSend);
        console.log('✅ DirectEditRafflePage - Update successful');
        console.log('✅ Response:', response.data);
        
        // Set success state and refresh data to show updated values
        setSuccess(true);
        
        // Refresh the form data after successful update
        setTimeout(() => {
          // Reload data from the API to show the updated values
          loadRaffleData();
        }, 1000);
      } catch (apiError) {
        console.error('❌ DirectEditRafflePage - API Error:', apiError);
        
        // Detailed error logging
        if (apiError.response) {
          console.error('❌ Status:', apiError.response.status);
          console.error('❌ Data:', apiError.response.data);
          console.error('❌ Headers:', apiError.response.headers);
          
          // Handle specific error cases
          if (apiError.response.status === 401) {
            setError('Sesión expirada o inválida. Por favor inicie sesión nuevamente.');
            setTimeout(() => {
              localStorage.removeItem('adminInfo'); // Clear invalid token
              navigate('/admin/login'); // Redirect to login
            }, 2000);
          } else {
            setError(`Error al actualizar la rifa: ${apiError.response?.data?.message || apiError.message || 'Error desconocido'}`);
          }
        } else {
          setError(`Error de conexión: ${apiError.message || 'No se pudo conectar con el servidor'}`);
        }
      }
    } catch (err) {
      console.error('❌ DirectEditRafflePage - Unexpected error:', err);
      setError(`Error inesperado: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancelando edición');
    navigate('/admin'); // Navigate back to admin page
  };
  
  // Function to safely navigate to admin panel's raffle management section
  const navigateToAdminPanel = () => {
    // Navigate to admin page with state parameter to show raffles view
    navigate('/admin', { 
      replace: true,
      state: { initialView: 'raffles' } 
    });
  };
  
  // Function to navigate to the transactions page
  const navigateToTransactions = () => {
    // Navigate to admin page with state parameter to show transactions view
    navigate('/admin', { 
      replace: true,
      state: { initialView: 'transactions' } 
    });
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

  const validateForm = () => {
    const errors = {};
    
    // Check required fields
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'El nombre de la rifa es requerido';
    } else if (formData.name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
    // Description validation removed as field has been removed
    
    if (!formData.maxTickets || formData.maxTickets <= 0) {
      errors.maxTickets = 'El número de tickets debe ser mayor que 0';
    } else if (formData.maxTickets > 10000) {
      errors.maxTickets = 'El máximo número de tickets es 10,000';
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'El precio en USD debe ser mayor que 0';
    }
    
    if (formData.priceBS === undefined || formData.priceBS === null || formData.priceBS < 0) {
      errors.priceBS = 'El precio en Bs debe ser 0 o mayor';
    }
    
    if (!formData.drawDate) {
      errors.drawDate = 'La fecha del sorteo es obligatoria';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.drawDate);
      
      if (selectedDate < today) {
        errors.drawDate = 'La fecha del sorteo no puede ser en el pasado';
      }
    }
    
    if (!formData.status) {
      errors.status = 'El estado de la rifa es obligatorio';
    }
    
    // Update validation errors state
    setValidationErrors(errors);
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };
  
  // Error alert component for form fields
  const ErrorFieldMessage = ({ message }) => {
    if (!message) return null;
    return (
      <div className="text-red-500 text-xs mt-1">{message}</div>
    );
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccess(false);
    
    // Validate form before submission
    if (!validateForm()) {
      // Scroll to top to show errors
      window.scrollTo(0, 0);
      return;
    }
    
    console.log('🔍 DEBUG - Saving Changes. Form data:', formData);
    
    // Show confirmation dialog
    if (window.confirm('¿Seguro que desea guardar los cambios?')) {
      setLoading(true);
      
      // Prepare form data for API
      const formDataToSend = new FormData();
      
      // Add text fields (convert number strings to actual numbers)
      formDataToSend.append('name', formData.name.trim());
      // Description field removed as requested by user
      formDataToSend.append('price', Number(formData.price));
      formDataToSend.append('priceBS', Number(formData.priceBS)); // Always send priceBS, even if 0
      formDataToSend.append('maxTickets', Number(formData.maxTickets));
      formDataToSend.append('drawDate', formData.drawDate);
      formDataToSend.append('status', formData.status);
      
      // Add image if a new one was selected
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
        console.log('🔍 DEBUG - Sending image file:', formData.imageFile.name);
      } else if (formData.imagePreview && formData.imagePreview.startsWith('data:')) {
        // If there's a data URL but no file, it's a previously uploaded image preview
        console.log('🔍 DEBUG - No new image selected, image preview exists');
      } else if (initialData && (initialData.image || initialData.imageUrl)) {
        // If no new image and no preview, but we have the original image path, pass it along
        formDataToSend.append('image', initialData.image || initialData.imageUrl);
        console.log('🔍 DEBUG - Using existing image path:', initialData.image || initialData.imageUrl);
      } else {
        console.log('🔍 DEBUG - No image available');
      }
      
      // Log the form data being sent
      console.log('🔍 DEBUG - FormData being sent:');
      for (const pair of formDataToSend.entries()) {
        console.log(`    ${pair[0]}: ${pair[1]}`);
      }
      
      // Submit to API
      submitFormToAPI(formDataToSend);
    }
  };

  return (
    <div className="min-h-screen bg-blue-950 p-4 text-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Rifas</h1>
          <div className="flex space-x-3">
            <button 
              onClick={navigateToAdminPanel}
              className="bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 rounded-md focus:outline-none border border-blue-700 transition duration-200"
            >
              Volver a Gestión de Rifas
            </button>
            <button 
              onClick={navigateToTransactions}
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
            
            {/* Success message */}
            {success && (
              <div className="bg-green-900/50 border border-green-600 text-white p-3 rounded-md mb-4 flex justify-between items-center">
                <span>
                  <strong>¡Éxito!</strong> La rifa ha sido actualizada correctamente.
                </span>
                <button 
                  type="button"
                  onClick={() => setSuccess(false)} 
                  className="text-green-300 hover:text-white focus:outline-none"
                >
                  ×
                </button>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-white p-3 rounded-md mb-4 flex justify-between items-center">
                <span>
                  <strong>Error:</strong> {error}
                </span>
                <button 
                  type="button"
                  onClick={() => setError(null)} 
                  className="text-red-300 hover:text-white focus:outline-none"
                >
                  ×
                </button>
              </div>
            )}
            
            {/* Validation errors summary */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="bg-yellow-900/50 border border-yellow-600 text-white p-3 rounded-md mb-4">
                <strong>Por favor corrige los siguientes campos:</strong>
                <ul className="list-disc ml-5 mt-2">
                  {Object.entries(validationErrors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
            
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
                
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block font-bold mb-1">Nombre de la Rifa</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-2 bg-[#1e293b] border ${validationErrors.name ? 'border-red-500' : 'border-blue-800'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  <ErrorFieldMessage message={validationErrors.name} />
                </div>
                
                {/* Description field removed as requested */}
                
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
                    className={`w-full p-2 bg-[#1e293b] border ${validationErrors.maxTickets ? 'border-red-500' : 'border-blue-800'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  <ErrorFieldMessage message={validationErrors.maxTickets} />
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
                    className={`w-full p-2 bg-[#1e293b] border ${validationErrors.drawDate ? 'border-red-500' : 'border-blue-800'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  <ErrorFieldMessage message={validationErrors.drawDate} />
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
                    className={`w-full p-2 bg-[#1e293b] border ${validationErrors.price ? 'border-red-500' : 'border-blue-800'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  <ErrorFieldMessage message={validationErrors.price} />
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
                    className={`w-full p-2 bg-[#1e293b] border ${validationErrors.priceBS ? 'border-red-500' : 'border-blue-800'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  <ErrorFieldMessage message={validationErrors.priceBS} />
                </div>
                
                {/* Status dropdown */}
                <div>
                  <label htmlFor="status" className="block font-bold mb-1">Estado</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full p-2 bg-[#1e293b] border ${validationErrors.status ? 'border-red-500' : 'border-blue-800'} rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="">Seleccione un estado</option>
                    <option value="draft">Borrador</option>
                    <option value="active">Activo</option>
                    <option value="completed">Completado</option>
                  </select>
                  <ErrorFieldMessage message={validationErrors.status} />
                </div>
                
                {/* Buttons */}
                <div className="flex justify-center mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`${loading ? 'bg-blue-900 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-600'} text-white py-2 px-4 rounded-md flex items-center gap-2`}
                  >
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
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
