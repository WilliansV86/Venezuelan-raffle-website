import React, { useState, useEffect } from 'react';
import RaffleCard from '../components/raffle/RaffleCard';
import { FaGift, FaHistory } from 'react-icons/fa';
import SocialLinks from '../components/common/SocialLinks';
import Confetti from 'react-confetti';
import raffleService from '../services/raffleService';



const HomePage = () => {
    const [activeRaffle, setActiveRaffle] = useState(null);
  const [pastRaffle, setPastRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const [activeRes, pastRes] = await Promise.all([
          raffleService.getActiveRaffles(),
          raffleService.getPastRaffles(),
        ]);

        if (activeRes && activeRes.success && activeRes.data && activeRes.data.length > 0) {
          setActiveRaffle(activeRes.data[0]);
        }

        if (pastRes && pastRes.success && pastRes.data && pastRes.data.length > 0) {
          setPastRaffle(pastRes.data[0]);
        }
      } catch (err) {
        setError('No se pudieron cargar los sorteos. Por favor, intente más tarde.');
        console.error("Error fetching raffles:", err);
      } finally {
        setLoading(false);
      }
    };  
    fetchRaffles();
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
        <header className="text-center pt-8 pb-12">
          <h1 className="text-5xl font-heading text-white uppercase" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Nuestros Sorteos</h1>
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
            <div className="flex flex-col md:flex-row justify-center items-start gap-32">
              {/* Active Raffles Section */}
              <div className="w-full md:w-auto flex flex-col items-center">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaGift className="text-cyan-400" />
                  <span>Sorteo Activo</span>
                </h2>
                {activeRaffle ? (
                  <div className="flex justify-center">
                    <RaffleCard raffle={activeRaffle} isPast={false} />
                  </div>
                ) : (
                  <p className="text-gray-300">No hay sorteos activos.</p>
                )}
              </div>

              {/* Past Raffles Section */}
              <div className="w-full md:w-auto flex flex-col items-center">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FaHistory className="text-purple-400" />
                  <span>Sorteo Anterior</span>
                </h2>
                {pastRaffle ? (
                  <div className="flex justify-center">
                    <RaffleCard raffle={pastRaffle} isPast={true} />
                  </div>
                ) : (
                  <p className="text-gray-300">No hay sorteos anteriores.</p>
                )}
              </div>
            </div>
          )}
          <div className="mt-16">
            <SocialLinks />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;

