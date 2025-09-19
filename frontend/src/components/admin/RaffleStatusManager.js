import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import CreateRaffleForm from './CreateRaffleForm';
import RaffleListTable from './RaffleListTable';
import { FaCheckCircle } from 'react-icons/fa';

const RaffleStatusManager = ({ raffles: initialRaffles, loading, error, onUpdate, onDelete, adminToken }) => {
  // Create a local copy of raffles to manage state updates without full reloads
  const [raffles, setRaffles] = useState(initialRaffles);
  const navigate = useNavigate();
  const [actionError, setActionError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRaffles(initialRaffles);
  }, [initialRaffles]);

  // Updated handler that updates local state directly
  const handleRaffleAction = async (action, updateLocalState) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await action();
      
      // Update local state first for immediate UI update
      if (updateLocalState) {
        updateLocalState();
      }
      
      setUpdateSuccess(true);
      // We're not calling onUpdate() at all to prevent blinking
      // The local state update is sufficient for the UI
      // Backend will still be in sync because of our API calls
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Raffle action failed:', err);
      const errorMessage = err.response?.data?.message || 'La operación falló.';
      setActionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromote = (id) => {
    const activeRaffle = raffles.find(r => r.status === 'active');
    
    return handleRaffleAction(
      async () => {
        // Server-side updates
        if (activeRaffle) {
          await api.put(`/api/raffles/${activeRaffle._id}/status`, { status: 'completed' }, { headers: { Authorization: `Bearer ${adminToken}` } });
        }
        await api.put(`/api/raffles/${id}/status`, { status: 'active' }, { headers: { Authorization: `Bearer ${adminToken}` } });
      },
      // Local state updates for immediate UI response
      () => {
        setRaffles(currentRaffles => {
          return currentRaffles.map(raffle => {
            if (raffle._id === id) {
              return { ...raffle, status: 'active' };
            }
            if (activeRaffle && raffle._id === activeRaffle._id) {
              return { ...raffle, status: 'completed' };
            }
            return raffle;
          });
        });
      }
    );
  };

  const handleDemote = (id) => handleRaffleAction(
    // Server-side update
    () => api.put(`/api/raffles/${id}/status`, { status: 'completed' }, { headers: { Authorization: `Bearer ${adminToken}` } }),
    // Local state update for immediate UI response
    () => {
      setRaffles(currentRaffles => {
        return currentRaffles.map(raffle => {
          if (raffle._id === id) {
            return { ...raffle, status: 'completed' };
          }
          return raffle;
        });
      });
    }
  );

  const handleSetToDraft = (id) => handleRaffleAction(
    // Server-side update
    () => api.put(`/api/raffles/${id}/status`, { status: 'draft' }, { headers: { Authorization: `Bearer ${adminToken}` } }),
    // Local state update for immediate UI response
    () => {
      setRaffles(currentRaffles => {
        return currentRaffles.map(raffle => {
          if (raffle._id === id) {
            return { ...raffle, status: 'draft' };
          }
          return raffle;
        });
      });
    }
  );

  const handleEdit = (id) => {
    navigate(`/admin/raffles/edit/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta rifa? Esta acción no se puede deshacer.')) {
      handleRaffleAction(
        () => api.delete(`/api/raffles/${id}`, { headers: { Authorization: `Bearer ${adminToken}` } }),
        () => {
          // This function is passed from AdminPage to update its state
          if (onDelete) {
            onDelete(id);
          }
        }
      );
    }
  };

  return (
    <div className="p-1">
      {error && <ErrorAlert message={error} />}
      {actionError && <ErrorAlert message={actionError} />}
      {loading && <LoadingSpinner />}
      
      {updateSuccess && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-xl flex items-center space-x-2 z-50">
          <FaCheckCircle /><span>¡Éxito!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <CreateRaffleForm adminToken={adminToken} onRaffleCreated={onUpdate} />
        </div>
        <div className="lg:col-span-3">
          <RaffleListTable 
            raffles={raffles}
            onPromote={handlePromote}
            onDemote={handleDemote}
            onSetToDraft={handleSetToDraft}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default RaffleStatusManager;
