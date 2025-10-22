import React, { useState } from 'react';
import axios from 'axios';
import { FaSearch, FaTicketAlt, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import apiConfig from '../../config/apiConfig';
import SampleTickets from './SampleTickets';

const TicketVerificationForm = ({ raffleId }) => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    
    if (!ticketNumber.trim()) {
      setError('Por favor ingrese un número de ticket');
      return;
    }
    
    setLoading(true);
    
    try {
      // Use direct API URL to ensure we're hitting the right endpoint
      const response = await axios.get(`${apiConfig.API_URL}/tickets/find/${ticketNumber}${raffleId ? `?raffleId=${raffleId}` : ''}`);
      console.log('Verification response:', response.data);
      
      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.message || 'No se encontró información para este número de ticket. Por favor intenta otro número.');
      }
    } catch (err) {
      console.error('Error verifying ticket:', err);
      // More detailed error handling
      if (err.response) {
        // Server responded with an error
        console.error('Server error:', err.response.data);
        if (err.response.status === 404) {
          setError(`Esta función está en proceso de despliegue. El sistema no está disponible en este momento, por favor intenta más tarde.`);
        } else {
          setError(err.response.data?.message || `Error ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        console.error('Network error:', err.request);
        setError('Error de conexión. No se pudo conectar con el servidor.');
      } else {
        // Something else happened
        setError('Error al verificar. Por favor intente de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-gray-700/50">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="ticketNumber" className="block text-gray-300 mb-2 flex items-center">
            <FaTicketAlt className="mr-2 text-cyan-400" />
            Número de Ticket:
          </label>
          <input
            id="ticketNumber"
            type="text"
            placeholder="Ingresa el número de ticket"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            className="w-full bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          {/* Sample tickets for testing */}
          <SampleTickets onSelectTicket={(ticket) => setTicketNumber(ticket)} />
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Verificando...
              </>
            ) : (
              <>
                <FaSearch className="mr-2" />
                Verificar
              </>
            )}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="mt-6 bg-red-900/30 text-red-300 p-4 rounded-lg flex items-start">
          <FaTimes className="mr-2 mt-1 flex-shrink-0 text-red-400" />
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-6">
          <div className="bg-green-900/30 text-green-300 p-4 rounded-lg mb-4 flex items-center">
            <FaCheck className="mr-2 text-green-400" />
            <span>¡Ticket verificado con éxito!</span>
          </div>
          
          <div className="bg-black/40 rounded-lg p-4 border border-gray-700/50">
            <h3 className="font-bold text-xl text-white mb-3 flex items-center">
              <FaTicketAlt className="mr-2 text-yellow-400" />
              Boleto #{result.ticket.number}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 block">Propietario:</span>
                  <span className="text-xl font-bold text-white">
                    {result.ticket.buyer.firstName} {result.ticket.buyer.lastName}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-400 block">Sorteo:</span>
                  <span className="text-white">{result.raffle.name}</span>
                </div>
                
                <div>
                  <span className="text-gray-400 block">Premio:</span>
                  <span className="text-white">{result.raffle.prize}</span>
                </div>
              </div>
              
              <div className="space-y-3 flex flex-col justify-center items-center">
                <div className="text-center bg-gray-900/60 rounded-lg p-4 w-full">
                  {result.ticket.status === 'approved' && (
                    <div className="text-green-400 font-bold text-xl mb-2">✓ Ticket Válido</div>
                  )}
                  {result.raffle.status === 'completed' ? (
                    <div className="bg-yellow-600/50 text-yellow-300 px-3 py-2 rounded-full text-sm font-bold inline-block">
                      Sorteo Finalizado
                    </div>
                  ) : (
                    <div className="bg-cyan-600/50 text-cyan-300 px-3 py-2 rounded-full text-sm font-bold inline-block">
                      Sorteo Activo
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketVerificationForm;
