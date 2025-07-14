import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaTrophy, FaUser, FaCalendarAlt, FaGift, FaArrowLeft } from 'react-icons/fa';

const PastRaffleDetailPage = () => {
  const { id } = useParams();
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [winnerData, setWinnerData] = useState(null);

  useEffect(() => {
    const fetchRaffleData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/raffles/${id}`);
        
        if (response.data) {
          setRaffle(response.data);
          
          // If there's a winner ID, fetch the winner details
          if (response.data.winner) {
            try {
              // If winner is already populated, use that data
              if (typeof response.data.winner === 'object' && response.data.winner !== null) {
                setWinnerData({
                  name: response.data.winner.name,
                  cedula: response.data.winner.cedula,
                  email: response.data.winner.email
                });
              } 
              // Otherwise fetch winner data separately
              else {
                const winnerResponse = await axios.get(`/api/participants/${response.data.winner}`);
                if (winnerResponse.data) {
                  setWinnerData(winnerResponse.data);
                }
              }
            } catch (winnerErr) {
              console.error('Error fetching winner details:', winnerErr);
              // We continue showing the raffle even if winner details fail
            }
          }
        }
      } catch (err) {
        console.error('Error fetching raffle:', err);
        setError('Error al cargar la información del sorteo');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffleData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Determine if this is one of the top three prizes (1st, 2nd, 3rd)
  const getPrizeRank = (position) => {
    switch (position) {
      case 1:
        return (
          <div className="bg-yellow-600 text-white px-4 py-1 rounded-full font-bold">
            <FaTrophy className="inline-block mr-2 text-yellow-300" />
            Primer Premio
          </div>
        );
      case 2:
        return (
          <div className="bg-gray-500 text-white px-4 py-1 rounded-full font-bold">
            <FaTrophy className="inline-block mr-2 text-gray-300" />
            Segundo Premio
          </div>
        );
      case 3:
        return (
          <div className="bg-amber-700 text-white px-4 py-1 rounded-full font-bold">
            <FaTrophy className="inline-block mr-2 text-amber-300" />
            Tercer Premio
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Back to winners button */}
      <div className="mb-6">
        <Link to="/ganadores" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
          <FaArrowLeft className="mr-2" /> Volver a Ganadores
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/50 text-red-200 p-4 rounded-lg max-w-2xl mx-auto mb-10">
          <p>{error}</p>
        </div>
      ) : raffle ? (
        <div className="space-y-8">
          {/* Raffle Header */}
          <div className="bg-black/30 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl shadow-blue-400/10">
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
                <h1 className="text-3xl font-bold text-white mb-2">{raffle.title}</h1>
                <p className="text-lg text-gray-300 mb-4">{raffle.description}</p>
                
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-cyan-400 flex items-center mb-2">
                      <FaGift className="mr-2" />
                      Premio
                    </h2>
                    <p className="text-white text-lg">{raffle.prize}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold text-cyan-400 flex items-center mb-2">
                      <FaCalendarAlt className="mr-2" />
                      Fecha del Sorteo
                    </h2>
                    <p className="text-white">{formatDate(raffle.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Winner Information */}
          <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-yellow-600/30 shadow-2xl shadow-yellow-400/10">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
              <FaTrophy className="mr-2" />
              Información del Ganador
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Winner Details */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaUser className="text-yellow-400 mr-3 mt-1" />
                  <div>
                    <span className="block text-gray-400">Nombre del Ganador:</span>
                    <span className="text-xl font-bold text-white">
                      {winnerData?.name || raffle.winner?.name || 'No disponible'}
                    </span>
                  </div>
                </div>
                
                {(winnerData?.cedula || raffle.winner?.cedula) && (
                  <div className="flex items-start">
                    <div className="text-yellow-400 mr-3 mt-1">ID</div>
                    <div>
                      <span className="block text-gray-400">Cédula:</span>
                      <span className="text-lg text-white">
                        {winnerData?.cedula || raffle.winner?.cedula}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Additional winner info could go here */}
              </div>
              
              {/* Winning Ticket Details */}
              <div className="bg-black/50 border border-yellow-500/30 rounded-lg p-5 flex flex-col justify-center items-center">
                <div className="text-center">
                  {getPrizeRank(1)}
                  
                  <div className="mt-4">
                    <span className="block text-gray-400">Boleto Ganador:</span>
                    <span className="text-4xl font-bold text-yellow-400">#{raffle.winningTicketNumber || '?'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Prizes (if applicable) */}
          {raffle.additionalPrizes && raffle.additionalPrizes.length > 0 && (
            <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-2xl shadow-purple-400/10">
              <h2 className="text-2xl font-bold text-white mb-4">Premios Adicionales</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {raffle.additionalPrizes.map((prize, index) => (
                  <div 
                    key={index} 
                    className="bg-black/50 border border-gray-600/50 rounded-lg p-5 flex flex-col items-center"
                  >
                    {getPrizeRank(index + 2)}
                    
                    <div className="mt-3 text-center">
                      <span className="block text-gray-400">Premio:</span>
                      <span className="text-lg font-bold text-white">{prize.description}</span>
                    </div>
                    
                    <div className="mt-3 text-center">
                      <span className="block text-gray-400">Boleto Ganador:</span>
                      <span className="text-2xl font-bold text-white">#{prize.winningTicket || '?'}</span>
                    </div>
                    
                    {prize.winnerName && (
                      <div className="mt-3 text-center">
                        <span className="block text-gray-400">Ganador:</span>
                        <span className="text-white">{prize.winnerName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Raffle Statistics */}
          <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-2xl shadow-blue-400/10">
            <h2 className="text-2xl font-bold text-white mb-4">Estadísticas del Sorteo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/50 rounded-lg p-4">
                <span className="block text-gray-400">Precio del Boleto:</span>
                <span className="text-xl font-bold text-white">Bs. {raffle.ticketPrice || '?'}</span>
              </div>
              
              <div className="bg-black/50 rounded-lg p-4">
                <span className="block text-gray-400">Total de Boletos:</span>
                <span className="text-xl font-bold text-white">{raffle.totalTickets || '?'}</span>
              </div>
              
              <div className="bg-black/50 rounded-lg p-4">
                <span className="block text-gray-400">Boletos Vendidos:</span>
                <span className="text-xl font-bold text-white">
                  {raffle.totalTickets && raffle.availableTickets ? 
                    (raffle.totalTickets - raffle.availableTickets.length) : '?'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-white text-lg">No se encontró información sobre este sorteo.</p>
        </div>
      )}
    </div>
  );
};

export default PastRaffleDetailPage;
