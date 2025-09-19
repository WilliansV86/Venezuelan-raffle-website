import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import raffleService from '../services/raffleService';
import transactionService from '../services/transactionService';
import TermsModal from '../components/common/TermsModal';

// ... (import logos)

const ParticipationPage = () => {
  const { id } = useParams();
  const [raffle, setRaffle] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [paymentMethod] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [participantInfo, setParticipantInfo] = useState({
    fullName: '',
    idNumber: '',
    phone: '',
    whatsapp: '',
    email: '',
    paymentReference: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    setPaymentScreenshot(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('raffleId', id);
    formData.append('ticketCount', ticketCount);
    formData.append('paymentMethod', paymentMethod);
    formData.append('paymentScreenshot', paymentScreenshot);
    Object.keys(participantInfo).forEach(key => {
      formData.append(`participantInfo[${key}]`, participantInfo[key]);
    });

    try {
      await transactionService.createTransaction(formData);
      // Handle successful submission (e.g., redirect or show success message)
    } catch (err) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!raffle) return <p>Raffle not found.</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Participar en el Sorteo</h1>
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
          {/* ... (Payment method selection UI) */}
          <div className="mt-8 p-6 bg-yellow-400 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-gray-800">Monto a Transferir</h3>
            <span className="font-bold text-2xl text-gray-900">${(raffle.ticketPrice * ticketCount).toFixed(2)}</span>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  id="fullName"
                  name="fullName" 
                  value={participantInfo.fullName} 
                  onChange={handleParticipantInfoChange} 
                  className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                  placeholder="Ingrese su nombre completo" 
                  required
                />
              </div>
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-300 mb-1">Cédula</label>
                <input 
                  type="text" 
                  id="idNumber"
                  name="idNumber" 
                  value={participantInfo.idNumber} 
                  onChange={handleParticipantInfoChange} 
                  className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                  placeholder="Ingrese su número de cédula" 
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                <input 
                  type="tel" 
                  id="phone"
                  name="phone" 
                  value={participantInfo.phone} 
                  onChange={handleParticipantInfoChange} 
                  className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                  placeholder="Ingrese su número telefónico" 
                  required
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
                  placeholder="Ingrese su número de WhatsApp" 
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Correo Electrónico (Opcional)</label>
              <input 
                type="email" 
                id="email"
                name="email" 
                value={participantInfo.email} 
                onChange={handleParticipantInfoChange} 
                className="w-full p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200" 
                placeholder="Ingrese su correo electrónico" 
              />
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
                placeholder="Ingrese su referencia de pago" 
              />
            </div>

            <div className="pt-4">
              <label htmlFor="paymentScreenshot" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Comprobante de Pago
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-cyan-400 transition-all duration-200">
                <input 
                  type="file" 
                  id="paymentScreenshot" 
                  name="paymentScreenshot" 
                  onChange={handleFileChange} 
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-cyan-400 file:to-blue-500 file:text-white hover:file:from-cyan-500 hover:file:to-blue-600 transition-all cursor-pointer" 
                />
                {paymentScreenshot ? (
                  <p className="text-sm mt-2 text-green-400">
                    Archivo seleccionado: {paymentScreenshot.name}
                  </p>
                ) : (
                  <p className="text-xs mt-2 text-gray-500">
                    Seleccione o arrastre su comprobante de pago
                  </p>
                )}
              </div>
            </div>

            <div className="pt-6 text-left">
              <p className="text-xs text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Al hacer clic en "Comprar Tickets", aceptas nuestros{' '}
                <span onClick={() => setIsTermsModalOpen(true)} className="text-cyan-400 hover:underline cursor-pointer ml-1 font-medium">Términos y Condiciones</span>.
              </p>
            </div>

            <div className="pt-8 flex justify-center">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100" 
                disabled={loading || !paymentMethod}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg> Procesando...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                    </svg>
                    Comprar Tickets
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {isTermsModalOpen && <TermsModal onClose={() => setIsTermsModalOpen(false)} onAccept={() => setIsTermsModalOpen(false)} />}
    </div>
  );
};

export default ParticipationPage;
