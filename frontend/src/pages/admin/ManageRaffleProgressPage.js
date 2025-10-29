import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RaffleProgressManager from '../../components/admin/RaffleProgressManager';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const ManageRaffleProgressPage = () => {
  const { id: raffleId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const adminInfo = auth.adminInfo;
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load raffle data
  useEffect(() => {
    if (!adminInfo) {
      setError("Acceso denegado. Por favor, inicia sesión como administrador.");
      setLoading(false);
      return;
    }
    
    const loadRaffleData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading raffle data for ID:', raffleId);
        
        // Use proper authentication method with bearer token
        const config = {
          headers: {
            Authorization: `Bearer ${adminInfo.token}`,
          },
        };
        
        // Fetch the specific raffle by ID
        const { data } = await api.get(`/api/admin/raffles/${raffleId}`, config);
        
        if (data) {
          console.log('Raffle data loaded:', data);
          setRaffle(data);
        } else {
          setError('No se encontraron datos para este sorteo o la respuesta fue inválida.');
        }
      } catch (err) {
        console.error('Error fetching raffle:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos del sorteo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadRaffleData();
  }, [raffleId, adminInfo]);

  // Handle raffle update
  const handleRaffleUpdate = (updatedRaffle) => {
    setRaffle(updatedRaffle);
  };

  if (!adminInfo && !error) {
    return (
      <div className="container mx-auto p-4">
        <ErrorAlert message="Acceso denegado. Por favor, inicia sesión como administrador." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="container mx-auto p-4">
        <ErrorAlert message="No se pudieron cargar los datos del sorteo." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Gestionar Progreso de la Rifa</h1>
        {/* Link now navigates to admin page with raffles tab active */}
        <Link 
          to="/admin" 
          state={{ initialView: 'raffles' }}
          className="flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-md shadow-md hover:from-blue-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span>Volver a Gestionar Rifas</span>
        </Link>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">{raffle.title || raffle.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-gray-300"><strong className="text-cyan-400">ID:</strong> {raffle._id}</p>
            <p className="text-gray-300"><strong className="text-cyan-400">Precio:</strong> ${raffle.ticketPrice || raffle.price}</p>
            <p className="text-gray-300"><strong className="text-cyan-400">Tickets máximos:</strong> {raffle.maxTickets || raffle.totalTickets}</p>
          </div>
          <div className="space-y-3">
            <p className="text-gray-300"><strong className="text-cyan-400">Tickets vendidos:</strong> {raffle.soldTickets || raffle.ticketsSold || 0}</p>
            <p className="text-gray-300"><strong className="text-cyan-400">Estado:</strong> <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full text-xs">{raffle.status}</span></p>
            <p className="text-gray-300">
              <strong className="text-cyan-400">Progreso actual:</strong> <span className="text-white font-bold">
                {// Check if manual mode is active
                raffle.displayProgressMode === 'manual' && raffle.displayProgressValue !== null
                  ? raffle.displayProgressValue
                  : Math.round(((raffle.soldTickets || raffle.ticketsSold || 0) / (raffle.maxTickets || raffle.totalTickets || 100)) * 100)
                }%
              </span>
            </p>
          </div>
        </div>
      </div>

      <RaffleProgressManager 
        raffle={raffle} 
        onUpdate={handleRaffleUpdate} 
      />
    </div>
  );
};

export default ManageRaffleProgressPage;
