import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

const RaffleStatusManager = ({ raffles: allRaffles, loading, error, onUpdate, adminToken }) => {
  const navigate = useNavigate();
  const [actionError, setActionError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const raffles = useMemo(() => {
    if (!Array.isArray(allRaffles)) {
      return { active: null, previous: null, others: [] };
    }
    const activeRaffles = allRaffles.filter(raffle => raffle.status === 'active');
    const previousRaffles = allRaffles.filter(raffle => raffle.status === 'completed');
    const otherRaffles = allRaffles.filter(
      raffle => raffle.status !== 'active' && raffle.status !== 'completed'
    );
    return {
      active: activeRaffles.length > 0 ? activeRaffles[0] : null,
      previous: previousRaffles.length > 0 ? previousRaffles[0] : null,
      others: otherRaffles,
    };
  }, [allRaffles]);

  const handleEditRaffle = (raffleId) => {
    navigate(`/admin/raffles/edit/${raffleId}`);
  };

  const handleUpdateRaffleStatus = async (raffleId, newStatus) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await api.put(`/admin/raffles/${raffleId}/status`, 
        { status: newStatus }, 
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      setUpdateSuccess(true);
      if (onUpdate) onUpdate();
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating raffle status:', err);
      const errorMessage = err.response?.data?.message || `Error al actualizar el estado de la rifa a ${newStatus}.`;
      setActionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwapPositions = async () => {
    if (raffles.active && raffles.previous) {
      setIsSubmitting(true);
      setActionError(null);
      try {
        await Promise.all([
          api.put(`/admin/raffles/${raffles.active._id}/status`, 
            { status: 'completed' }, 
            { headers: { Authorization: `Bearer ${adminToken}` } }
          ),
          api.put(`/admin/raffles/${raffles.previous._id}/status`, 
            { status: 'active' }, 
            { headers: { Authorization: `Bearer ${adminToken}` } }
          )
        ]);
        setUpdateSuccess(true);
        if (onUpdate) onUpdate();
        setTimeout(() => setUpdateSuccess(false), 3000);
      } catch (err) {
        console.error('Error swapping raffle positions:', err);
        const errorMessage = err.response?.data?.message || 'Error al intercambiar las posiciones de las rifas.';
        setActionError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePromoteRaffle = async (raffleId) => {
    if (raffles.active) {
      await handleUpdateRaffleStatus(raffles.active._id, 'completed');
    }
    await handleUpdateRaffleStatus(raffleId, 'active');
  };

  const handleDemoteActiveRaffle = async () => {
    if (raffles.active) {
      if (raffles.previous) {
        await handleUpdateRaffleStatus(raffles.previous._id, 'draft');
      }
      await handleUpdateRaffleStatus(raffles.active._id, 'completed');
    }
  };

  const cardStyle = "bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 mb-4";
  const headerStyle = "font-luckiest-guy text-2xl mb-4 text-cyan-400";
  const buttonStyle = "px-4 py-2 rounded font-bold text-white transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
  const editButtonStyle = `${buttonStyle} bg-blue-600 hover:bg-blue-700 mr-2`;
  const promoteButtonStyle = `${buttonStyle} bg-green-600 hover:bg-green-700`;
  const demoteButtonStyle = `${buttonStyle} bg-yellow-600 hover:bg-yellow-700`;
  const swapButtonStyle = "bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center mx-auto my-6 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h2 className="font-luckiest-guy text-3xl text-center mb-6 text-white">
        Gestionar Rifas Existentes
      </h2>
      
      {error && <ErrorAlert message={error} />}
      {actionError && <ErrorAlert message={actionError} />}
      {loading && <LoadingSpinner />}

      {updateSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p className="font-bold">¡Éxito!</p>
          <p>Los cambios han sido guardados correctamente.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Active Raffle Card */}
        <div>
          <h2 className={headerStyle}>Sorteo Activo</h2>
          <div className={`${cardStyle} border-l-4 border-green-500`}>
            {raffles.active ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm mr-3">ACTIVO</div>
                  <h3 className="text-xl font-bold text-white">{raffles.active.name}</h3>
                </div>
                {raffles.active.imageUrl && <img src={raffles.active.imageUrl} alt={raffles.active.name} className="w-full h-48 object-cover rounded-lg mb-4" />}
                <div className="grid grid-cols-2 gap-2 mb-4 text-gray-300">
                  <div><span className="font-semibold">Precio:</span> ${raffles.active.price} USD</div>
                  <div><span className="font-semibold">BS:</span> {raffles.active.priceBs || 'N/A'}</div>
                  <div><span className="font-semibold">Disponibles:</span> {raffles.active.availableTickets}</div>
                  <div><span className="font-semibold">Total:</span> {raffles.active.maxTickets}</div>
                </div>
                <div className="flex mt-4">
                  <button onClick={() => handleEditRaffle(raffles.active._id)} className={editButtonStyle} disabled={isSubmitting}>Editar</button>
                  <button onClick={handleDemoteActiveRaffle} className={demoteButtonStyle} disabled={isSubmitting}>Mover a Anterior</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-700 rounded-lg">
                <p className="text-gray-400 mb-4">No hay sorteo activo</p>
                {raffles.others.length > 0 && <p className="text-sm text-cyan-400">Promueva un sorteo desde "Otros Sorteos"</p>}
              </div>
            )}
          </div>
        </div>

        {/* Previous Raffle Card */}
        <div>
          <h2 className={headerStyle}>Sorteo Anterior</h2>
          <div className={`${cardStyle} border-l-4 border-yellow-500`}>
            {raffles.previous ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm mr-3">ANTERIOR</div>
                  <h3 className="text-xl font-bold text-white">{raffles.previous.name}</h3>
                </div>
                {raffles.previous.imageUrl && <img src={raffles.previous.imageUrl} alt={raffles.previous.name} className="w-full h-48 object-cover rounded-lg mb-4" />}
                <div className="grid grid-cols-2 gap-2 mb-4 text-gray-300">
                  <div><span className="font-semibold">Precio:</span> ${raffles.previous.price} USD</div>
                  <div><span className="font-semibold">BS:</span> {raffles.previous.priceBs || 'N/A'}</div>
                  <div><span className="font-semibold">Vendidos:</span> {raffles.previous.maxTickets - raffles.previous.availableTickets}</div>
                  <div><span className="font-semibold">Total:</span> {raffles.previous.maxTickets}</div>
                </div>
                <div className="flex mt-4">
                  <button onClick={() => handleEditRaffle(raffles.previous._id)} className={editButtonStyle} disabled={isSubmitting}>Editar</button>
                  <button onClick={() => handlePromoteRaffle(raffles.previous._id)} className={promoteButtonStyle} disabled={isSubmitting || !!raffles.active}>Mover a Activo</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-700 rounded-lg">
                <p className="text-gray-400 mb-4">No hay sorteo anterior</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {raffles.active && raffles.previous && (
        <button onClick={handleSwapPositions} className={swapButtonStyle} disabled={isSubmitting}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
          Intercambiar Posiciones
        </button>
      )}

      {raffles.others.length > 0 && (
        <div className="mt-10">
          <h2 className={headerStyle}>Otros Sorteos (Borradores)</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {raffles.others.map(raffle => (
              <div key={raffle._id} className={`${cardStyle} border-l-4 border-gray-500`}>
                <div className="flex items-center mb-3">
                  <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm mr-2">{raffle.status.toUpperCase()}</div>
                  <h3 className="text-lg font-bold truncate text-white">{raffle.name}</h3>
                </div>
                {raffle.imageUrl && <img src={raffle.imageUrl} alt={raffle.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
                <div className="flex justify-between mb-2 text-gray-300 text-sm">
                  <div><span className="font-semibold">Precio:</span> ${raffle.price}</div>
                  <div><span className="font-semibold">Tickets:</span> {raffle.maxTickets}</div>
                </div>
                <div className="flex mt-3 space-x-2">
                  <button onClick={() => handleEditRaffle(raffle._id)} className={`${editButtonStyle} text-sm flex-1`} disabled={isSubmitting}>Editar</button>
                  <button onClick={() => handlePromoteRaffle(raffle._id)} className={`${promoteButtonStyle} text-sm flex-1`} disabled={isSubmitting || !!raffles.active}>Activar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RaffleStatusManager;
