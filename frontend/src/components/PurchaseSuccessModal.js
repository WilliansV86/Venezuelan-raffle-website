import React from 'react';
import { Link } from 'react-router-dom';

const PurchaseSuccessModal = ({ isOpen, onClose, tickets }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center border border-yellow-500/30">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 mb-4">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">¡Compra Exitosa!</h2>
        <p className="text-gray-300 mb-4">Tu compra ha sido procesada correctamente.</p>
        <p className="text-gray-400 mb-6">Tus tickets serán verificados y te serán enviados por correo electrónico en las próximas 24 horas.</p>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Información de compra:</h3>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-300 text-md mb-2">Cantidad de tickets adquiridos:</p>
            <p className="text-yellow-400 text-xl font-mono tracking-wider">
              {tickets.length}
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Link to="/" className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">
            Volver al inicio
          </Link>
          <button 
            onClick={onClose} 
            className="px-8 py-2 bg-yellow-500 text-gray-900 font-bold rounded-md hover:bg-yellow-400 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessModal;
