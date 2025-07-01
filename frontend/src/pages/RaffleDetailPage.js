import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';


// Import payment logos


// This is a placeholder for a Terms and Conditions Modal
const TermsModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-2xl w-full text-gray-300">
      <h2 className="text-3xl font-bold text-white mb-6">Términos y Condiciones</h2>
      <div className="space-y-3 text-gray-400">
        <p>1.- Los números disponibles para la compra en cada una de nuestros sorteos se especificarán en la página de detalles correspondientes a cada sorteo.</p>
        <p>2.- Los tickets serán enviados en un lapso de 24 horas. Tenemos un alto volumen de pagos por procesar.</p>
        <p>3.- Solo podrán participar en nuestros sorteos personas naturales mayores de 18 años con nacionalidad venezolana o extranjeros que residan legalmente en Venezuela.</p>
        <p>4.- Los premios deberán ser retirados en persona en la ubicación designada para cada Sorteo.</p>
        <p>5.- La compra mínima requerida para participar en nuestros sorteos es de dos tickets.</p>
        <p>6.- Para reclamar tu premio tienes un lapso de 72 horas.</p>
        <p>7.- Los ganadores aceptan aparecer en el contenido audio visual del sorteo mostrando su presencia en las redes y entrega de los premios. Esto es OBLIGATORIO.</p>
      </div>
      <button onClick={onClose} className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-6 rounded-full hover:scale-105 transform transition duration-300">
        Aceptar
      </button>
    </div>
  </div>
);

const RaffleDetailPage = () => {
  const { id } = useParams();
  const [selectedPayment, setSelectedPayment] = useState('pago-movil');
  const [ticketCount, setTicketCount] = useState(2);
  const [showTerms, setShowTerms] = useState(true);
  const [progress, setProgress] = useState(90); // Set to 90% to show red bar (<25% left)
  const [paymentProof, setPaymentProof] = useState(null);

  const handlePaymentChange = (newPayment) => {
    setSelectedPayment(newPayment);
    if (newPayment === 'pago-movil') {
      setTicketCount(2);
    } else { // For Zelle and Binance
      setTicketCount(10);
    }
  };

  const paymentDetails = {
    'pago-movil': '0191 - BNC(Banco Nacional de Credito) J506607131 04120727504',
    'zelle': 'Business@wvaaenterprise.com',
    'binance': 'Please provide Binance Pay details'
  };

  const minTickets = selectedPayment === 'pago-movil' ? 2 : 10;

  const handleIncrement = () => setTicketCount(prev => prev + 1);
  const handleDecrement = () => {
    setTicketCount(prev => (prev > minTickets ? prev - 1 : minTickets));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const getProgressBarColor = () => {
    const remaining = 100 - progress;
    if (remaining < 25) return 'bg-gradient-to-r from-red-500 to-red-700'; // Less than 25% left
    if (remaining <= 80) return 'bg-gradient-to-r from-yellow-400 to-yellow-600'; // 25% - 80% left
    return 'bg-gradient-to-r from-green-400 to-green-600'; // More than 80% left
  };

  const ticketPriceUSD = 1.5; // Correct ticket price
  const exchangeRate = 160; // Placeholder exchange rate

  return (
    <div className="min-h-screen bg-hero-pattern bg-cover bg-center bg-fixed">
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900/95 via-blue-900/80 to-black/95 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side: Ticket Selection & Payment */}
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-6">Selecciona tus Tickets</h2>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-cyan-400">Quedan {100 - progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressBarColor()}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <button onClick={handleDecrement} className="bg-red-600 hover:bg-red-700 text-white font-bold text-2xl w-12 h-12 rounded-lg transition">-</button>
                  <input type="text" readOnly value={ticketCount} className="bg-gray-800 border border-gray-600 text-white text-center text-2xl font-bold w-24 h-12 rounded-lg" />
                  <button onClick={handleIncrement} className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl w-12 h-12 rounded-lg transition">+</button>
                </div>
                <p className="text-gray-400 mb-8">Cantidad mínima permitida: {minTickets}</p>

                <h3 className="text-2xl font-bold mb-6 text-center">Métodos de Pago</h3>
                <div className="flex justify-center items-start gap-8 mb-6">
                  {/* Pago Movil */}
                  <div
                    className={`text-center w-24 cursor-pointer transition-all duration-300 ${selectedPayment !== 'pago-movil' ? 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100' : ''}`}
                    onClick={() => handlePaymentChange('pago-movil')}
                  >
                    <div className={`bg-white rounded-full p-1 w-16 h-16 mx-auto flex items-center justify-center border-2 ${selectedPayment === 'pago-movil' ? 'border-blue-500' : 'border-gray-400'}`}>
                        <img src="/images/logo-banesco.png" alt="Pago Movil BNC" className="h-10 w-auto object-contain"/>
                    </div>
                    <p className="mt-2 text-sm font-semibold">Pago Móvil</p>
                  </div>

                  {/* Zelle */}
                  <div
                    className={`text-center w-24 cursor-pointer transition-all duration-300 ${selectedPayment !== 'zelle' ? 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100' : ''}`}
                    onClick={() => handlePaymentChange('zelle')}
                  >
                     <div className={`bg-white rounded-full p-1 w-16 h-16 mx-auto flex items-center justify-center border-2 ${selectedPayment === 'zelle' ? 'border-purple-500' : 'border-purple-400'}`}>
                        <img src="/images/logo-zelle.svg" alt="Zelle" className="h-10 w-auto object-contain"/>
                    </div>
                    <p className="mt-2 text-sm font-semibold">Zelle</p>
                  </div>

                  {/* Binance */}
                  <div
                    className={`text-center w-24 cursor-pointer transition-all duration-300 ${selectedPayment !== 'binance' ? 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100' : ''}`}
                    onClick={() => handlePaymentChange('binance')}
                  >
                    <div className={`bg-white rounded-full p-1 w-16 h-16 mx-auto flex items-center justify-center border-2 ${selectedPayment === 'binance' ? 'border-yellow-500' : 'border-yellow-400'}`}>
                        <img src="/images/logo-binance.svg" alt="Binance" className="h-10 w-auto object-contain"/>
                      </div>
                    <p className="mt-2 text-sm font-semibold">Binance</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center min-h-[60px] flex items-center justify-center">
                  <p className="font-mono text-lg tracking-wider">{paymentDetails[selectedPayment]}</p>
                </div>
              </div>

              {/* Right Side: User Form */}
              <div className="text-white">
                <div className="bg-yellow-400 text-gray-900 text-center p-3 rounded-t-lg">
                  {selectedPayment === 'pago-movil' ? (
                    <>
                      <p className="font-bold text-xl">MONTO BS A TRANSFERIR</p>
                      <p className="font-bold text-3xl">{(ticketCount * ticketPriceUSD * exchangeRate).toFixed(2)} Bs.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-xl">MONTO USD A TRANSFERIR</p>
                      <p className="font-bold text-3xl">{(ticketCount * ticketPriceUSD).toFixed(2)} USD</p>
                    </>
                  )}
                </div>
                <form className="bg-gray-800/50 p-8 rounded-b-lg border-x border-b border-gray-700">
                  <div className="space-y-4">
                    <input type="text" placeholder="Nombre" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <input type="text" placeholder="Apellido" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <input type="email" placeholder="Correo Electrónico" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <input type="text" placeholder="Cédula de Identidad" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <input type="text" placeholder="Número de WhatsApp" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <input 
                      type="text" 
                      placeholder={
                        selectedPayment === 'pago-movil' 
                          ? "Referencia de Pago" 
                          : selectedPayment === 'zelle' 
                          ? "Titular de la cuenta Zelle" 
                          : "Titular de la cuenta"
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                    />
                    <div>
                        <label htmlFor="payment-proof" className="w-full bg-gray-700 border-2 border-dashed border-gray-500 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-400 text-sm font-medium">{paymentProof ? paymentProof.name : 'Adjuntar Comprobante'}</span>
                          <span className="text-gray-500 text-xs mt-1">PNG, JPG, JPEG</span>
                        </label>
                        <input id="payment-proof" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" />
                      </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:scale-105 transform transition duration-300">
                      Comprar Tickets
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-12">
                <button onClick={() => setShowTerms(true)} className="text-cyan-400 hover:text-white transition mb-4 md:mb-0">Ver Términos y Condiciones</button>
                <div className="flex items-center gap-4">
                    <Link to="/" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition">Volver</Link>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition">Comprar</button>
                </div>
            </div>
          </div>
        </div>
      </div>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
};

export default RaffleDetailPage;
