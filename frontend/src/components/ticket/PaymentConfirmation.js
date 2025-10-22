import React from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const PaymentConfirmation = ({ orderData }) => {
  // Trigger confetti effect on component mount
  React.useEffect(() => {
    const duration = 3 * 1000; // 3 seconds
    const end = Date.now() + duration;

    // Venezuelan flag colors
    const colors = ['#FCE45C', '#0072CE', '#EF3340'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
      <div className="mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="font-bold text-2xl mb-2">¡Compra Exitosa!</h3>
        <p className="text-gray-600 mb-6">
          Tu compra ha sido procesada correctamente.
          Tus tickets serán verificados y te serán enviados
          por correo electrónico en las próximas 24 horas.
        </p>
      </div>
      
      <div className="border-t border-b border-gray-200 py-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Número de Orden:</span>
          <span className="font-bold">{orderData.orderId}</span>
        </div>
        
        {/* Ticket numbers are now hidden and will be sent via email after verification */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Cantidad de Boletos:</span>
          <span>{orderData.tickets.length}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Estado:</span>
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
            Pendiente de Verificación
          </span>
        </div>
      </div>
      
      <div className="bg-vnz-blue bg-opacity-10 rounded-lg p-4 mb-6 text-left">
        <h4 className="font-medium mb-2">¿Qué sigue?</h4>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Nuestro equipo verificará tu pago (esto puede tomar hasta 24 horas).</li>
          <li>Recibirás un correo electrónico de confirmación cuando tus boletos estén verificados.</li>
          <li>Podrás consultar el estado de tus boletos en cualquier momento con tu número de orden.</li>
        </ol>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <Link to="/" className="btn btn-primary">
          Volver al Inicio
        </Link>
        
        <a 
          href={`https://wa.me/584142881359?text=Hola,%20acabo%20de%20comprar%20boletos%20para%20el%20sorteo.%20Mi%20número%20de%20orden%20es:%20${orderData.orderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
