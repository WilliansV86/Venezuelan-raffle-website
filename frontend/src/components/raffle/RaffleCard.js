import React from 'react';
import { Link } from 'react-router-dom';
import RaffleCountdown from './RaffleCountdown';

const RaffleCard = ({ raffle }) => {
  // Calculate percentage of tickets sold
  const soldPercentage = raffle.soldTickets ? 
    Math.round((raffle.soldTickets.length / raffle.totalTickets) * 100) : 0;
  
  return (
    <div className="card hover:-translate-y-1 transition-transform duration-300">
      <div className="relative">
        {/* Prize Image */}
        <img 
          src={raffle.prizeImageUrl || 'https://via.placeholder.com/400x250?text=Premio+del+Sorteo'} 
          alt={raffle.prize} 
          className="w-full h-48 object-cover"
        />
        
        {/* Price Badge */}
        <div className="absolute top-0 right-0 bg-vnz-yellow text-dark font-bold py-1 px-3 m-2 rounded-full">
          ${raffle.ticketPrice.toFixed(2)}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2 text-primary line-clamp-2">{raffle.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{raffle.description}</p>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>{soldPercentage}% Vendido</span>
            <span>{raffle.soldTickets?.length || 0} de {raffle.totalTickets} boletos</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-vnz-red h-2 rounded-full" 
              style={{ width: `${soldPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <RaffleCountdown endDate={raffle.endDate} compact={true} />
          <Link 
            to={`/raffle/${raffle._id}`} 
            className="btn btn-primary"
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RaffleCard;
