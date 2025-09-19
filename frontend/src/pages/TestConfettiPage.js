import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';

const TestConfettiPage = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const handleShowConfetti = () => {
    setShowConfetti(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Prueba de Celebración con Confetti</h1>
      
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          numberOfPieces={300}
          gravity={0.15}
          recycle={false}
          colors={['#FFD700', '#FFC107', '#FFDF00', '#F0E68C', '#DAA520', '#B8860B']}
        />
      )}

      {showConfetti ? (
        <div className="bg-gray-800 border border-yellow-600 rounded-xl p-8 max-w-2xl w-full text-gray-300 shadow-xl shadow-yellow-500/20">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">¡Compra Exitosa!</h2>
          <div className="space-y-3 text-gray-400">
            <p className="text-lg">Tu compra ha sido procesada correctamente.</p>
            <p>Tus tickets serán verificados y te serán enviados por correo electrónico en las próximas 24 horas.</p>
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-2">Tus tickets:</h3>
              <div className="bg-gray-700 p-4 rounded-lg text-center border border-yellow-500/30">
                <p className="text-yellow-400 font-mono text-2xl">0421, 0422, 0423, 0424, 0425</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <Link to="/" className="bg-gray-700 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600 transition">
              Volver al inicio
            </Link>
            <button onClick={() => setShowConfetti(false)} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-2 px-6 rounded-full hover:scale-105 transform transition duration-300">
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="mb-6 text-xl">Haz clic en el botón para ver la celebración con confetti dorado.</p>
          <button
            onClick={handleShowConfetti}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 px-8 rounded-full hover:scale-105 transform transition duration-300 text-lg"
          >
            Mostrar Celebración
          </button>
        </div>
      )}
    </div>
  );
};

export default TestConfettiPage;
