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
  const [apiError, setApiError] = useState(null); // For API call errors specifically
  const [isSubmitting, setIsSubmitting] = useState(false); // For purchase submission
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [participantData, setParticipantData] = useState(null); // To store form data
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

  const handleProceedToPayment = (formData) => {
    setParticipantData(formData); // Save participant data
    setApiError(null); // Clear previous API errors
    setPurchaseStep('payment');
  };

  const handleConfirmPurchase = async () => {
    if (!participantData || selectedTickets.length === 0) {
      setApiError('No hay datos de participante o boletos seleccionados.');
      return;
    }
    setIsSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        raffleId: id,
        ticketNumbers: selectedTickets, // Assuming backend can handle an array of ticket numbers
        participant: participantData, // Assuming backend can handle participant object
      };
      // In a real app, the backend /api/tickets should handle creating participant if not exists,
      // then creating tickets and linking them.
      // It should also ensure tickets are still available before creation.
      const { data } = await axios.post('/api/tickets', payload);

      // On success
      setPurchaseStep('confirmation');
      setSelectedTickets([]); // Clear selected tickets
      // Optionally, you might want to re-fetch raffle data to update availableTickets display
      // Or update raffle state directly if the API returns the updated raffle
      if (data.raffle) { // Assuming the API returns the updated raffle
        setRaffle(data.raffle);
      } else {
        // If not, trigger a re-fetch (example, not fully implemented here for brevity)
        // fetchRaffleDetails(); // You'd need to make fetchRaffleDetails accessible or manage state globally
      }
      console.log('Ticket purchase successful:', data); // Log for debugging

    } catch (err) {
      console.error('Error purchasing tickets:', err);
      const message = err.response?.data?.message || 'Error al procesar la compra. Por favor, intente de nuevo.';
      setApiError(message);
      // Optionally, stay on 'payment' step or move to a specific error step
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  
  if (!raffle) return <div className="text-center">No se encontró el sorteo solicitado.</div>;

  // Calculate sold and available counts
  const totalTickets = raffle.totalTickets || 0;
  const availableTicketsArray = Array.isArray(raffle.availableTickets) ? raffle.availableTickets : [];
  const availableCount = availableTicketsArray.length;
  let soldCount = 0;
  if (totalTickets > 0) { // Ensure totalTickets is positive before calculating sold
      soldCount = totalTickets - availableCount;
  }


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
                <p className="text-xl">{soldCount}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="font-bold">Disponibles</p>
                <p className="text-xl">{availableCount}</p>
              </div>
            </div>
          </div>
          
          {/* Purchase Section - changes based on step */}
          {purchaseStep === 'select' && raffle.isActive && availableCount > 0 && (
            <>
              <h2 className="text-xl font-bold mb-3">Selecciona tus Boletos</h2>
              <TicketSelector 
                totalTickets={totalTickets}
                availableTickets={availableTicketsArray} // Pass the actual available tickets array
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

          {purchaseStep === 'select' && (!raffle.isActive || availableCount === 0) && (
            <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
              <h2 className="text-xl font-bold mb-3">Boletos no disponibles</h2>
              <p>
                { !raffle.isActive ? "Este sorteo ya no está activo." : "Todos los boletos para este sorteo han sido vendidos."}
              </p>
              <p className="mt-2">¡Gracias por tu interés!</p>
            </div>
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
              
              {/* File upload would go here - This part remains conceptual for now */}
              <div className="mb-6">
                <label className="block mb-2 font-medium">Comprobante de Pago (Conceptual)</label>
                <input type="file" className="w-full p-2 border rounded" disabled={isSubmitting} />
              </div>
              
              {apiError && <ErrorAlert message={apiError} />}

              <button
                className="btn btn-primary w-full"
                onClick={handleConfirmPurchase}
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinner small /> : 'Confirmar Compra y Enviar Comprobante'}
              </button>
            </div>
          )}

          {purchaseStep === 'confirmation' && (
            <div className="mt-4 p-6 bg-green-100 border-l-4 border-green-500 text-green-700 rounded text-center">
              <h2 className="text-2xl font-bold mb-3">¡Compra Exitosa!</h2>
              <p className="mb-2">Tus boletos han sido registrados.</p>
              <p className="mb-4">Recibirás un correo electrónico con los detalles de tu compra y los números de tus boletos.</p>
              <p className="font-semibold">¡Mucha suerte en el sorteo!</p>
              <Link to="/" className="btn btn-primary mt-6">
                Volver al Inicio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RaffleDetailsPage;
