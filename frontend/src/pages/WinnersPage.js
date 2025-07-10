import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrophy, FaTicketAlt, FaUser, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

const WinnersPage = () => {
  const [pastRaffles, setPastRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPastRaffles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/raffles/past');
        
        // Filter raffles that have a winner
        const rafflesWithWinners = response.data.filter(raffle => 
          raffle.winner && raffle.winningTicketNumber
        );
        
        setPastRaffles(rafflesWithWinners);
        setError(null);
      } catch (err) {
        console.error('Error fetching past raffles:', err);
        setError('Error al cargar los sorteos anteriores. Por favor, intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastRaffles();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Ganadores de Sorteos</h1>
        <p className="text-gray-300">
          Listado de todos los ganadores de nuestros sorteos anteriores
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/50 text-red-200 p-4 rounded-lg max-w-2xl mx-auto mb-10">
          <p>{error}</p>
        </div>
      ) : pastRaffles.length === 0 ? (
        <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl shadow-blue-400/10 border border-blue-500/20 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Aún no hay ganadores</h2>
          <p className="text-gray-300">
            Los sorteos se realizarán pronto y los ganadores se mostrarán aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {pastRaffles.map(raffle => (
            <div 
              key={raffle._id}
              className="bg-black/30 backdrop-blur-lg rounded-xl overflow-hidden border border-yellow-600/30 shadow-2xl shadow-yellow-400/10"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-60 md:h-auto relative overflow-hidden">
                  <img 
                    src={raffle.imageUrl || '/images/raffle-default.jpg'} 
                    alt={raffle.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/images/raffle-default.jpg';
                    }}
                  />
                  <div className="absolute top-0 left-0 bg-yellow-600 text-black px-3 py-1 font-bold">
                    SORTEO FINALIZADO
                  </div>
                </div>
                
                <div className="p-6 md:w-2/3">
                  <div className="flex justify-between items-start mb-4 flex-wrap">
                    <h2 className="text-2xl font-bold text-white mb-2 md:mb-0">{raffle.title}</h2>
                    <div className="flex items-center text-yellow-400">
                      <FaTrophy className="mr-2" />
                      <span>Sorteo realizado el {formatDate(raffle.endDate)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">{raffle.prize}</p>
                  
                  <div className="bg-black/50 border border-yellow-600/30 rounded-lg p-5 mb-4">
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">Información del Ganador</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center mb-2">
                          <FaUser className="text-yellow-400 mr-2" />
                          <span className="text-gray-400">Ganador:</span>
                        </div>
                        <p className="text-white text-xl font-bold ml-6">
                          {raffle.winner ? raffle.winner.name : 'Información no disponible'}
                        </p>
                        {raffle.winner && raffle.winner.cedula && (
                          <p className="text-gray-300 ml-6">
                            Cédula: {raffle.winner.cedula}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-2">
                          <FaTicketAlt className="text-yellow-400 mr-2" />
                          <span className="text-gray-400">Boleto Ganador:</span>
                        </div>
                        <p className="text-white text-2xl font-bold ml-6">
                          #{raffle.winningTicketNumber || '?'}
                        </p>
                        <div className="flex items-center mt-2 ml-6">
                          <FaCalendarAlt className="text-gray-400 mr-2" />
                          <span className="text-gray-400">
                            Fecha de compra: {raffle.winningTicketPurchaseDate ? 
                              formatDate(raffle.winningTicketPurchaseDate) : 'No disponible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ver Detalle button */}
                  <div className="flex justify-end mt-4">
                    <Link 
                      to={`/ganadores/${raffle._id}`}
                      className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-2 px-6 rounded-full flex items-center transition-all hover:shadow-lg hover:shadow-yellow-500/20"
                    >
                      <FaInfoCircle className="mr-2" />
                      Ver Detalle
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WinnersPage;
