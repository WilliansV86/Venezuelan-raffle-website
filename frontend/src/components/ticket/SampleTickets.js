import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaTicketAlt } from 'react-icons/fa';
import apiConfig from '../../config/apiConfig';

const SampleTickets = ({ onSelectTicket }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Fetch a sample of sold tickets
    const fetchSampleTickets = async () => {
      try {
        setLoading(true);
        
        // This endpoint doesn't actually exist - you would need to create it
        // For now, we'll mock some ticket numbers
        // const response = await axios.get(`${apiConfig.API_URL}/tickets/sample`);
        // setTickets(response.data.tickets);
        
        // Mocked tickets from your sample test
        setTickets(['5992', '9545', '9980', '3602', '9834']);
        setError(null);
      } catch (err) {
        console.error('Error fetching sample tickets:', err);
        setError('Error al cargar tickets de ejemplo');
      } finally {
        setLoading(false);
      }
    };

    fetchSampleTickets();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-4">
        <FaSpinner className="animate-spin text-cyan-400 mx-auto text-xl" />
        <p className="text-gray-300 mt-2">Cargando tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-gray-300 mb-2 text-sm">Tickets de ejemplo para probar:</h3>
      <div className="flex flex-wrap gap-2">
        {tickets.map(ticket => (
          <button
            key={ticket}
            onClick={() => onSelectTicket(ticket)}
            className="bg-gray-900/60 hover:bg-gray-800 text-cyan-400 text-sm py-1 px-3 rounded-full flex items-center"
          >
            <FaTicketAlt className="mr-1" size={12} />
            {ticket}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SampleTickets;
