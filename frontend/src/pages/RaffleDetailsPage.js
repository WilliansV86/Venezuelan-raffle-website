import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import TicketSelector from '../components/ticket/TicketSelector';
import PurchaseForm from '../components/ticket/PurchaseForm';
import RaffleCountdown from '../components/raffle/RaffleCountdown';

const RaffleDetailsPage = () => {
  const { id } = useParams();
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [purchaseStep, setPurchaseStep] = useState('select'); // 'select', 'form', 'payment', 'confirmation'

  useEffect(() => {
    const fetchRaffleDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/raffles/${id}`);
        setRaffle(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los detalles del sorteo. Por favor, intente de nuevo más tarde.');
        console.error('Error fetching raffle details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRaffleDetails();
  }, [id]);

  const handleTicketSelection = (ticketNumber) => {
    if (selectedTickets.includes(ticketNumber)) {
      setSelectedTickets(selectedTickets.filter(t => t !== ticketNumber));
    } else {
      setSelectedTickets([...selectedTickets, ticketNumber]);
    }
  };

  const handleProceedToForm = () => {
    if (selectedTickets.length > 0) {
      setPurchaseStep('form');
    } else {
      alert('Por favor selecciona al menos un boleto para continuar.');
    }
  };

  const handleProceedToPayment = (participantData) => {
    // In a real app, you'd save this data and progress to payment
    setPurchaseStep('payment');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  
  if (!raffle) return <div className="text-center">No se encontró el sorteo solicitado.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/" className="inline-block mb-6 text-primary hover:underline">
        &larr; Volver a Sorteos
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Raffle Header */}
        <div className="vnz-gradient p-6 text-white">
          <h1 className="text-3xl font-bold">{raffle.title}</h1>
          <div className="mt-4 flex flex-wrap items-center justify-between">
            <div>
              <p className="text-xl font-semibold">Premio: {raffle.prize}</p>
              <p className="mt-1">Precio por boleto: ${raffle.ticketPrice.toFixed(2)}</p>
            </div>
            <RaffleCountdown endDate={raffle.endDate} />
          </div>
        </div>
        
        {/* Raffle Content */}
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3">Descripción del Sorteo</h2>
            <p className="whitespace-pre-line">{raffle.description}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3">Detalles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-bold">Total de Boletos</p>
                <p className="text-xl">{raffle.totalTickets}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-bold">Vendidos</p>
                <p className="text-xl">{raffle.soldTickets?.length || 0}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-bold">Disponibles</p>
                <p className="text-xl">{raffle.totalTickets - (raffle.soldTickets?.length || 0)}</p>
              </div>
            </div>
          </div>
          
          {/* Purchase Section - changes based on step */}
          {purchaseStep === 'select' && (
            <>
              <h2 className="text-xl font-bold mb-3">Selecciona tus Boletos</h2>
              <TicketSelector 
                totalTickets={raffle.totalTickets}
                soldTickets={raffle.soldTickets || []}
                selectedTickets={selectedTickets}
                onSelectTicket={handleTicketSelection}
              />
              
              {selectedTickets.length > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <p className="mb-2">
                    <span className="font-bold">Boletos seleccionados:</span> {selectedTickets.join(', ')}
                  </p>
                  <p className="mb-4">
                    <span className="font-bold">Total a pagar:</span> ${(selectedTickets.length * raffle.ticketPrice).toFixed(2)}
                  </p>
                  <button 
                    onClick={handleProceedToForm}
                    className="btn btn-primary"
                  >
                    Continuar con la Compra
                  </button>
                </div>
              )}
            </>
          )}
          
          {purchaseStep === 'form' && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-3">Información del Participante</h2>
              <PurchaseForm 
                selectedTickets={selectedTickets} 
                ticketPrice={raffle.ticketPrice}
                onSubmit={handleProceedToPayment}
                onBack={() => setPurchaseStep('select')}
              />
            </div>
          )}
          
          {purchaseStep === 'payment' && (
            <div className="mt-4 p-6 bg-gray-100 rounded text-center">
              <h2 className="text-xl font-bold mb-3">Realizar Pago</h2>
              <p className="mb-4">Por favor realiza tu pago y sube tu comprobante:</p>
              
              {/* Payment options would go here */}
              <div className="bg-white p-4 rounded mb-6">
                <h3 className="font-bold mb-2">Detalles de Pago</h3>
                <p>Banco: Banesco</p>
                <p>Cuenta: 0134-XXXX-XX-XXXXXXXX</p>
                <p>Titular: Sorteos Venezolanos</p>
              </div>
              
              {/* File upload would go here */}
              <div className="mb-6">
                <label className="block mb-2 font-medium">Comprobante de Pago</label>
                <input type="file" className="w-full p-2 border rounded" />
              </div>
              
              <button className="btn btn-primary">Confirmar Compra</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RaffleDetailsPage;
