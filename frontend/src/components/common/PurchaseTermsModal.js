import React from 'react';

const PurchaseTermsModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-900 border border-cyan-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-cyan-800/30 flex justify-between items-center sticky top-0">
          <h3 className="text-xl text-yellow-400 font-bold">Términos y Condiciones</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="text-gray-300 space-y-4 max-h-[60vh] pr-4">
            <p>1. Para participar en el sorteo, debes ser mayor de 18 años.</p>
            <p>2. El pago debe ser confirmado para que tu participación sea válida. Guarda tu comprobante de pago.</p>
            <p>3. Los premios no son transferibles y no pueden ser cambiados por efectivo. El premio sera entregado via Pago movil o en su defecto via Zelle, si el ganador proporciona una cuenta.</p>
            <p>4. El ganador será contactado a través de los datos proporcionados. Es tu responsabilidad asegurar que la información sea correcta.</p>
            <p>5. Nos reservamos el derecho de modificar los términos y condiciones en cualquier momento.</p>
            <p>6. Al participar, aceptas que tu nombre y apellido puedan ser publicados en nuestras redes sociales si resultas ganador.</p>
          </div>
        </div>
        
        <div className="border-t border-cyan-800/30 px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800">
          <button 
            onClick={onClose}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-green-400/50"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTermsModal;
