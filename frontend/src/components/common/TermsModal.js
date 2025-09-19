import React from 'react';

const TermsModal = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">Términos y Condiciones</h2>
        <div className="text-gray-300 space-y-4 max-h-80 overflow-y-auto pr-4">
          <p>1. Para participar en el sorteo, debes ser mayor de 18 años.</p>
          <p>2. El pago debe ser confirmado para que tu participación sea válida. Guarda tu comprobante de pago.</p>
          <p>3. Los premios no son transferibles y no pueden ser cambiados por efectivo.</p>
          <p>4. El ganador será contactado a través de los datos proporcionados. Es tu responsabilidad asegurar que la información sea correcta.</p>
          <p>5. Nos reservamos el derecho de modificar los términos y condiciones en cualquier momento.</p>
          <p>6. Al participar, aceptas que tu nombre y apellido puedan ser publicados en nuestras redes sociales si resultas ganador.</p>
        </div>
        <div className="flex justify-center mt-6">
          <button 
            onClick={onAccept} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-green-400/50"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
