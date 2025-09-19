import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RaffleForm from '../../components/raffle/RaffleForm';
import { createRaffleAdmin } from '../../services/apiService';
import { isAdminLoggedIn } from '../../utils/adminAuth';
import ErrorAlert from '../../components/common/ErrorAlert';

const CreateRafflePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isAdminLoggedIn()) {
    // Optional: Redirect or show message if not "logged in" via key
    // For now, just showing a message, actual redirection might be better UX.
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
      await createRaffleAdmin(formData);
      alert('Sorteo creado exitosamente!');
      navigate('/admin/raffles'); // Navigate back to the admin list page
    } catch (err) {
      console.error('Error creating raffle:', err);
      setError(err.response?.data?.message || 'Error al crear el sorteo. Verifica la Admin Key y los datos del formulario.');
      setLoading(false);
    }
    // setLoading(false) // This was inside catch, should be outside if navigate happens on success
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear Nuevo Sorteo</h1>
        <RaffleForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default CreateRafflePage;
