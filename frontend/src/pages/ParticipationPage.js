import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import raffleService from '../services/raffleService';
import transactionService from '../services/transactionService';
import TermsModal from '../components/common/TermsModal';
import { FaSpinner, FaMoneyBillWave, FaLock } from 'react-icons/fa';

const ParticipationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [raffle, setRaffle] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [participantInfo, setParticipantInfo] = useState({
    name: '',
    lastName: '',
    cedula: '',
    phone: '',
    whatsapp: '',
    email: '',
    paymentReference: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        const response = await raffleService.getRaffleById(id);
        if (response.success) {
          setRaffle(response.data);
          setTicketCount(response.data.minTickets || 1);
        } else {
          setError(response.error || 'Failed to fetch raffle data.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRaffle();
  }, [id]);

  const handleParticipantInfoChange = (e) => {
    const { name, value } = e.target;
    setParticipantInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Por favor, sube una imagen de menos de 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      setPaymentScreenshot(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!participantInfo.name || !participantInfo.lastName || !participantInfo.cedula || 
        !participantInfo.whatsapp || !paymentMethod || !paymentScreenshot) {
      setError('Por favor, completa todos los campos requeridos e incluye un comprobante de pago.');
      return;
    }
    
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('raffle', id);
    formData.append('name', participantInfo.name);
    formData.append('lastName', participantInfo.lastName);
    formData.append('cedula', participantInfo.cedula);
    formData.append('whatsapp', participantInfo.whatsapp);
    formData.append('email', participantInfo.email);
    formData.append('paymentMethod', paymentMethod);
    formData.append('paymentReference', participantInfo.paymentReference);
    formData.append('totalAmount', (raffle.price * ticketCount).toFixed(2));
    formData.append('paymentScreenshot', paymentScreenshot);

    try {
      const response = await transactionService.createTransaction(formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/confirmation/${response.data._id}`);
        }, 2000);
      } else {
        setError(response.error || 'Ocurrió un error al procesar la transacción.');
      }
    } catch (err) {
      console.error('Error submitting transaction:', err);
      setError('Error de conexión. Por favor, verifica tu conexión a Internet e intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <FaSpinner className="animate-spin text-4xl mx-auto mb-4 text-cyan-500" />
        <p className="text-xl">Cargando información del sorteo...</p>
      </div>
    </div>
  );
  
  if (error && !raffle) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-red-600/20 text-white p-6 rounded-lg border border-red-600 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-4 py-2 bg-white text-red-600 font-bold rounded-md"
        >
          Volver
        </button>
      </div>
    </div>
  );
  
  if (!raffle) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Sorteo no encontrado</h2>
        <p>Lo sentimos, no pudimos encontrar la información de este sorteo.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-4 py-2 bg-cyan-500 text-white font-bold rounded-md"
        >
          Volver a la página principal
        </button>
      </div>
    </div>
  );

  // Calculate prices
  const priceUSD = raffle.price || 0;
  const priceBS = raffle.priceBS || raffle.ticketPriceBS || 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Participar en el Sorteo
        </h1>
        
        <div className="bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-700">
          {/* Raffle Info */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold mb-2">{raffle.title || 'Sorteo'}</h2>
            <p className="text-gray-300 mb-4">{raffle.description || 'Participa y gana increíbles premios'}</p>
          </div>
          
          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FaMoneyBillWave className="mr-2 text-green-400" />
              Selecciona tu método de pago
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 text-center ${paymentMethod === 'zelle' ? 'border-cyan-500 bg-cyan-800/20' : 'border-gray-600 hover:border-gray-400'}`}
                onClick={() => setPaymentMethod('zelle')}
              >
                <div className="font-bold">Zelle</div>
                <div className="text-sm text-gray-300">Pago en USD</div>
                <div className="font-semibold mt-2">${priceUSD.toFixed(2)} USD</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 text-center ${paymentMethod === 'binance' ? 'border-cyan-500 bg-cyan-800/20' : 'border-gray-600 hover:border-gray-400'}`}
                onClick={() => setPaymentMethod('binance')}
              >
                <div className="font-bold">Binance</div>
                <div className="text-sm text-gray-300">USDT</div>
                <div className="font-semibold mt-2">${priceUSD.toFixed(2)} USD</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 text-center ${paymentMethod === 'pago_movil' ? 'border-cyan-500 bg-cyan-800/20' : 'border-gray-600 hover:border-gray-400'}`}
                onClick={() => setPaymentMethod('pago_movil')}
              >
                <div className="font-bold">Pago Móvil</div>
                <div className="text-sm text-gray-300">Bolívares</div>
                <div className="font-semibold mt-2">Bs. {priceBS.toFixed(2)}</div>
              </div>
            </div>
          </div>
          
          {/* Payment Instructions */}
          {paymentMethod && (
            <div className="mb-6 p-4 border border-yellow-600 bg-yellow-600/20 rounded-lg">
              <h4 className="font-bold text-lg mb-2">Instrucciones de Pago</h4>
              
              {paymentMethod === 'zelle' && (
                <div className="space-y-2">
                  <p>Envía tu pago Zelle a:</p>
                  <p className="font-bold">correo@example.com</p>
                  <p className="text-sm">A nombre de: Nombre Completo</p>
                  <p className="text-sm mt-2">Monto a transferir: <span className="font-bold">${priceUSD.toFixed(2)} USD</span></p>
                </div>
              )}
              
              {paymentMethod === 'binance' && (
                <div className="space-y-2">
                  <p>Envía USDT a la siguiente dirección:</p>
                  <p className="font-bold break-all bg-gray-700 p-2 rounded">0x1234567890abcdef1234567890abcdef12345678</p>
                  <p className="text-sm">Red: BEP20 (Binance Smart Chain)</p>
                  <p className="text-sm mt-2">Monto a transferir: <span className="font-bold">${priceUSD.toFixed(2)} USDT</span></p>
                </div>
              )}
              
              {paymentMethod === 'pago_movil' && (
                <div className="space-y-2">
                  <p>Realiza tu Pago Móvil a:</p>
                  <p className="font-bold">Banco: Banesco</p>
                  <p className="font-bold">Teléfono: 0414-123-4567</p>
                  <p className="font-bold">CI: V-12345678</p>
                  <p className="text-sm mt-2">Monto a transferir: <span className="font-bold">Bs. {priceBS.toFixed(2)}</span></p>
                </div>
              )}
              
              <p className="text-sm mt-4 text-yellow-300">
                Importante: Después de realizar el pago, deberás subir un comprobante.
              </p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 border border-red-500 bg-red-500/20 rounded-lg text-red-200">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                <input 
                  type="text" 
                  id="name"
                  name="name" 
                  value={participantInfo.name} 
                  onChange={handleParticipantInfoChange} 
                  className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                  placeholder="Ingrese su nombre" 
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Apellido</label>
                <input 
                  type="text" 
                  id="lastName"
                  name="lastName" 
                  value={participantInfo.lastName} 
                  onChange={handleParticipantInfoChange} 
                  className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                  placeholder="Ingrese su apellido" 
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="cedula" className="block text-sm font-medium text-gray-300 mb-1">Cédula</label>
              <input 
                type="text" 
                id="cedula"
                name="cedula" 
                value={participantInfo.cedula} 
                onChange={handleParticipantInfoChange} 
                className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                placeholder="Ej: V-12345678" 
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                <input 
                  type="tel" 
                  id="phone"
                  name="phone" 
                  value={participantInfo.phone} 
                  onChange={handleParticipantInfoChange} 
                  className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                  placeholder="Ej: +58 412 1234567" 
                />
              </div>
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
                <input 
                  type="tel" 
                  id="whatsapp"
                  name="whatsapp" 
                  value={participantInfo.whatsapp} 
                  onChange={handleParticipantInfoChange} 
                  className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                  placeholder="Ej: +58 412 1234567" 
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                id="email"
                name="email" 
                value={participantInfo.email} 
                onChange={handleParticipantInfoChange} 
                className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                placeholder="ejemplo@correo.com" 
                required
              />
              <p className="text-xs text-gray-400 mt-1">Necesario para recibir tus números de ticket.</p>
            </div>
            
            <div>
              <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-300 mb-1">Referencia de Pago (Opcional)</label>
              <input 
                type="text" 
                id="paymentReference"
                name="paymentReference" 
                value={participantInfo.paymentReference} 
                onChange={handleParticipantInfoChange} 
                className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                placeholder="Número de referencia o últimos 4 dígitos" 
              />
            </div>

            <div className="pt-4">
              <label htmlFor="paymentScreenshot" className="block text-sm font-medium text-gray-300 mb-2">
                Comprobante de Pago
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-cyan-400 transition-all duration-200">
                <input 
                  type="file" 
                  id="paymentScreenshot" 
                  name="paymentScreenshot" 
                  accept="image/*"
                  onChange={handleFileChange} 
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-cyan-400 file:to-blue-500 file:text-white hover:file:from-cyan-500 hover:file:to-blue-600 transition-all cursor-pointer" 
                  required
                />
                {paymentScreenshot ? (
                  <p className="text-sm mt-2 text-green-400">
                    Archivo seleccionado: {paymentScreenshot.name}
                  </p>
                ) : (
                  <p className="text-xs mt-2 text-gray-500">
                    Seleccione una foto de su comprobante de pago (máx. 5MB)
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 text-left">
              <p className="text-xs text-gray-400 flex items-start">
                <span className="mr-2 mt-0.5">
                  <FaLock className="text-yellow-500" />
                </span>
                Al hacer clic en "Comprar Ticket", aceptas nuestros{' '}
                <span onClick={() => setIsTermsModalOpen(true)} className="text-cyan-400 hover:underline cursor-pointer ml-1 font-medium">Términos y Condiciones</span>.
              </p>
            </div>

            <div className="pt-6 flex justify-center">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100" 
                disabled={submitting || !paymentMethod || !paymentScreenshot}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> 
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaLock className="mr-2" />
                    Comprar Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {isTermsModalOpen && <TermsModal onClose={() => setIsTermsModalOpen(false)} onAccept={() => setIsTermsModalOpen(false)} />}
      
      {/* Success Overlay */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-green-500 max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Pago Recibido!</h2>
            <p className="text-gray-300 mb-4">Tu solicitud ha sido registrada correctamente. Te redirigiremos a la página de confirmación.</p>
            <div className="flex justify-center">
              <FaSpinner className="animate-spin text-2xl text-green-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipationPage;
