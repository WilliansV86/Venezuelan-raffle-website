import React, { useState, useEffect } from 'react';

const RaffleForm = ({ initialData = {}, onSubmit, isEdit = false, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    ticketPrice: '',
    totalTickets: '',
    endDate: '',
    prizeImageUrl: '',
    // isActive is managed by default on backend or specific actions, not usually a direct form field for creation
  });

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        prize: initialData.prize || '',
        ticketPrice: initialData.ticketPrice || '',
        totalTickets: initialData.totalTickets || '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '', // Format for date input
        prizeImageUrl: initialData.prizeImageUrl || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true, // For edit, allow setting isActive
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation before submitting
    if (!formData.title || !formData.prize || !formData.ticketPrice || !formData.totalTickets || !formData.endDate) {
      alert('Por favor, complete todos los campos obligatorios: Título, Premio, Precio del Boleto, Total de Boletos, Fecha de Finalización.');
      return;
    }
    // Convert ticketPrice and totalTickets to numbers
    const dataToSubmit = {
      ...formData,
      ticketPrice: parseFloat(formData.ticketPrice),
      totalTickets: parseInt(formData.totalTickets, 10),
      // Ensure endDate is sent in a format backend expects, if different from ISOString
    };
    if (!isEdit) { // Remove isActive for create, backend defaults it or has specific activation logic
        delete dataToSubmit.isActive;
    }
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white shadow-md rounded-lg">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título del Sorteo *</label>
        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
      </div>

      <div>
        <label htmlFor="prize" className="block text-sm font-medium text-gray-700">Premio *</label>
        <input type="text" name="prize" id="prize" value={formData.prize} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700">Precio del Boleto ($) *</label>
          <input type="number" name="ticketPrice" id="ticketPrice" value={formData.ticketPrice} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
        <div>
          <label htmlFor="totalTickets" className="block text-sm font-medium text-gray-700">Total de Boletos *</label>
          <input type="number" name="totalTickets" id="totalTickets" value={formData.totalTickets} onChange={handleChange} required min="1" step="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
        </div>
      </div>

      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha de Finalización *</label>
        <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>

      <div>
        <label htmlFor="prizeImageUrl" className="block text-sm font-medium text-gray-700">URL de la Imagen del Premio</label>
        <input type="url" name="prizeImageUrl" id="prizeImageUrl" value={formData.prizeImageUrl} onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
      </div>

      {isEdit && (
        <div className="flex items-center">
          <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive || false} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Sorteo Activo</label>
        </div>
      )}

      <div>
        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          {loading ? 'Guardando...' : (isEdit ? 'Actualizar Sorteo' : 'Crear Sorteo')}
        </button>
      </div>
    </form>
  );
};

export default RaffleForm;
