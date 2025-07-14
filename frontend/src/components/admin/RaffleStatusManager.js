import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import CreateRaffleForm from './CreateRaffleForm';
import RaffleListTable from './RaffleListTable';
import { FaCheckCircle } from 'react-icons/fa';

const RaffleStatusManager = ({ raffles, loading, error, onUpdate, adminToken }) => {
  const navigate = useNavigate();
  const [actionError, setActionError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRaffleAction = async (action) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await action();
      setUpdateSuccess(true);
      if (onUpdate) onUpdate();
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Raffle action failed:', err);
      const errorMessage = err.response?.data?.message || 'La operación falló.';
      setActionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromote = (id) => handleRaffleAction(async () => {
    const activeRaffle = raffles.find(r => r.status === 'active');
    if (activeRaffle) {
      await api.put(`/raffles/${activeRaffle._id}/status`, { status: 'completed' }, { headers: { Authorization: `Bearer ${adminToken}` } });
    }
    await api.put(`/raffles/${id}/status`, { status: 'active' }, { headers: { Authorization: `Bearer ${adminToken}` } });
  });

  const handleDemote = (id) => handleRaffleAction(() => 
    api.put(`/raffles/${id}/status`, { status: 'completed' }, { headers: { Authorization: `Bearer ${adminToken}` } })
  );

  const handleEdit = (id) => {
    navigate(`/admin/raffles/edit/${id}`);
  };

  const handleDelete = (id) => handleRaffleAction(() => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta rifa? Esta acción no se puede deshacer.')) {
      return api.delete(`/raffles/${id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    }
    return Promise.resolve();
  });

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
