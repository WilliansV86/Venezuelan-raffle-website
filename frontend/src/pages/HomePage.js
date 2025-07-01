import React, { useState } from 'react';
import RaffleCard from '../components/RaffleCard';
import SocialLinks from '../components/common/SocialLinks';
import Confetti from 'react-confetti';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/images/logo.jpg';
import raffleCar from '../assets/images/raffle-car.jpeg';
import raffleMoto from '../assets/images/raffle-moto.jpeg';
import raffleCash from '../assets/images/raffle-cash.jpeg';

const HomePage = () => {
  const getProgressBarColor = (progress) => {
    const remaining = 100 - progress;
    if (remaining < 25) return 'bg-gradient-to-r from-red-500 to-red-700';
    if (remaining <= 80) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    return 'bg-gradient-to-r from-green-400 to-green-600';
  };
  const [showConfetti, setShowConfetti] = useState(true);
  // Mock data for the raffles - we can replace this with real data from a backend later
  const raffles = [
    {
      id: 1,
      image: raffleCar,
      title: 'Gana un Carro 0KM',
      
      progress: 75,
      
    },
    {
      id: 2,
      image: raffleMoto,
      title: 'Moto de Alta Cilindrada',
      
      progress: 40,
      
    },
    {
      id: 3,
      image: raffleCash,
      title: 'Gana $1000 en Efectivo',
      
      progress: 90,
      
    },
  ];

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
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Nuestros Sorteos Activos</h1>
          <p className="text-xl text-gray-300">¡Elige tu sorteo y participa para ganar premios increíbles!</p>
        </header>

        <main className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {raffles.map(raffle => (
              <div key={raffle.id} className="antialiased bg-black/30 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl shadow-blue-400/20 hover:border-blue-500/80 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                <RaffleCard raffle={raffle} />
                
                {/* Controls moved out of the card */}
                <div className="p-4 font-sans">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-cyan-400">Quedan {100 - raffle.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${getProgressBarColor(raffle.progress)}`}
                        style={{ width: `${raffle.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    
                    <Link to={`/raffle/${raffle.id}`} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 rounded-full hover:scale-105 transform transition duration-300">
                      Participar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <SocialLinks />
        </main>

      </div>
      </div>
    </>
  );
};

export default HomePage;

