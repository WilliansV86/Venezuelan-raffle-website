import React from 'react';


const RaffleCard = ({ raffle }) => {
  const { image, title } = raffle;

  return (
    <>
      <div className="relative h-80 w-full overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="p-4 font-sans">
        <h3 className="text-xl text-white mb-2 truncate">{title}</h3>
        
      </div>
    </>
  );
};

export default RaffleCard;
