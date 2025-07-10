/* Version4: Fixed background image implementation with proper URL path and overlay gradient */
import React, { useState, useEffect } from 'react';
import RaffleCard from '../components/raffle/RaffleCard';
import SocialLinks from '../components/common/SocialLinks';
import Confetti from 'react-confetti';
import raffleService from '../services/raffleService';

const HomePage = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [activeRaffles, setActiveRaffles] = useState([]);
  const [pastRaffles, setPastRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching raffles from services...');
      const [activeResponse, pastResponse] = await Promise.all([
        raffleService.getActiveRaffles(),
        raffleService.getPastRaffles(),
      ]);
      
      console.log('Active raffles response:', activeResponse);
      console.log('Past raffles response:', pastResponse);
      
      // The API returns data in { success, count, data } format
      if (activeResponse && activeResponse.success && Array.isArray(activeResponse.data)) {
        console.log('Setting active raffles:', activeResponse.data);
        setActiveRaffles(activeResponse.data);
      } else {
        console.log('No active raffles data found or invalid format');
        setActiveRaffles([]);
      }
      
      if (pastResponse && pastResponse.success && Array.isArray(pastResponse.data)) {
        console.log('Setting past raffles:', pastResponse.data);
        setPastRaffles(pastResponse.data);
      } else {
        console.log('No past raffles data found or invalid format');
        setPastRaffles([]);
      }

    } catch (err) {
      console.error("Error fetching raffles:", err);
      if (err.response) {
        console.error('Error data:', err.response.data);
        console.error('Error status:', err.response.status);
        
        // Check for MongoDB connection error
        if (err.response.data && err.response.data.message && 
            err.response.data.message.includes('Client must be connected')) {
          setError('Error de conexión a la base de datos. Es posible que se requiera actualizar la lista de IPs permitidas en MongoDB Atlas.');
          return;
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      setError('No se pudieron cargar los sorteos. Por favor, intente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffles();
  }, []);

    const noRafflesFound = !loading && !error && activeRaffles.length === 0 && pastRaffles.length === 0;

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
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900/95 via-blue-900/80 to-black/95">
        
        <header className="text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Nuestros Sorteos</h1>
        </header>

        <main className="container mx-auto px-4 pb-16">
          {loading && (
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Cargando sorteos...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500 bg-opacity-75 text-white text-center p-4 rounded-lg shadow-lg mb-8 mx-auto max-w-4xl">{error}</div>
          )}

          {noRafflesFound && (
            <div className="text-center py-10">
              <p className="text-2xl text-gray-400">No hay sorteos disponibles en este momento.</p>
              <p className="text-gray-500">Por favor, ¡vuelve a consultar más tarde!</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {activeRaffles && activeRaffles.length > 0 && (
                <>
                <h2 className="text-3xl font-bold text-white text-center mb-8">Sorteos Activos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeRaffles.map(raffle => (
                    <RaffleCard key={raffle._id} raffle={raffle} />
                  ))}
                </div>
                </>
              )}

              {pastRaffles && pastRaffles.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-3xl font-bold text-white text-center mb-8">Sorteos Anteriores</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pastRaffles.map(raffle => (
                      <RaffleCard key={raffle._id} raffle={raffle} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          <SocialLinks />
        </main>

      </div>
    </>
  );
};

export default HomePage;

