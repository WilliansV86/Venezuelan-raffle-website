import React from 'react';
import { Link } from 'react-router-dom';

const RaffleCard = ({ raffle }) => {
  // Calculate percentage remaining
  const percentageSold = raffle.percentageSold || 0;
  const percentageRemaining = 100 - percentageSold;
  
  // Helper function for progress bar color
  const getProgressBarColor = (percentage) => {
    if (percentage < 50) return 'bg-gradient-to-r from-cyan-500 to-blue-500';
    if (percentage < 75) return 'bg-gradient-to-r from-cyan-500 to-green-500';
    return 'bg-gradient-to-r from-green-500 to-yellow-500';
  };
  
  return (
    <>
      <div className="relative">
        {/* Prize Image */}
        <img 
          src={raffle.image || '/images/toyota-hilux-raffle.png'} 
          alt={raffle.title || 'Sorteo Especial'} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = '/images/toyota-hilux-raffle.png';
          }}
        />
        
        {/* Price Badge */}
        <div className="absolute top-0 right-0 bg-vnz-yellow text-dark font-bold py-1 px-3 m-2 rounded-full">
          ${raffle.ticketPrice?.toFixed(2) || '10.00'}
        </div>
      </div>
      
      <div className="p-4 pt-3 pb-5 font-sans flex flex-col justify-between h-[110px]">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-cyan-400 text-sm">Quedan {percentageRemaining}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressBarColor(percentageSold)}`}
              style={{ width: `${percentageSold}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-center items-center mt-6">
          <Link 
            to={`/raffle/${raffle._id}`} 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-6 rounded-full hover:scale-105 transform transition duration-300"
          >
            Participar
          </Link>
        </div>
      </div>
    </>
  );
};

export default RaffleCard;
