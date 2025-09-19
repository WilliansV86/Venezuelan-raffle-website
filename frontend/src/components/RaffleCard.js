import React from 'react';

// Default raffle image when none is provided
const defaultRaffleImage = '/images/raffle-default.jpg';

const RaffleCard = ({ raffle }) => {
  // Handle cases where raffle data might be missing expected fields
  let imageUrl = raffle.image || raffle.imageUrl || defaultRaffleImage;
  const title = raffle.title || raffle.prize || 'Sorteo Especial';
  const description = raffle.description || '';
  const price = raffle.ticketPrice ? `$${raffle.ticketPrice.toFixed(2)}` : '$10.00';

  return (
    <div className="relative">
      {/* Prize Image */}
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-48 object-cover" 
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = '/images/toyota-hilux-raffle.png';
        }}
      />
      
      {/* Price Badge */}
      <div className="absolute top-0 right-0 bg-vnz-yellow text-dark font-bold py-1 px-3 m-2 rounded-full">
        {price}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2 text-primary line-clamp-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
      </div>
    </div>
  );
};

export default RaffleCard;
