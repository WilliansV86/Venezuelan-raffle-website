import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-vnz-blue"></div>
      
      {/* Venezuelan flag colors animated spinner */}
      <div className="absolute animate-pulse">
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-full bg-vnz-yellow"></div>
          <div className="w-3 h-3 rounded-full bg-vnz-blue"></div>
          <div className="w-3 h-3 rounded-full bg-vnz-red"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
