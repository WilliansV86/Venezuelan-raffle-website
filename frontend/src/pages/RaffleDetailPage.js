/* Version4: Updated payment information display, Volver button position, and scroll-to-top functionality */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiConfig from '../config/apiConfig';


// --- Helper Components ---

const SuccessModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-gray-800 border border-blue-500 rounded-lg p-8 max-w-2xl w-full text-white">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">¡Compra Exitosa!</h2>
      <div className="space-y-3 text-gray-400">
        <p className="text-lg">Tu compra ha sido procesada correctamente.</p>
        <p>Una vez que tu pago sea confirmado, recibirás tus números de ticket por correo electrónico dentro de las próximas 24 horas.</p>
      </div>
      <div className="flex justify-center mt-8">
        <button onClick={onClose} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-2 px-6 rounded-full hover:scale-105 transform transition duration-300">
          Cerrar
        </button>
      </div>
    </div>
  </div>
);

const TermsModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 border border-cyan-500 rounded-lg p-6 max-w-3xl w-full text-white relative">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Términos y Condiciones</h2>
            <div className="space-y-2 text-gray-300 max-h-[70vh] overflow-y-auto pr-2">
                <p>1. El participante debe ser mayor de edad.</p>
                <p>2. El pago debe ser verificado antes de la asignación de tickets.</p>
                <p>3. Los tickets no son reembolsables.</p>
                <p>4. El ganador será contactado a través de los datos proporcionados.</p>
            </div>
            <button onClick={onClose} className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                X
            </button>
        </div>
    </div>
);


// --- Main Component ---

const RaffleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core State
  const [raffle, setRaffle] = useState(null);
  const [raffleStats, setRaffleStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    buyerName: '',
    email: '',
    phone: '',
  });
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('pago-movil');
  const [paymentProof, setPaymentProof] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchRaffleAndStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [raffleRes, statsRes] = await Promise.all([
          axios.get(`${apiConfig.API_URL}/raffles/${id}`),
          axios.get(`${apiConfig.API_URL}/raffles/${id}/stats`),
        ]);

        setRaffle(raffleRes.data);
        if (statsRes.data.success) {
          setRaffleStats(statsRes.data.data);
        }

        const minTickets = raffleRes.data.minTicketsPerPurchase?.['pago-movil'] || 1;
        setTicketCount(minTickets);

      } catch (err) {
        setError('No se pudo cargar la información del sorteo. Por favor, intente de nuevo.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRaffleAndStats();
  }, [id]);

  // --- Effects ---
  useEffect(() => {
    if (raffle) {
      const minTickets = raffle.minTicketsPerPurchase?.[selectedPayment] || 1;
      if (ticketCount < minTickets) {
        setTicketCount(minTickets);
      }
    }
  }, [selectedPayment, raffle, ticketCount]);

  // --- Event Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.buyerName || !formData.email || !formData.phone) {
        setFormError('Por favor, complete todos los campos de información del comprador.');
        return;
    }
    if (!paymentProof) {
      setFormError('Por favor, suba el comprobante de pago.');
      return;
    }

    setIsSubmitting(true);

    const submissionData = new FormData();
    submissionData.append('raffleId', id);
    submissionData.append('quantity', ticketCount);
    submissionData.append('paymentMethod', selectedPayment);
    submissionData.append('paymentProof', paymentProof);
    submissionData.append('buyerName', formData.buyerName);
    submissionData.append('email', formData.email);
    submissionData.append('phone', formData.phone);

    try {
      const response = await axios.post(`${apiConfig.API_URL}/tickets/purchase`, submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setShowSuccess(true);
      } else {
        setFormError(response.data.message || 'Ocurrió un error al procesar la compra.');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error de conexión. No se pudo completar la compra.');
      console.error('Purchase error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    navigate('/');
  };

  // --- Derived State & Helpers ---
  const minTickets = raffle?.minTicketsPerPurchase?.[selectedPayment] || 1;
  const isZelleOrBinance = ['zelle', 'binance'].includes(selectedPayment);
  const ticketPrice = isZelleOrBinance ? (raffle?.ticketPriceUSD || 0) : (raffle?.ticketPriceBS || 0);
  const currency = isZelleOrBinance ? 'USD' : 'VES';
  
  const formatCurrency = (amount, currencyCode) => {
    if (currencyCode === 'VES') {
      return `Bs. ${Number(amount).toFixed(2)}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const ticketPriceDisplay = formatCurrency(ticketPrice, currency);
  const totalAmountDisplay = formatCurrency(ticketPrice * ticketCount, currency);
  const isPurchaseDisabled = ticketCount < minTickets || !paymentProof || isSubmitting || !formData.buyerName || !formData.email || !formData.phone;
  const progressPercent = raffleStats?.totalTickets > 0 ? (raffleStats.soldTickets / raffleStats.totalTickets) * 100 : 0;

  // --- Render Logic ---
  if (loading) {
    return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><p>Cargando...</p></div>;
  }

  if (error) {
    return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>;
  }

  if (!raffle) {
    return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><p>Sorteo no encontrado.</p></div>; 
  }

  return (
    <>
      {showSuccess && <SuccessModal onClose={closeSuccessModal} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <Link to="/" className="text-cyan-400 hover:text-white transition">← Volver a la lista de sorteos</Link>
            </div>
          <div className="flex flex-col md:flex-row md:space-x-8">
            {/* Left Column: Image, Stats, Description */}
            <div className="w-full md:w-1/2">
              <img src={raffle.imageUrl || '/default-raffle-image.jpg'} alt={raffle.title} className="w-full h-auto rounded-lg shadow-lg mb-4" />
              
              {raffleStats && raffleStats.totalTickets > 0 && (
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <h3 className="font-bold text-lg mb-2">Progreso de la Rifa</h3>
                  <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Vendidos: {raffleStats.soldTickets}</span>
                    <span>Disponibles: {raffleStats.remainingTickets}</span>
                  </div>
                </div>
              )}

              <h1 className="text-3xl font-bold">{raffle.title}</h1>
              <p className="text-gray-400 mt-2">{raffle.description}</p>
            </div>

            {/* Right Column: Purchase Form */}
            <div className="w-full md:w-1/2 mt-8 md:mt-0">
              <form onSubmit={handlePurchase} className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                <h2 className="text-2xl font-bold mb-4">Completa tu Compra</h2>
                
                {/* Buyer Info */}
                <div>
                  <label className="block mb-2">Nombre Completo</label>
                  <input type="text" name="buyerName" value={formData.buyerName} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" required />
                </div>
                <div>
                  <label className="block mb-2">Correo Electrónico</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" required />
                </div>
                <div>
                  <label className="block mb-2">Teléfono (WhatsApp)</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded p-2" required />
                </div>

                <hr className="border-gray-700" />

                {/* Purchase Details */}
                <div>
                  <p className="text-lg">Precio por ticket: <span className="font-bold text-green-400">{ticketPriceDisplay}</span></p>
                </div>

                <div>
                  <label className="block mb-2">Cantidad de tickets (Mínimo: {minTickets})</label>
                  <input type="number" value={ticketCount} onChange={(e) => setTicketCount(Number(e.target.value))} min={minTickets} className="w-full bg-gray-700 border border-gray-600 rounded p-2" />
                </div>

                <div>
                  <label className="block mb-2">Método de pago</label>
                  <select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-2">
                    <option value="pago-movil">Pago Móvil (Bolívares)</option>
                    <option value="zelle">Zelle (USD)</option>
                    <option value="binance">Binance (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Comprobante de pago</label>
                  <input type="file" onChange={(e) => setPaymentProof(e.target.files[0])} accept="image/png, image/jpeg" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
                </div>

                <div className="pt-2">
                  <p className="text-xl font-bold">Total a pagar: {totalAmountDisplay}</p>
                </div>

                <button type="submit" disabled={isPurchaseDisabled} className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded font-bold disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                  {isSubmitting ? 'Procesando...' : 'Comprar Ahora'}
                </button>

                {formError && <p className="text-red-500 mt-2 text-center">{formError}</p>}
              </form>
            </div>
          </div>
            <div className="text-center mt-8">
                <button onClick={() => setShowTerms(true)} className="text-cyan-400 hover:text-white transition">
                    Ver Términos y Condiciones
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default RaffleDetailPage;
