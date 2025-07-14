import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RaffleForm from '../../components/raffle/RaffleForm';
import api, { updateRaffleAdmin, fetchRaffleById } from '../../services/apiService';
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
        // Debug logging
        console.log('⚙️ EditRafflePage - Loading raffle with ID:', raffleId);
        console.log('⚙️ EditRafflePage - Admin Key exists:', !!localStorage.getItem('admin_key'));
                const adminKey = localStorage.getItem('admin_key');
        
        // Log the request before making it
        console.log('⚙️ EditRafflePage - Using fetchRaffleById for raffle ID:', raffleId);
        
        const { data } = await fetchRaffleById(raffleId);
        
        // Log the response
        console.log('⚙️ EditRafflePage - API response:', data);
        
        if (data && data.data) {
          setInitialData(data.data);
          console.log('⚙️ EditRafflePage - Successfully loaded raffle data');
        } else {
          // Handle cases where the raffle is not found or response is malformed
          console.error('⚙️ EditRafflePage - No data found in response:', data);
          setFetchError('No se encontraron datos para este sorteo o la respuesta fue inválida.');
        }
      } catch (err) {
        console.error('⚙️ EditRafflePage - Error fetching raffle data:', err);
        
        // Log detailed error information
        if (err.response) {
          // The request was made and the server responded with a status code outside of 2xx range
          console.error('⚙️ Error Response Data:', err.response.data);
          console.error('⚙️ Error Response Status:', err.response.status);
          console.error('⚙️ Error Response Headers:', err.response.headers);
          
          // For 404 errors, log additional information
          if (err.response.status === 404) {
            console.error('⚙️ Route not found. Requested URL:', err.config?.url);
            console.error('⚙️ Full request config:', err.config);
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error('⚙️ No response received. Request details:', err.request);
        } else {
          // Something happened in setting up the request
          console.error('⚙️ Request setup error:', err.message);
        }
        
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

  const formattedInitialData = {
    title: initialData.title || '',
    description: initialData.description || '',
    imageUrl: initialData.imageUrl || '',
    ticketPrice: initialData.ticketPrice || 0,
    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    drawDate: initialData.drawDate ? new Date(initialData.drawDate).toISOString().slice(0, 16) : '',
    maxTickets: initialData.maxTickets || 10000,
    prize: initialData.prize || { name: '', description: '' },
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Editar Sorteo</h1>
        <RaffleForm
          initialData={formattedInitialData}
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
