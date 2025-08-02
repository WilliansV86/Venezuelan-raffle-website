import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TermsModal from '../common/TermsModal';
import { ModernProgressBar, PremiumProgressBar, ElegantProgressBar } from '../common/ProgressBarAlternatives';
import axios from 'axios';

const RaffleCard = ({ raffle, loading, isPast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [raffleStats, setRaffleStats] = useState({
    soldTickets: 0,
    totalTickets: 100,
    remainingTickets: 100
  });
  const [progress, setProgress] = useState(raffle?.progress || 0);
  const navigate = useNavigate();

  // Fetch raffle stats when component mounts and periodically refresh
  useEffect(() => {
    // Skip for past raffles or if no raffle data
    if (isPast || !raffle || !raffle._id) return;
    
    const fetchRaffleStats = async () => {
      try {
        const statsResponse = await axios.get(`http://localhost:5100/api/raffles/${raffle._id}/stats`);
        const stats = statsResponse.data.data || statsResponse.data;
        
        // Update the stats in state to refresh the UI
        setRaffleStats({
          soldTickets: stats.soldTickets || 0,
          totalTickets: stats.totalTickets || 100,
          remainingTickets: stats.remainingTickets || 100
        });
        
        // Calculate and update progress percentage
        if (stats.totalTickets > 0) {
          const newProgress = Math.round(((stats.totalTickets - stats.remainingTickets) / stats.totalTickets) * 100);
          setProgress(newProgress);
        }
      } catch (error) {
        console.error(`Error fetching stats for raffle ${raffle._id}:`, error);
      }
    };
    
    // Initial fetch
    fetchRaffleStats();
    
    // Set up refresh interval every 15 seconds
    const refreshInterval = setInterval(fetchRaffleStats, 15000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [raffle, isPast]);

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
            <div className="flex flex-col items-center h-[104px] w-full">
              <div className="-mt-3 w-full px-2">
                <div className="w-full max-w-md mb-2">
                  <div className="bg-purple-800 text-white py-1 px-3 rounded-lg shadow-md w-full">
                    <div className="flex justify-center items-center">
                      <span className="font-semibold text-sm">Sorteo Finalizado</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-2">
                <Link to={`/raffle/${raffle._id}`}>
                  <button className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 text-lg shadow">
                    Ver Detalles
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center h-[104px] w-full">
              {/* Premium card-style progress bar */}
              <div className="-mt-3 w-full px-2">
                <PremiumProgressBar progress={progress} />

              </div>
              <div className="flex justify-center mt-2">
                <button 
                  onClick={handleParticipateClick}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-12 rounded-lg hover:from-blue-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-110 hover:shadow-xl hover:shadow-blue-300/50 text-lg shadow-md min-w-[160px]"
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

