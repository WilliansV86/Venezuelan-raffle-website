import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TermsModal from '../common/TermsModal';

const RaffleCard = ({ raffle, loading, isPast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return <div className="w-96"><div className="h-[600px] bg-gray-700 animate-pulse rounded-lg shadow-lg"></div></div>;
  }

  if (!raffle) {
    return null;
  }

  // Fix image path to point to the correct backend URL
  const imageUrl = raffle.image ? 
    raffle.image.startsWith('http') ? raffle.image : `http://localhost:5100${raffle.image}` 
    : '/images/default-raffle-image.png';

  const handleParticipateClick = () => {
    setIsModalOpen(true);
  };

  const handleAcceptTerms = () => {
    setIsModalOpen(false);
    navigate(`/raffle/${raffle._id}/participate`);
  };

  return (
    <>
      {isModalOpen && <TermsModal onAccept={handleAcceptTerms} />}
      <div className="w-96 font-sans transition-transform duration-300 ease-in-out hover:scale-105 group">
        <Link to={`/raffle/${raffle._id}`} className="block">
          <img 
            src={imageUrl} 
            alt={raffle.title || 'Ver detalles del sorteo'} 
            className="w-full h-[600px] object-cover rounded-lg shadow-lg"
          />
        </Link>
        <div className="p-6 text-white flex flex-col justify-center items-center">
          <h3 className="text-2xl font-bold text-center mb-4 truncate">{raffle.title}</h3>
          {isPast ? (
            <div className="flex flex-col items-center justify-center h-[104px]">
              <span className="bg-purple-800 text-white text-sm font-semibold px-4 py-1 rounded-full mb-4">Sorteo Finalizado</span>
              <div className="flex justify-center">
                <Link to={`/raffle/${raffle._id}`}>
                  <button className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 text-lg">
                    Ver Detalles
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[104px] w-full">
              <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${raffle.progress || 100}%` }}></div>
              </div>
              <span className="text-sm mb-4">Quedan {100 - (raffle.progress || 0)}%</span>
              <div className="flex justify-center">
                <button 
                  onClick={handleParticipateClick}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Participar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RaffleCard;

