import React, { useState } from 'react';
import axios from 'axios';
import { FaTicketAlt, FaCheck, FaTimes, FaClock, FaTrophy } from 'react-icons/fa';
import apiConfig from '../config/apiConfig';

const VerifyTicketsPage = () => {
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [cedulaError, setCedulaError] = useState('');

  const validateCedula = (value) => {
    // Basic validation for Venezuelan cedula format (V- or E- followed by digits)
    const cedulaRegex = /^[VE]-\d+$/;
    return cedulaRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setCedulaError('');
    
    // Validate cedula format
    if (!validateCedula(cedula)) {
      setCedulaError('Por favor, introduce un número de cédula válido (ej: V-12345678)');
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the apiConfig to ensure consistent API URL references
      const response = await axios.get(`${apiConfig.API_URL}/tickets/verify/${encodeURIComponent(cedula)}`);
      const responseData = response.data;
      
      if (!responseData.success) {
        setError(responseData.message || 'Error al verificar los tickets');
        return;
      }
      
      const participant = responseData.participant;
      const ticketsData = responseData.tickets;
      
      // Process tickets and group by raffle
      const raffleMap = {};
      
      for (const ticket of ticketsData) {
        if (!ticket.raffleName) {
          continue; // Skip if missing raffle info
        }
        
        const raffleName = ticket.raffleName;
        if (!raffleMap[raffleName]) {
          raffleMap[raffleName] = {
            id: `raffle-${Math.random().toString(36).substr(2, 9)}`,
            name: raffleName,
            prize: ticket.rafflePrize || 'Premio no especificado',
            isActive: ticket.isActive,
            paymentStatus: ticket.paymentStatus,
            purchaseDate: ticket.purchaseDate,
            tickets: []
          };
        }

        // Add the ticket to the raffle group
        raffleMap[raffleName].tickets.push({
          id: ticket.id || `ticket-${Math.random().toString(36).substr(2, 9)}`,
          number: ticket.ticketNumber,
          isWinner: ticket.isWinner || false
        });
      }
      
      // Convert to array for easier rendering
      const groupedTickets = Object.values(raffleMap);
      
      setTicketData({
        participant: participant,
        tickets: groupedTickets
      });
    } catch (err) {
      console.error('Error verifying tickets:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Error al verificar los tickets');
      } else {
        setError('Error al verificar los tickets. Por favor, intente de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'verified': return 'Verificado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <FaCheck className="text-green-500" />;
      case 'rejected': return <FaTimes className="text-red-500" />;
      default: return <FaClock className="text-yellow-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Verificar Mis Tickets</h1>
        <p className="text-gray-300">
          Introduce tu número de cédula para verificar tus tickets comprados
        </p>
      </div>

      <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl shadow-purple-400/10 border border-purple-500/20 max-w-md mx-auto mb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cedula" className="block text-white mb-2">Número de Cédula o Pasaporte</label>
            <input
              id="cedula"
              type="text"
              placeholder="Ej: 123456778"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className={`w-full bg-gray-800 border ${cedulaError ? 'border-red-500' : 'border-gray-600'} rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
            {cedulaError && <p className="text-red-500 text-sm mt-1">{cedulaError}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition duration-300 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaTicketAlt className="mr-2" />
                Verificar Tickets
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-200 p-4 rounded-lg max-w-2xl mx-auto mb-10">
          <p>{error}</p>
        </div>
      )}

      {ticketData && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl shadow-cyan-400/10 border border-cyan-500/20 mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Información del Participante</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
              <div>
                <span className="text-gray-400 block">Nombre:</span>
                <span className="text-white">{ticketData.participant.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Cédula:</span>
                <span className="text-white">{ticketData.participant.cedula}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Correo:</span>
                <span className="text-white">{ticketData.participant.email}</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">Tus Tickets de Rifa</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {ticketData.tickets.map(raffle => (
              <div 
                key={raffle.id} 
                className={`bg-black/30 backdrop-blur-lg rounded-xl p-4 shadow-lg border ${raffle.tickets.some(t => t.isWinner) ? 'border-yellow-500 shadow-yellow-400/20' : 'border-gray-700/50'}`}
              >
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">{raffle.name}</h3>
                      <p className="text-gray-300">{raffle.prize}</p>
                      <span className="text-gray-400 text-sm block mt-1">
                        Comprado el {formatDate(raffle.purchaseDate)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center mb-2">
                        {getPaymentStatusIcon(raffle.paymentStatus)}
                        <span className="ml-2 text-gray-300">
                          Pago: {getPaymentStatusText(raffle.paymentStatus)}
                        </span>
                      </div>
                      
                      <div>
                        {raffle.tickets.some(t => t.isWinner) ? (
                          <div className="flex items-center text-yellow-400">
                            <FaTrophy className="mr-1" />
                            <span className="font-bold">¡GANADOR!</span>
                          </div>
                        ) : raffle.isActive ? (
                          <span className="text-cyan-400">Sorteo Activo</span>
                        ) : (
                          <span className="text-gray-400">Sorteo Finalizado</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-white font-bold mb-2">Tus números de ticket:</h4>
                    <div className="flex flex-wrap gap-2">
                      {raffle.tickets.map(ticket => (
                        <div 
                          key={ticket.id} 
                          className={`${ticket.isWinner ? 'bg-yellow-500' : 'bg-blue-600'} text-white font-bold py-2 px-4 rounded-lg shadow-md inline-block`}
                        >
                          {ticket.number}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyTicketsPage;
