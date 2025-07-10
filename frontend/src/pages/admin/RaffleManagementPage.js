import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RaffleManagementPage = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected raffle for editing
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [raffleStats, setRaffleStats] = useState(null);
  const [newRaffleImage, setNewRaffleImage] = useState(null);
  
  const navigate = useNavigate();
  const adminKey = localStorage.getItem('adminKey') || 'test-admin-key-123';
  
  // Load raffles on component mount
  useEffect(() => {
    fetchRaffles();
  }, []);

  // Fetch raffle stats when a raffle is selected
  useEffect(() => {
    const fetchRaffleStats = async () => {
      if (selectedRaffle) {
        setRaffleStats(null); // Reset previous stats
        try {
          const response = await axios.get(`http://localhost:5100/api/raffles/${selectedRaffle._id}/stats`, {
            headers: { 'x-admin-key': adminKey }
          });
          if (response.data.success) {
            setRaffleStats(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching raffle stats:', error);
        }
      }
    };

    fetchRaffleStats();
  }, [selectedRaffle, adminKey]);
  
  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5100/api/raffles', {
        headers: {
          'x-admin-key': adminKey
        }
      });
      setRaffles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching raffles:', error);
      setError('Error cargando las rifas. Por favor intente de nuevo.');
      setLoading(false);
    }
  };
  
  const handleSelectRaffle = (raffle) => {
    setSelectedRaffle({
      ...raffle,
      ticketPriceUSD: raffle.ticketPriceUSD || 5,
      ticketPriceBS: raffle.ticketPriceBS || 4000
    });
    setNewRaffleImage(null); // Reset file input on new selection
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedRaffle({
      ...selectedRaffle,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNewRaffleImage(e.target.files[0]);
    }
  };
  
  const handleSaveRaffle = async () => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    
    // Append all text fields from the selected raffle
    Object.keys(selectedRaffle).forEach(key => {
      // Avoid sending fields that are auto-generated or handled separately
      if (!['_id', 'createdAt', 'updatedAt', 'imageUrl'].includes(key)) {
        formData.append(key, selectedRaffle[key]);
      }
    });

    // Append the new image file if one was selected
    if (newRaffleImage) {
      formData.append('raffleImage', newRaffleImage);
    }

    try {
      const response = await axios.put(`http://localhost:5100/api/admin/raffles/${selectedRaffle._id}`, formData, {
        headers: {
          'x-admin-key': adminKey,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the raffle in the list with the new data from the server
      setRaffles(raffles.map(r => (r._id === response.data._id ? response.data : r)));
      
      // Reset selection and form state
      setSelectedRaffle(null);
      setNewRaffleImage(null);
      setRaffleStats(null);
      alert('¡Rifa actualizada exitosamente!');

    } catch (error) {
      console.error('Error saving raffle:', error);
      setError('Error guardando los cambios. Por favor intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-5">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Rifas</h1>
          <button 
            onClick={() => navigate('/admin/payments')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Volver al Panel Admin
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-100 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Raffle list */}
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">Rifas Activas</h2>
            {loading ? (
              <p className="text-gray-400">Cargando rifas...</p>
            ) : (
              <div className="space-y-3">
                {raffles.map(raffle => (
                  <div 
                    key={raffle._id}
                    onClick={() => handleSelectRaffle(raffle)}
                    className={`p-3 rounded cursor-pointer border ${
                      selectedRaffle?._id === raffle._id
                        ? 'bg-blue-900/30 border-blue-500'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    <h3 className="font-medium">{raffle.title}</h3>
                    <div className="flex justify-between text-sm text-gray-300 mt-1">
                      <span>
                        Precio: $ {raffle.ticketPriceUSD} / Bs. {raffle.ticketPriceBS}
                      </span>
                      <span className={raffle.isActive ? 'text-green-400' : 'text-red-400'}>
                        {raffle.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {raffles.length === 0 && (
                  <p className="text-gray-400">No hay rifas disponibles</p>
                )}
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="bg-gray-800 p-4 rounded" style={{height: 'fit-content'}}>
            <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-300">
                1. Selecciona una rifa de la lista para editar sus detalles.
              </p>
              <p className="text-sm text-gray-300 mt-2">
                2. Configura precios independientes para USD y Bolivares.
              </p>
              <p className="text-sm text-gray-300 mt-2">
                3. Selecciona la moneda predeterminada para mostrar primero.
              </p>
              <p className="text-sm text-gray-300 mt-2">
                4. Guarda los cambios para actualizarlos inmediatamente.
              </p>
            </div>
          </div>
          
          {/* Edit raffle */}
          {selectedRaffle && (
            <div className="bg-gray-800 p-4 rounded">
              <h2 className="text-xl font-semibold mb-4">Editar Rifa</h2>

              {/* Raffle Stats */}
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mb-4">
                <h3 className="font-bold text-lg mb-2">Estadísticas de Venta</h3>
                {raffleStats ? (
                  <div className="text-sm grid grid-cols-3 gap-2">
                    <p>Vendidos: <span className="font-bold text-green-400">{raffleStats.soldTickets}</span></p>
                    <p>Disponibles: <span className="font-bold text-yellow-400">{raffleStats.remainingTickets}</span></p>
                    <p>Total: <span className="font-bold">{raffleStats.totalTickets}</span></p>
                  </div>
                ) : (
                  <p>Cargando estadísticas...</p>
                )}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveRaffle(); }}>
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block mb-2">Imagen de la Rifa</label>
                    <div className="flex items-center space-x-4">
                      <img src={selectedRaffle.imageUrl} alt="Raffle" className="w-24 h-24 object-cover rounded-lg"/>
                      <input 
                        type="file"
                        name="raffleImage"
                        onChange={handleImageChange}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block mb-1">Título de la Rifa</label>
                    <input 
                      type="text" 
                      name="title"
                      value={selectedRaffle.title}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    />
                  </div>

                  {/* Total Tickets */}
                  <div>
                    <label className="block mb-1">Total de Tickets</label>
                    <input 
                      type="number" 
                      name="totalTickets"
                      value={selectedRaffle.totalTickets}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    />
                  </div>
                  
                  {/* Price USD */}
                  <div>
                    <label className="block mb-1">Precio del Ticket en USD ($)</label>
                    <input 
                      type="number" 
                      name="ticketPriceUSD"
                      value={selectedRaffle.ticketPriceUSD}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    />
                  </div>

                  {/* Price BS */}
                  <div>
                    <label className="block mb-1">Precio del Ticket en Bolívares (Bs)</label>
                    <input 
                      type="number" 
                      name="ticketPriceBS"
                      value={selectedRaffle.ticketPriceBS}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    />
                  </div>

                  {/* Is Active */}
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="isActive"
                      checked={selectedRaffle.isActive}
                      onChange={(e) => setSelectedRaffle({ ...selectedRaffle, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <label>Activa</label>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="mt-6 flex space-x-2">
                  <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button type="button" onClick={() => setSelectedRaffle(null)} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RaffleManagementPage;
