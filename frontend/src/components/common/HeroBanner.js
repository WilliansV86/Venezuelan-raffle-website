import React from 'react';

const HeroBanner = () => {
  return (
    <div className="relative bg-cover bg-center text-white" style={{ backgroundImage: "url('/images/raffle-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="relative container mx-auto px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <img 
            src="/images/logo.jpg" 
            alt="Tu Suerte Vzla Logo" 
            className="w-48 h-48 mx-auto mb-6 rounded-full shadow-2xl"
          />
          <h1 className="text-5xl md:text-6xl font-extrabold font-anton uppercase tracking-wider text-shadow-lg">
            Tu Suerte Vzla
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Participa en nuestros sorteos y sé el próximo en ganar. ¡La fortuna te espera!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
