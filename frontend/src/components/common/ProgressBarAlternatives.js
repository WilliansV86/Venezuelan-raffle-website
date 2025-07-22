import React from 'react';

// Option 1: Modern two-tone progress bar with animated gradient
export const ModernProgressBar = ({ progress = 0 }) => {
  const remainingPercentage = 100 - progress;
  
  // Determine colors based on remaining percentage
  let bgColor, gradientColor, textColor;
  if (remainingPercentage < 20) {
    bgColor = 'bg-red-600';
    gradientColor = 'from-red-500 to-red-700';
    textColor = 'text-white';
  } else if (remainingPercentage < 60) {
    bgColor = 'bg-yellow-500';
    gradientColor = 'from-yellow-400 to-yellow-600';
    textColor = 'text-gray-900';
  } else {
    bgColor = 'bg-green-500';
    gradientColor = 'from-green-400 to-green-600';
    textColor = 'text-white';
  }
  
  return (
    <div className="relative w-full mb-4">
      {/* Background track */}
      <div className="h-8 bg-gray-800 rounded-lg shadow-inner overflow-hidden">
        {/* Progress fill */}
        <div 
          className={`h-full ${bgColor} bg-gradient-to-r ${gradientColor} transition-all duration-500 ease-in-out`}
          style={{ width: `${progress}%` }}
        />
        
        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textColor} text-xs md:text-sm font-bold tracking-wider uppercase`}>
            Quedan {remainingPercentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Option 2: Premium card-style indicator with icon
export const PremiumProgressBar = ({ progress = 0 }) => {
  const remainingPercentage = 100 - progress;
  
  // Determine status based on remaining percentage
  let statusBg, statusText, statusIcon;
  if (remainingPercentage < 20) {
    statusBg = 'bg-gradient-to-r from-red-500 to-pink-500';
    statusText = '¡Casi Agotado!';
    statusIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  } else if (remainingPercentage < 60) {
    statusBg = 'bg-gradient-to-r from-yellow-400 to-orange-500';
    statusText = 'Disponibilidad Limitada';
    statusIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  } else {
    statusBg = 'bg-gradient-to-r from-green-400 to-blue-500';
    statusText = 'Disponible';
    statusIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  }
  
  return (
    <div className="w-full max-w-md mb-2">
      <div className={`${statusBg} text-white py-1 px-3 rounded-lg shadow-md w-full`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {statusIcon}
            <span className="font-bold text-sm">{statusText}</span>
          </div>
          <span className="text-xs font-medium bg-black bg-opacity-20 py-0.5 px-2 rounded-full">
            {remainingPercentage.toFixed(0)}% restante
          </span>
        </div>
      </div>
    </div>
  );
};

// Option 3: Simple but elegant progress bar
export const ElegantProgressBar = ({ progress = 0 }) => {
  const remainingPercentage = 100 - progress;
  
  // Determine color based on remaining percentage
  let barColor;
  if (remainingPercentage < 20) {
    barColor = 'bg-gradient-to-r from-red-600 to-red-500';
  } else if (remainingPercentage < 60) {
    barColor = 'bg-gradient-to-r from-yellow-500 to-yellow-400';
  } else {
    barColor = 'bg-gradient-to-r from-green-600 to-green-500';
  }
  
  return (
    <div className="w-full mb-3">
      <div className="mb-1 flex justify-between items-center">
        <span className="text-xs font-semibold text-white">Estado</span>
        <span className="text-xs font-semibold text-white">{remainingPercentage.toFixed(0)}% disponible</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${barColor}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default {
  ModernProgressBar,
  PremiumProgressBar,
  ElegantProgressBar
};
