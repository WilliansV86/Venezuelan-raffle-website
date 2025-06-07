import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RaffleForm from '../../components/raffle/RaffleForm';
import { fetchRaffleById, updateRaffleAdmin } from '../../services/apiService';
import { isAdminLoggedIn } from '../../utils/adminAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const EditRafflePage = () => {
  const { id: raffleId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false); // For form submission
  const [fetchLoading, setFetchLoading] = useState(true); // For fetching initial data
  const [error, setError] = useState(null); // For form submission errors
  const [fetchError, setFetchError] = useState(null); // For fetching errors

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      setFetchError("Acceso denegado. Por favor, configura la Admin Key.");
      setFetchLoading(false);
      return;
    }
    const loadRaffleData = async () => {
      setFetchLoading(true);
      setFetchError(null);
      try {
        const { data } = await fetchRaffleById(raffleId);
        setInitialData(data);
      } catch (err) {
        console.error('Error fetching raffle data for edit:', err);
        setFetchError(err.response?.data?.message || 'Error al cargar los datos del sorteo.');
      } finally {
        setFetchLoading(false);
      }
    };
    loadRaffleData();
  }, [raffleId]);

  if (!isAdminLoggedIn() && !fetchError) {
    // This case might be hit if the effect hasn't run yet or if admin key is removed during page view
    return (
      <div className="container mx-auto p-4">
        <ErrorAlert message="Acceso denegado. Por favor, configura la Admin Key en el panel de administración." />
      </div>
    );
  }

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await updateRaffleAdmin(raffleId, formData);
      alert('Sorteo actualizado exitosamente!');
      navigate('/admin/raffles');
    } catch (err) {
      console.error('Error updating raffle:', err);
      setError(err.response?.data?.message || 'Error al actualizar el sorteo. Verifica la Admin Key y los datos.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <LoadingSpinner />;
  if (fetchError) return <ErrorAlert message={fetchError} />;
  if (!initialData) return <ErrorAlert message="No se pudieron cargar los datos del sorteo para editar." />;

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Editar Sorteo</h1>
        <RaffleForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isEdit={true}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default EditRafflePage;
