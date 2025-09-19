import React, { useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

const RaffleEditor = ({ onRaffleCreated, adminToken }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    maxTickets: '',
    imageUrl: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      };

      const submissionData = {
        ...formData,
        price: Number(formData.price),
        maxTickets: Number(formData.maxTickets),
        availableTickets: Number(formData.maxTickets),
      };

      await api.post('/admin/raffles', submissionData, config);
      
      setLoading(false);
      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        price: '',
        maxTickets: '',
        imageUrl: '',
        endDate: '',
      });

      if (onRaffleCreated) {
        onRaffleCreated();
      }
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Error creating raffle:', err);
      const errorMessage = err.response?.data?.message || 'Ocurrió un error al crear la rifa.';
      setError(errorMessage);
      setLoading(false);
    } 
  };

  const inputStyle = "w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500";
  const labelStyle = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h2 className="font-luckiest-guy text-3xl text-center mb-6 text-white">
        Crear Nueva Rifa
      </h2>
      
      {error && <ErrorAlert message={error} />}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p className="font-bold">¡Rifa Creada!</p>
          <p>La nueva rifa ha sido creada exitosamente.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelStyle}>Nombre de la Rifa</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputStyle} required />
        </div>
        <div>
          <label htmlFor="description" className={labelStyle}>Descripción</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} className={inputStyle} rows="3"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className={labelStyle}>Precio del Ticket (USD)</label>
            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className={inputStyle} required min="0" step="0.01" />
          </div>
          <div>
            <label htmlFor="maxTickets" className={labelStyle}>Cantidad de Tickets</label>
            <input type="number" name="maxTickets" id="maxTickets" value={formData.maxTickets} onChange={handleChange} className={inputStyle} required min="1" />
          </div>
        </div>
        <div>
          <label htmlFor="imageUrl" className={labelStyle}>URL de la Imagen</label>
          <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className={inputStyle} />
        </div>
        <div>
          <label htmlFor="endDate" className={labelStyle}>Fecha de Cierre (Opcional)</label>
          <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} className={inputStyle} />
        </div>
        
        <div className="text-center pt-4">
          <button 
            type="submit" 
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Crear Rifa'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RaffleEditor;
