import React, { useState, useEffect } from 'react';
// Link is not used, can be removed if not needed for other parts later
// import { Link } from 'react-router-dom';
import { fetchRaffles } from '../services/apiService'; // Import the service

// Components
import RaffleCard from '../components/raffle/RaffleCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import logoImage from '../assets/logo.jpg'; // Import the logo

const HomePage = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRaffles = async () => { // Renamed function for clarity
      try {
        setLoading(true);
        const { data } = await fetchRaffles(); // Use the service
        setRaffles(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los sorteos. Por favor, intente de nuevo más tarde.');
        console.error('Error fetching raffles:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRaffles(); // Call the renamed function
  }, []);

  return (
    <div>
      {/* Hero Section - Consider making this a reusable component */}
      <section className="mb-10">
        <div className="bg-gradient-to-r from-vnz-blue via-vnz-yellow to-vnz-red rounded-lg shadow-lg">
          <div className="text-center">
            <img 
              src={logoImage} 
              alt="TU SUERTE ESTA AQUI VE Logo" 
              className="w-full h-auto mx-auto mb-4 rounded-lg shadow-md" // Increased size, adjusted margin
            />
            <p className="mt-4 text-xl text-white drop-shadow">
              Los mejores sorteos en línea con premios exclusivos para venezolanos en todo el mundo.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-3xl font-bold text-center mb-8">Sorteos Activos</h2>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : raffles.length === 0 ? (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-xl text-gray-600">No hay sorteos activos en este momento.</p>
            <p className="mt-2">¡Vuelve pronto para nuevas oportunidades!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map(raffle => (
              <RaffleCard key={raffle._id} raffle={raffle} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <div className="bg-light p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-center">¿Cómo Funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="mx-auto bg-vnz-blue text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">1</div>
              <h3 className="font-bold mb-2">Selecciona un Sorteo</h3>
              <p>Explora nuestros sorteos activos y elige el premio que desees ganar.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto bg-vnz-yellow text-dark w-12 h-12 rounded-full flex items-center justify-center mb-4">2</div>
              <h3 className="font-bold mb-2">Compra tus Boletos</h3>
              <p>Selecciona la cantidad de boletos que quieres y realiza tu pago.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto bg-vnz-red text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">3</div>
              <h3 className="font-bold mb-2">¡Espera el Sorteo!</h3>
              <p>El día indicado se realizará el sorteo en vivo y anunciaremos al ganador.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
