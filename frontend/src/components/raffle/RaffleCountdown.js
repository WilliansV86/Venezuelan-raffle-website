import React, { useState, useEffect } from 'react';

const RaffleCountdown = ({ endDate, compact = false }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(endDate) - new Date();
    
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  if (compact) {
    // Compact version for card display
    return (
      <div className="text-sm text-gray-700">
        {timeLeft.isExpired ? (
          <span className="font-semibold text-vnz-red">¡Sorteo finalizado!</span>
        ) : (
          <span>
            Finaliza en: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        )}
      </div>
    );
  }

  // Full version for detailed page
  return (
    <div className="bg-white rounded-lg shadow p-3">
      {timeLeft.isExpired ? (
        <div className="text-center text-vnz-red">
          <p className="text-lg font-bold">¡Sorteo finalizado!</p>
        </div>
      ) : (
        <>
          <p className="text-center text-gray-700 font-semibold mb-2">Tiempo restante</p>
          <div className="flex justify-center space-x-3">
            <div className="text-center">
              <div className="bg-vnz-blue text-white text-xl rounded-lg w-12 h-12 flex items-center justify-center">
                {timeLeft.days}
              </div>
              <p className="text-xs mt-1">Días</p>
            </div>
            <div className="text-center">
              <div className="bg-vnz-blue text-white text-xl rounded-lg w-12 h-12 flex items-center justify-center">
                {timeLeft.hours}
              </div>
              <p className="text-xs mt-1">Horas</p>
            </div>
            <div className="text-center">
              <div className="bg-vnz-blue text-white text-xl rounded-lg w-12 h-12 flex items-center justify-center">
                {timeLeft.minutes}
              </div>
              <p className="text-xs mt-1">Min</p>
            </div>
            <div className="text-center">
              <div className="bg-vnz-blue text-white text-xl rounded-lg w-12 h-12 flex items-center justify-center">
                {timeLeft.seconds}
              </div>
              <p className="text-xs mt-1">Seg</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RaffleCountdown;
