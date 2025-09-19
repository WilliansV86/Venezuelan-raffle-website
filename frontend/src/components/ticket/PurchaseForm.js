import React, { useState } from 'react';

const PurchaseForm = ({ selectedTickets, ticketPrice, onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    whatsapp: '',
    acceptTerms: false,
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handlePaymentMethodChange = (method) => {
    setFormData({
      ...formData,
      paymentMethod: method,
    });
    
    // If switching to Zelle or Binance, enforce minimum 10 tickets
    if ((method === 'zelle' || method === 'binance') && formData.ticketCount < 10) {
      setFormData({
        ...formData,
        ticketCount: 10,
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'El WhatsApp es obligatorio';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }
    
    // Enforce minimum 10 tickets for Zelle and Binance
    if ((formData.paymentMethod === 'zelle' || formData.paymentMethod === 'binance') && formData.ticketCount < 10) {
      newErrors.ticketCount = `Mínimo 10 tickets requeridos para pagos con ${formData.paymentMethod === 'zelle' ? 'Zelle' : 'Binance'}.`;
    }
    
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Pass form data to parent component
    onSubmit({
      ...formData,
      tickets: selectedTickets,
      totalPrice: selectedTickets.length * ticketPrice
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="font-bold text-lg text-center">Resumen de Compra</h3>
        <div className="bg-gray-100 p-4 rounded mt-3">
          <p><strong>Boletos seleccionados:</strong> {selectedTickets.join(', ')}</p>
          <p><strong>Cantidad de boletos:</strong> {selectedTickets.length}</p>
          <p><strong>Precio por boleto:</strong> ${ticketPrice.toFixed(2)}</p>
          <p className="text-lg font-bold mt-2">
            <strong>Total a pagar:</strong> ${(selectedTickets.length * ticketPrice).toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ingresa tu nombre completo"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="tu@email.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="+58 XXX XXXXXXX"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp *
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.whatsapp ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="+58 XXX XXXXXXX"
          />
          {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            País
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="País de residencia"
          />
        </div>
        
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ciudad de residencia"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="acceptTerms" className={`font-medium ${errors.acceptTerms ? 'text-red-500' : 'text-gray-700'}`}>
              Acepto los términos y condiciones *
            </label>
            <p className="text-gray-500">
              Al hacer clic en esta casilla, confirmas que has leído y estás de acuerdo con nuestros 
              <a href="/terminos" className="text-primary hover:underline"> términos y condiciones</a>.
            </p>
            {errors.acceptTerms && <p className="text-red-500 text-xs mt-1">{errors.acceptTerms}</p>}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Volver a Selección
        </button>
        
        <button
          type="submit"
          className="btn btn-primary"
        >
          Continuar al Pago
        </button>
      </div>
    </form>
  );
};

export default PurchaseForm;
