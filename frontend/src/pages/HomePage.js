import React, { useState, useEffect } from 'react';
import RaffleCard from '../components/raffle/RaffleCard';
import { FaGift, FaHistory, FaSync, FaWhatsapp } from 'react-icons/fa';
import SocialLinks from '../components/common/SocialLinks';
import Confetti from 'react-confetti';
import raffleService from '../services/raffleService';



const HomePage = () => {
    const [activeRaffle, setActiveRaffle] = useState(null);
  const [pastRaffle, setPastRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  // Function to fetch the latest raffles data
  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const [activeRes, pastRes] = await Promise.all([
        raffleService.getActiveRaffles(),
        raffleService.getPastRaffles(),
      ]);

      // More detailed debugging for active raffles
      console.log('Active raffles response structure:', JSON.stringify(activeRes));
      
      if (activeRes && activeRes.success && activeRes.data && activeRes.data.length > 0) {
        console.log('Active raffle found:', activeRes.data[0].title || activeRes.data[0].name);
        console.log('Full active raffle data:', JSON.stringify(activeRes.data[0]));
        setActiveRaffle(activeRes.data[0]);
      } else {
        console.log('No active raffles found. Response:', JSON.stringify(activeRes));
        setActiveRaffle(null);
      }

      if (pastRes && pastRes.success && pastRes.data && pastRes.data.length > 0) {
        console.log('Past raffle found:', pastRes.data[0].title);
        setPastRaffle(pastRes.data[0]);
      } else {
        console.log('No past raffles found');
        setPastRaffle(null);
      }
    } catch (err) {
      setError('No se pudieron cargar los sorteos. Por favor, intente más tarde.');
      console.error("Error fetching raffles:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch raffles when the component mounts
  useEffect(() => {
    fetchRaffles();
    
    // Set up a refresh interval that runs every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing raffle data...');
      fetchRaffles();
    }, 30000); // 30 seconds
    
    // Clean up interval when component unmounts
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Add a refresh mechanism that runs when the page becomes visible again
  useEffect(() => {
    // This will run when the user returns to this page after navigating away
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('HomePage is visible, refreshing raffle data...');
        fetchRaffles();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(23, 37, 84, 0.9), rgba(23, 37, 84, 0.9)), url('/images/main-page-bg.png')`,
      }}
    >
      {showConfetti && (
        <Confetti
          recycle={false}
          onConfettiComplete={() => setShowConfetti(false)}
          numberOfPieces={500}
          width={typeof window !== 'undefined' ? window.innerWidth : 0}
          height={typeof window !== 'undefined' ? window.innerHeight : 0}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <header className="text-center pt-8 pb-6 relative">
          <h1 className="text-5xl font-heading text-white uppercase" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Nuestros Sorteos</h1>
          <button 
            onClick={fetchRaffles} 
            className="absolute right-4 top-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-colors duration-300 flex items-center justify-center"
            title="Actualizar sorteos">
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        <main>
          {loading && (
             <div className="flex flex-col md:flex-row justify-center items-start gap-32">
                <div className="w-full md:w-auto flex flex-col items-center">
                    <h2 className="text-3xl font-semibold text-white mb-6">Sorteo Activo</h2>
                    <RaffleCard loading={true} />
                </div>
                <div className="w-full md:w-auto flex flex-col items-center">
                    <h2 className="text-3xl font-semibold text-white mb-6">Sorteo Anterior</h2>
                    <RaffleCard loading={true} />
                </div>
            </div>
          )}
          {error && (
            <div className="bg-red-500 bg-opacity-75 text-white text-center p-4 rounded-lg shadow-lg mb-8 mx-auto max-w-4xl">{error}</div>
          )}

          {!loading && !error && (
            <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 lg:gap-32">
              {/* Active Raffles Section */}
              <div className="w-full max-w-full md:max-w-md flex flex-col items-center mb-12 lg:mb-0">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaGift className="text-cyan-400" />
                  <span>Sorteo Activo</span>
                </h2>
                {activeRaffle ? (
                  <div className="flex justify-center w-full">
                    <RaffleCard raffle={activeRaffle} isPast={false} />
                  </div>
                ) : (
                  <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg text-center w-full max-w-sm">
                    <p className="text-gray-300">No hay sorteos activos en este momento.</p>
                  </div>
                )}
              </div>

              {/* Past Raffles Section */}
              <div className="w-full max-w-full md:max-w-md flex flex-col items-center">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaHistory className="text-purple-400" />
                  <span>Sorteo Anterior</span>
                </h2>
                {pastRaffle ? (
                  <div className="flex justify-center w-full">
                    <RaffleCard raffle={pastRaffle} isPast={true} />
                  </div>
                ) : (
                  <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg text-center w-full max-w-sm">
                    <p className="text-gray-300">No hay sorteos anteriores disponibles.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="mt-16">
            <SocialLinks />
          </div>
        </main>
        
        {/* WhatsApp floating button */}
        <a 
          href="https://wa.me/584241378533" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-xl hover:shadow-green-500/20 hover:from-green-500 hover:to-green-600 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center z-50 border-2 border-green-400/20"
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp size={28} />
          <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white/30 shadow-md">
            1
          </div>
          <span className="absolute -bottom-10 right-0 bg-black/80 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Contactar por WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

export default HomePage;

