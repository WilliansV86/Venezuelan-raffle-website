import React, { useState } from 'react';
import axios from 'axios';
import { FaTicketAlt, FaCheck, FaTimes, FaClock, FaTrophy } from 'react-icons/fa';

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
      const response = await axios.get(`/api/tickets/verify/${encodeURIComponent(cedula)}`);
      setTicketData(response.data);
    } catch (err) {
      console.error('Error verifying tickets:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Error al verificar los boletos');
      } else {
        setError('Error al verificar los boletos. Por favor, intente de nuevo más tarde.');
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
        <h1 className="text-3xl font-bold text-white mb-2">Verificar Mis Boletos</h1>
        <p className="text-gray-300">
          Introduce tu número de cédula para verificar tus boletos comprados
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
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg hover:from-purple-700 hover:to-purple-900 transition duration-300 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaTicketAlt className="mr-2" />
                Verificar Boletos
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

          <h2 className="text-2xl font-bold text-white mb-4">Boletos Comprados</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {ticketData.tickets.map(ticket => (
              <div 
                key={ticket.id} 
                className={`bg-black/30 backdrop-blur-lg rounded-xl p-4 shadow-lg border ${ticket.isWinner ? 'border-yellow-500 shadow-yellow-400/20' : 'border-gray-700/50'}`}
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-white">{ticket.raffleName}</h3>
                    <p className="text-gray-300">{ticket.rafflePrize}</p>
                    <div className="mt-2">
                      <span className="bg-purple-900/70 text-purple-300 text-sm py-1 px-3 rounded-full">
                        Boleto #{ticket.ticketNumber}
                      </span>
                      <span className="ml-3 text-gray-400 text-sm">
                        Comprado el {formatDate(ticket.purchaseDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center items-end">
                    <div className="flex items-center mb-2">
                      {getPaymentStatusIcon(ticket.paymentStatus)}
                      <span className="ml-2 text-gray-300">
                        Pago: {getPaymentStatusText(ticket.paymentStatus)}
                      </span>
                    </div>
                    
                    <div>
                      {ticket.isWinner ? (
                        <div className="flex items-center text-yellow-400">
                          <FaTrophy className="mr-1" />
                          <span className="font-bold">¡GANADOR!</span>
                        </div>
                      ) : ticket.isActive ? (
                        <span className="text-cyan-400">Sorteo Activo</span>
                      ) : (
                        <span className="text-gray-400">Sorteo Finalizado</span>
                      )}
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
