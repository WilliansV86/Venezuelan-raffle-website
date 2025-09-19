import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Use the centralized api service
import { FaWhatsapp } from 'react-icons/fa';
import PurchaseSuccessModal from '../components/PurchaseSuccessModal'; // Import the modal

const CustomPurchasePage = () => {
  const { raffleId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [raffle, setRaffle] = useState(null);
  const [raffleStats, setRaffleStats] = useState({
    soldTickets: 0,
    totalTickets: 100,
    remainingTickets: 100
  });
  const [quantity, setQuantity] = useState(2); // Start with 2 tickets minimum
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('pago-movil');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    identificationNumber: '',
    phone: '',
    paymentReference: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [ticketAvailability, setTicketAvailability] = useState({
    available: true,
    message: ''
  });
  const [showWarnings, setShowWarnings] = useState(false); // Set to false to hide warnings
  const [showTerms, setShowTerms] = useState(false); // State to control Terms & Conditions modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);

  // Ensure page scrolls to top on load and clean up image URL when component unmounts
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Clean up created URL objects when component unmounts
    return () => {
      if (paymentProofPreview) {
        URL.revokeObjectURL(paymentProofPreview);
      }
    };
  }, [paymentProofPreview]);
  
  // Adjust ticket quantity when payment method changes
  useEffect(() => {
    if (raffle) {
      // Always reset to default values when changing payment method
      if (selectedPayment === 'pago-movil') {
        // For Pago Móvil, always set to exactly 2 tickets
        setQuantity(2);
        setTotalPrice(calculatePrice(raffle, 2, 'pago-movil'));
      } else if (selectedPayment === 'zelle' || selectedPayment === 'binance') {
        // For Zelle and Binance, always set to exactly 10 tickets
        setQuantity(10);
        setTotalPrice(calculatePrice(raffle, 10, selectedPayment));
      }
    }
  }, [selectedPayment, raffle]);
  
  // Load raffle data
  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/raffles/${raffleId}`);
        
        // Handle both response formats
        const raffleData = data.data || data;
        setRaffle(raffleData);
        
        // Set initial quantity and calculate price
        const minTickets = raffleData.minTickets || 1;
        setQuantity(minTickets);
        setTotalPrice(calculatePrice(raffleData, minTickets, selectedPayment));
        
        // Check ticket availability
        try {
          const { data: statsData } = await api.get(`/api/raffles/${raffleId}/stats`);
          const stats = statsData.data || statsData;
          
          // Store the stats in state
          setRaffleStats({
            soldTickets: stats.soldTickets || 0,
            totalTickets: stats.totalTickets || 100,
            remainingTickets: stats.remainingTickets || 100
          });
          
          if (stats.remainingTickets <= 0) {
            setTicketAvailability({
              available: false,
              message: 'No hay tickets disponibles para este sorteo'
            });
          }
        } catch (statsError) {
          console.error('Error checking ticket availability:', statsError);
          setTicketAvailability({
            available: false,
            message: `Error checking ticket availability: Request failed with status code ${statsError.response?.status || 'unknown'}`
          });
        }
      } catch (err) {
        setError('Error al cargar los detalles del sorteo');
        console.error('Error fetching raffle:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRaffle();
    

  }, [raffleId, isSubmitting]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Prevent page scrolling when setting the preview
      const currentScrollPos = window.scrollY;
      
      setPaymentProof(file);
      // Create a URL for preview
      const previewUrl = URL.createObjectURL(file);
      setPaymentProofPreview(previewUrl);
      
      // Restore scroll position after state update
      setTimeout(() => {
        window.scrollTo(0, currentScrollPos);
      }, 0);
    } else {
      setPaymentProof(null);
      setPaymentProofPreview(null);
    }
  };
  
  const handleRemoveFile = () => {
    // Prevent page scrolling when removing the preview
    const currentScrollPos = window.scrollY;
    
    // Clean up the preview URL
    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview);
    }
    setPaymentProof(null);
    setPaymentProofPreview(null);
    
    // Reset the file input
    const fileInput = document.getElementById('paymentProof');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Restore scroll position after state update
    setTimeout(() => {
      window.scrollTo(0, currentScrollPos);
    }, 0);
  };
  
  // Handle opening and closing the Terms & Conditions modal
  const openTerms = () => setShowTerms(true);
  const closeTerms = () => setShowTerms(false);
  
  const increaseQuantity = () => {
    // No maximum limit - users can purchase as many tickets as they want
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    setTotalPrice(calculatePrice(raffle, newQuantity, selectedPayment));
  };
  
  const decreaseQuantity = () => {
    if (!raffle) return;
    
    // Set minimum tickets based on payment method
    let minTickets = 1;
    if (selectedPayment === 'pago-movil') {
      minTickets = 2;
    } else if (selectedPayment === 'zelle' || selectedPayment === 'binance') {
      minTickets = 10;
    }
    
    if (quantity > minTickets) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      setTotalPrice(calculatePrice(raffle, newQuantity, selectedPayment));
    }
  };
  
  const calculatePrice = (raffle, qty, paymentMethod) => {
    // Get the correct price based on payment method
    let price = 0;
    if (paymentMethod === 'pago-movil') {
      // For Pago Móvil, use BS price
      price = raffle.ticketPriceBS || raffle.ticketBS || raffle.priceBS || 0;
    } else {
      // For Zelle and Binance, use USD price
      price = raffle.ticketPrice || raffle.price || 0;
    }
    return price * qty;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const submitData = new FormData();
      // Split the full name into first name and last name for API compatibility
      const nameParts = formData.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      submitData.append('firstName', firstName);
      submitData.append('lastName', lastName);
      submitData.append('email', formData.email);
      submitData.append('identificationNumber', formData.identificationNumber);
      submitData.append('whatsappNumber', formData.phone);
      submitData.append('paymentReference', formData.paymentReference);
      submitData.append('quantity', quantity);
      submitData.append('paymentMethod', selectedPayment);
            submitData.append('raffleId', raffleId);
      submitData.append('totalAmount', totalPrice);
      
      if (paymentProof) {
        submitData.append('paymentProof', paymentProof);
      }
      
      // Log what we're sending
      console.log('Sending purchase with data:');
      for (let pair of submitData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      
      const response = await api.post('/api/tickets/purchase', submitData);
      
      console.log('Server response:', response.data);
      
      if (response.data.success) {
        // Store ticket quantity but don't display actual numbers
        // We'll only set the count of tickets purchased, not the actual numbers
        setPurchasedTickets(response.data.tickets);
        setShowSuccessModal(true);
        
        // Refresh raffle stats to update the progress bar
        try {
          const { data: statsData } = await api.get(`/api/raffles/${raffleId}/stats`);
          const stats = statsData.data || statsData;
          
          // Update the stats in state to refresh the UI
          console.log('Updated stats after purchase:', stats);
          
          setRaffleStats({
            soldTickets: stats.soldTickets || 0,
            totalTickets: stats.totalTickets || 100,
            remainingTickets: stats.remainingTickets || 100
          });
        } catch (statsError) {
          console.error('Error refreshing ticket stats after purchase:', statsError);
        }
      } else {
        alert(`Error: ${response.data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Redirect to home or another page after closing the modal
    window.location.href = '/';
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Cargando...</div>;
  }
  
  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-red-500">{error}</div>;
  }
  
  if (!raffle) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Sorteo no encontrado</div>;
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#121826', backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      <PurchaseSuccessModal 
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        tickets={purchasedTickets}
      />
      <header className="bg-gray-900/80 border-b border-blue-900/30 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Volver a la lista de sorteos</span>
          </Link>
          <div className="text-white/90 font-medium">{raffle && raffle.name}</div>
        </div>
      </header>
      
      <main className="w-full mx-auto px-6 py-3 purchase-page-content">
        <div className="grid md:grid-cols-[9fr_11fr] gap-6 max-w-[1440px] mx-auto">
          {/* Left column */}
          <div className="bg-gray-900/70 rounded-xl p-8 shadow-md border border-gray-800">
            <h1 className="text-4xl font-bold text-center mb-6 uppercase tracking-wider" style={{ 
              background: 'linear-gradient(to right, #4fd1c5, #63b3ed, #a78bfa)', 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>Selecciona tus Tickets</h1>
            
            <div className="mb-10">
              <h3 className="text-base mb-2 font-semibold flex justify-between">
                <span className="text-cyan-300">Tickets Disponibles</span>
                <span className="text-cyan-300">
                  {`Quedan ${Math.round((raffleStats.remainingTickets / raffleStats.totalTickets) * 100)}%`}
                </span>
              </h3>
              <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-700/50 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full relative" 
                  style={{ width: `${Math.round((raffleStats.remainingTickets / raffleStats.totalTickets) * 100)}%` }}
                >
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-full"></div>
                </div>
              </div>
              <p className="text-xs text-cyan-300/70 text-center mt-2 font-medium">¡Asegura tus tickets mientras estén disponibles!</p>
            </div>
            
            {showWarnings && (
              <div className="mb-6">
                <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    <span>Modo Desarrollo: Usando datos de prueba</span>
                  </div>
                </div>
                
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    <span>Error: Error checking ticket availability: Request failed with status code 404</span>
                  </div>
                </div>
              </div>
            )}
            

            
            <div className="relative py-2 my-6">
              <div className="absolute left-0 top-1/2 w-full border-t border-gray-700/50"></div>
            </div>
            <div className="flex items-center justify-center space-x-8 my-6">
              <button 
                onClick={decreaseQuantity} 
                className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
                aria-label="Disminuir cantidad"
              >
                <span className="text-5xl font-black leading-none mb-1">-</span>
              </button>
              <div className="w-32 h-16 bg-gray-700/30 border border-gray-700 rounded-xl flex items-center justify-center text-3xl font-bold shadow-inner">
                {quantity}
              </div>
              <button 
                onClick={increaseQuantity}
                className="w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
                aria-label="Aumentar cantidad"
              >
                <span className="text-5xl font-black leading-none">+</span>
              </button>
            </div>
            <p className="text-center text-amber-400 font-medium text-sm mb-4">
              {selectedPayment === 'pago-movil' ? 
                'Cantidad mínima permitida: 2' : 
                'Cantidad mínima permitida: 10'
              }
            </p>
            
            <div className="relative py-2 my-4">
              <div className="absolute left-0 top-1/2 w-full border-t border-gray-700/50"></div>
            </div>
            
            <div className="mb-8">
              <hr className="border-gray-700 my-8" />
              <h3 className="text-3xl font-bold text-cyan-300 uppercase mb-6 tracking-wider text-center">Métodos de Pago</h3>
              <p className="text-sm text-center text-gray-300 mb-5">
                <span>Elige un método de pago para continuar</span>
              </p>
              <div className="flex justify-between px-8 md:px-16 mb-4">
                {/* Pago Móvil option - highlighted by default */}
                {/* Pago Móvil option */}
                <div className="text-center group relative" style={{ zIndex: 10 }}>
                  <button 
                    onClick={() => setSelectedPayment('pago-movil')}
                    className={`w-20 h-20 rounded-full p-1.5 flex items-center justify-center mb-2 transform transition-all duration-300 ${selectedPayment === 'pago-movil' 
                      ? 'ring-2 ring-yellow-500 scale-110 bg-white shadow-lg shadow-yellow-300/30' 
                      : 'bg-white bg-opacity-70 shadow-md hover:scale-125 hover:shadow-xl hover:bg-opacity-90 hover:shadow-blue-400/30'}`}
                  >
                    <img 
                      src="/images/logo-provincial.png" 
                      alt="BBVA Provincial" 
                      className={`w-16 h-16 object-contain transition-opacity duration-300 ${selectedPayment !== 'pago-movil' ? 'opacity-50' : ''}`} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.innerHTML = "<div class='bg-blue-800 w-full h-full rounded-full flex items-center justify-center'><span class='text-white font-bold text-sm'>BBVA</span></div>";
                      }} 
                    />
                  </button>
                  <span className={`text-base font-medium transition-colors duration-200 ${selectedPayment === 'pago-movil' ? 'text-yellow-400' : 'text-gray-500 group-hover:text-white'}`}>Pago Móvil</span>
                </div>
                
                {/* Zelle option */}
                <div className="text-center group">
                  <button 
                    onClick={() => setSelectedPayment('zelle')}
                    className={`w-20 h-20 rounded-full p-1.5 flex items-center justify-center mb-2 transform transition-all duration-300 ${selectedPayment === 'zelle' 
                      ? 'ring-2 ring-yellow-500 scale-110 bg-white shadow-lg shadow-yellow-300/30' 
                      : 'bg-white bg-opacity-70 shadow-md hover:scale-125 hover:shadow-xl hover:bg-opacity-90 hover:shadow-purple-400/30'}`}
                  >
                    <img 
                      src="/images/logo-zelle.svg" 
                      alt="Zelle" 
                      className={`w-16 h-16 object-contain transition-opacity duration-300 ${selectedPayment !== 'zelle' ? 'opacity-50' : ''}`} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.innerHTML = "<div class='bg-purple-600 w-full h-full rounded-full flex items-center justify-center'><span class='text-white font-bold text-sm'>Zelle</span></div>";
                      }} 
                    />
                  </button>
                  <span className={`text-base font-medium transition-colors duration-200 ${selectedPayment === 'zelle' ? 'text-yellow-400' : 'text-gray-500 group-hover:text-white'}`}>Zelle</span>
                </div>
                
                {/* Binance option */}
                <div className="text-center group">
                  <button 
                    onClick={() => setSelectedPayment('binance')}
                    className={`w-20 h-20 rounded-full p-1.5 flex items-center justify-center mb-2 transform transition-all duration-300 ${selectedPayment === 'binance' 
                      ? 'ring-2 ring-yellow-500 scale-110 bg-white shadow-lg shadow-yellow-300/30' 
                      : 'bg-white bg-opacity-70 shadow-md hover:scale-125 hover:shadow-xl hover:bg-opacity-90 hover:shadow-yellow-400/30'}`}
                  >
                    <img 
                      src="/images/logo-binance.svg" 
                      alt="Binance" 
                      className={`w-16 h-16 object-contain transition-opacity duration-300 ${selectedPayment !== 'binance' ? 'opacity-50' : ''}`} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.innerHTML = "<div class='bg-yellow-500 w-full h-full rounded-full flex items-center justify-center'><span class='text-black font-bold text-sm'>Binance</span></div>";
                      }} 
                    />
                  </button>
                  <span className={`text-base font-medium transition-colors duration-200 ${selectedPayment === 'binance' ? 'text-yellow-400' : 'text-gray-500 group-hover:text-white'}`}>Binance</span>
                </div>
              </div>
              <p className="text-xs text-center text-gray-400">Todos los pagos son procesados de forma segura</p>
            </div>
            
            <div className="bg-gray-900/80 rounded-lg p-5 border border-blue-900/30 mb-8 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-cyan-400/50"></div>
              <p className="text-sm text-cyan-300 text-center mb-2 uppercase tracking-wider font-medium">Cuenta para realizar el pago:</p>
              
              {selectedPayment === 'pago-movil' && (
                <div className="text-center">
                  <p className="font-mono text-xl text-yellow-300 font-medium select-all bg-black/20 py-3 px-4 rounded-md">
                    Provincial (0108) V-15605407 04241378533
                  </p>
                </div>
              )}
              
              {selectedPayment === 'zelle' && (
                <div className="text-center">
                  <p className="font-mono text-xl text-yellow-300 font-medium select-all bg-black/20 py-3 px-4 rounded-md">
                    Business@wvaaenterprise.com
                  </p>
                </div>
              )}
              
              {selectedPayment === 'binance' && (
                <div className="text-center">
                  <p className="font-mono text-xl text-yellow-300 font-medium select-all bg-black/20 py-3 px-4 rounded-md">
                    tusuerteestaaquive@gmail.com
                  </p>
                </div>
              )}
              
              <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                </svg>
                <span>Haz click para copiar esta información</span>
              </p>
            </div>
          </div>
          
          {/* Right column */}
          <div className="bg-gray-900/70 rounded-xl p-8 shadow-md border border-gray-800">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-center p-5 rounded-lg mb-6 shadow-lg">
              <p className="text-base uppercase tracking-wider font-medium opacity-80">Monto a pagar</p>
              {selectedPayment === 'pago-movil' ? (
                <p className="text-5xl mt-2">{totalPrice.toFixed(2)} <span className="text-2xl">Bs</span></p>
              ) : (
                <p className="text-5xl mt-2">${totalPrice.toFixed(2)} <span className="text-2xl">USD</span></p>
              )}
              <div className="mt-3 text-sm bg-black/20 rounded-full py-1.5 px-4 inline-block">
                <span className="font-semibold">Tickets: {quantity}</span>
              </div>
            </div>
            
            <div className="bg-gray-900/70 rounded-xl p-6 shadow-md border border-gray-800 shadow-lg mb-6">
              <h3 className="text-xl font-semibold mb-5 text-center text-cyan-300 uppercase tracking-wider">Información del Comprador</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-xl font-medium text-cyan-400 mb-1 ml-1">Nombre Completo</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/70 border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-xl font-medium text-cyan-400 mb-1 ml-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/70 border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                  placeholder="tu.email@ejemplo.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="identificationNumber" className="block text-xl font-medium text-cyan-400 mb-1 ml-1">Identificación</label>
                <input
                  type="text"
                  id="identificationNumber"
                  name="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/70 border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                  placeholder="Cédula o Pasaporte"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-xl font-medium text-cyan-400 mb-1 ml-1">Teléfono con WhatsApp</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/70 border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                  placeholder="+58 xxx-xxx-xxxx"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="paymentReference" className="block text-xl font-medium text-cyan-400 mb-1 ml-1">
                  {selectedPayment === 'pago-movil' && 'Referencia de Pago'}
                  {selectedPayment === 'zelle' && 'Titular de la cuenta Zelle'}
                  {selectedPayment === 'binance' && 'Titular de la cuenta'}
                </label>
                <input
                  type="text"
                  id="paymentReference"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/70 border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                  placeholder={
                    selectedPayment === 'pago-movil' ? 'Número o código de referencia' :
                    selectedPayment === 'zelle' ? 'Nombre del titular de la cuenta Zelle' :
                    'Nombre del titular de la cuenta Binance'
                  }
                  required
                />
              </div>
              
              <div>
                <div className="relative">
                  <label htmlFor="paymentProof" className="block text-xl font-medium text-cyan-400 mb-1 ml-1">Comprobante de Pago</label>
                  <input
                    id="paymentProof"
                    type="file"
                    onChange={handleFileChange}
                    className="w-full bg-gray-800/70 border border-gray-700 rounded-md p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
                    placeholder="Seleccionar comprobante"
                    aria-label="Comprobante de Pago"
                    required
                  />
                  <p className="text-xs text-cyan-400/70 mt-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                    <span>Sube una captura de tu comprobante de pago</span>
                  </p>
                  
                  {/* Fixed height container that's always present - prevents page jumps */}
                  <div className="h-[250px] overflow-hidden" style={{height: paymentProofPreview ? '250px' : '0'}}>
                    {paymentProofPreview && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-cyan-400">Vista previa:</p>
                          <button 
                            type="button"
                            onClick={handleRemoveFile}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition-colors flex items-center gap-1"
                            aria-label="Eliminar imagen"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                        <div className="border-2 border-cyan-500/30 rounded-md overflow-hidden">
                          <img 
                            src={paymentProofPreview} 
                            alt="Vista previa del comprobante" 
                            className="max-h-60 max-w-full object-contain mx-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Terms and Conditions link */}
              <div className="mt-4 text-center">
                <button 
                  type="button" 
                  onClick={openTerms}
                  className="text-amber-400 hover:text-amber-300 text-base font-medium underline focus:outline-none transition-colors"
                >
                  Ver Términos y Condiciones
                </button>
              </div>
              
              <div className="mt-4 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                <button 
                  type="submit" 
                  className="relative w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold p-4 rounded-md uppercase tracking-wider shadow-lg hover:shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'PROCESANDO...' : 'CONFIRMAR COMPRA'}
                  <div className="absolute inset-0 rounded-md overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent"></div>
                  </div>
                </button>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Link 
                  to="/" 
                  className="bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-3 px-6 rounded-md uppercase tracking-wider shadow-lg hover:shadow-red-500/30 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] text-center"
                >
                  Volver
                </Link>
              </div>
            </form>
            </div>
          </div>
        </div>
      </main>
      
      {/* WhatsApp floating button */}
      <a 
        href="https://wa.me/584241378533" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-xl hover:shadow-green-500/20 hover:from-green-500 hover:to-green-600 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center z-50 border-2 border-green-400/20"
        aria-label="Contactar por WhatsApp"
      >
        <FaWhatsapp size={28} />
        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white/30 shadow-md">
          1
        </div>
        <span className="absolute -bottom-10 right-0 bg-black/80 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Contactar por WhatsApp</span>
      </a>
      
      {/* Terms and Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-900 border border-cyan-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-cyan-800/30 flex justify-between items-center sticky top-0">
              <h3 className="text-xl text-cyan-300 font-bold">Términos y Condiciones</h3>
              <button 
                onClick={closeTerms}
                className="text-gray-400 hover:text-white focus:outline-none"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6 text-gray-300">
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">1. Información General</h4>
                  <p>Al participar en esta rifa, el comprador acepta cumplir con los siguientes términos y condiciones establecidos por los organizadores.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">2. Elegibilidad</h4>
                  <p>Para participar en la rifa, los compradores deben ser mayores de edad según las leyes de su país de residencia. La participación puede estar restringida en ciertos países donde las rifas estén prohibidas.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">3. Tickets y Pagos</h4>
                  <p>Cada ticket es válido únicamente para el sorteo específico al que corresponde. Los pagos deben realizarse a través de los métodos oficiales proporcionados. No se aceptarán pagos por canales no autorizados.</p>
                  <p className="mt-2">Una vez realizada la compra, se enviará una confirmación al correo electrónico proporcionado.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">4. Selección del Ganador</h4>
                  <p>El sorteo se realizará en la fecha indicada en la descripción de la rifa. El ganador será seleccionado de manera aleatoria mediante un sistema transparente y supervisado.</p>
                  <p className="mt-2">El resultado del sorteo será inapelable. El ganador será notificado a través de los datos de contacto proporcionados durante la compra.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">5. Entrega del Premio</h4>
                  <p>El premio será entregado al ganador en las condiciones especificadas en la descripción de la rifa. Los gastos de envío, impuestos o tasas adicionales pueden aplicar dependiendo de la ubicación del ganador.</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">6. Privacidad y Datos Personales</h4>
                  <p>Los datos personales proporcionados por los participantes serán utilizados únicamente para los fines relacionados con la rifa y no serán compartidos con terceros sin consentimiento previo.</p>
                </div>
              </div>
            </div>
            <div className="border-t border-cyan-800/30 px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800">
              <button 
                onClick={closeTerms}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPurchasePage;
