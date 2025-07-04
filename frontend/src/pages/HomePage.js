import React, { useState, useEffect } from 'react';
import RaffleCard from '../components/raffle/RaffleCard';
import SocialLinks from '../components/common/SocialLinks';
import Confetti from 'react-confetti';
import raffleService from '../services/raffleService';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/images/logo.jpg';
import raffleCar from '../assets/images/raffle-car.jpeg';
import raffleMoto from '../assets/images/raffle-moto.jpeg';
import raffleCash from '../assets/images/raffle-cash.jpeg';
import { FaHistory, FaGift } from 'react-icons/fa';

const HomePage = () => {
  const getProgressBarColor = (progress) => {
    const remaining = 100 - progress;
    if (remaining < 25) return 'bg-gradient-to-r from-red-500 to-red-700';
    if (remaining <= 80) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    return 'bg-gradient-to-r from-green-400 to-green-600';
  };
  const [showConfetti, setShowConfetti] = useState(true);
  const [activeRaffles, setActiveRaffles] = useState([]);
  const [pastRaffles, setPastRaffles] = useState([]);
  // No active tab state needed - we'll display both
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch raffles based on tab
  const fetchRaffles = async (type) => {
    try {
      setLoading(true);
      
      if (type === 'active' || type === 'all') {
        const activeResponse = await raffleService.getActiveRaffles();
        // Ensure we have an array to work with
        const activeData = Array.isArray(activeResponse.data) ? 
          activeResponse.data : 
          Array.isArray(activeResponse) ? 
            activeResponse : 
            [];
        setActiveRaffles(activeData);
      }
      
      if (type === 'past' || type === 'all') {
        const pastResponse = await raffleService.getPastRaffles();
        // Ensure we have an array to work with
        const pastData = Array.isArray(pastResponse.data) ? 
          pastResponse.data : 
          Array.isArray(pastResponse) ? 
            pastResponse : 
            [];
        setPastRaffles(pastData);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching raffles:", err);
      setError('No se pudieron cargar los sorteos. Por favor, intente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffles('all');
  }, []);

  return (
    <>
      {showConfetti && (
        <Confetti
          recycle={false}
          onConfettiComplete={() => setShowConfetti(false)}
          numberOfPieces={500}
          width={typeof window !== 'undefined' ? window.innerWidth : 0}
          height={typeof window !== 'undefined' ? window.innerHeight : 0}
        />
      )}
            <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900/95 via-blue-900/80 to-black/95">
        
        <header className="text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Nuestros Sorteos</h1>
        </header>

        <main className="container mx-auto px-4 pb-16">
          {loading ? (
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Cargando sorteos...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Raffles Container - Side by Side Layout */}
              <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                {/* Active Raffles Section */}
                <div className="lg:w-1/2">
                  <div className="text-center mb-8 max-w-sm mx-auto">
                      <div className="flex items-center justify-center">
                        <FaGift className="text-2xl text-cyan-400 mr-3" />
                        <h2 className="text-3xl font-bold text-white">Sorteo Activo</h2>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-16 max-w-sm mx-auto">
                    {activeRaffles
                      .filter(raffle => raffle && raffle._id)
                      .map(raffle => (
                        <div key={raffle._id} className="antialiased bg-blue-900/30 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl shadow-blue-400/20 hover:border-blue-500/80 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 w-full">
                          <div className="w-full">
                            <img 
                              src="/images/toyota-hilux-raffle.png" 
                              alt={raffle.title || raffle.prize} 
                              className="w-full"
                              style={{ display: 'block', width: '100%' }}
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = '/images/toyota-hilux-raffle.png';
                              }}
                            />
                          </div>
                          
                          <div className="p-4 pt-4 pb-5 font-sans flex flex-col justify-between h-[140px]">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-cyan-400 text-lg font-bold">Quedan {100 - (raffle.percentageSold || 0)}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner">
                                <div 
                                  className={`h-4 rounded-full ${getProgressBarColor(raffle.percentageSold || 0)} shadow-lg`}
                                  style={{ width: `${raffle.percentageSold || 0}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="mt-5 text-center">
                              <Link to={`/raffle/${raffle._id}`} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold py-3 px-10 rounded-full hover:scale-105 transform transition duration-300 shadow-xl shadow-blue-500/50 border-2 border-cyan-300/30 animate-pulse">
                                Participar
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Past Raffles Section */}
                <div className="lg:w-1/2">
                  <div className="text-center mb-8 max-w-sm mx-auto">
                    <div className="flex items-center justify-center">
                      <FaHistory className="text-2xl text-purple-400 mr-3" />
                      <h2 className="text-3xl font-bold text-white">Sorteo Anterior</h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-16 max-w-sm mx-auto">
                    {pastRaffles
                      .filter(raffle => raffle && raffle._id)
                      .map(raffle => (
                        <div key={raffle._id} className="antialiased bg-purple-900/30 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl shadow-purple-400/20 hover:border-purple-500/80 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 w-full">
                          <div className="w-full">
                            <img 
                              src={raffle.image || raffle.imageUrl || '/images/toyota-hilux-raffle.png'} 
                              alt={raffle.title || 'Sorteo Especial'} 
                              className="w-full"
                              style={{ display: 'block', width: '100%' }}
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = '/images/toyota-hilux-raffle.png';
                              }}
                            />
                          </div>
                          
                          <div className="p-4 pt-3 pb-5 font-sans flex flex-col justify-between h-[140px]">
                            <div>
                              <span className="bg-purple-900/70 text-purple-300 text-sm py-1 px-3 rounded-full">Sorteo Finalizado</span>
                              <div className="mt-1">
                                {raffle.winner && (
                                  <p className="text-gray-300 text-xs">Ganador: <span className="text-yellow-400">{raffle.winner}</span></p>
                                )}
                              </div>
                            </div>
                            <div className="mt-5 text-center">
                              <Link to={`/ganadores/${raffle._id}`} className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xl font-bold py-3 px-10 rounded-full hover:scale-105 transform transition duration-300 shadow-xl shadow-purple-500/50 border-2 border-purple-300/30 animate-pulse">
                                Ver Detalles
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
          <SocialLinks />
        </main>

      </div>
      </div>
    </>
  );
};

export default HomePage;

