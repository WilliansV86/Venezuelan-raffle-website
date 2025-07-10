import React, { useState } from 'react';
import axios from 'axios';

const TestPurchasePage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    identificationNumber: '',
    whatsappNumber: '',
    paymentReference: ''
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Procesando solicitud...');
    
    try {
      // Create form data object
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('identificationNumber', formData.identificationNumber);
      submitData.append('whatsappNumber', formData.whatsappNumber);
      submitData.append('paymentReference', formData.paymentReference);
      submitData.append('quantity', 2); // Default quantity
      submitData.append('paymentMethod', 'pago-movil'); // Default payment method
      submitData.append('raffleId', '6864caa6f37efa16df84616e'); // Updated raffle ID from database
      
      if (file) {
        submitData.append('paymentProof', file);
      }
      
      // Log what we're sending
      console.log('Sending test purchase with data:');
      for (let pair of submitData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      
      // Direct API call to our test server
      const response = await axios.post('http://localhost:5100/api/tickets/purchase', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Server response:', response.data);
      
      if (response.data.success) {
        setMessage(`¡Compra exitosa! Tus tickets: ${response.data.tickets.join(', ')}`);
      } else {
        setMessage(`Error: ${response.data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage(`Error: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Prueba de Compra de Tickets</h1>
        
        {message && (
          <div className={`p-4 mb-4 rounded-md ${message.includes('Error') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Nombre</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Apellido</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Cédula</label>
            <input
              type="text"
              name="identificationNumber"
              value={formData.identificationNumber}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">WhatsApp (Opcional)</label>
            <input
              type="text"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
            />
          </div>
          
          <div>
            <label className="block mb-1">Referencia de pago</label>
            <input
              type="text"
              name="paymentReference"
              value={formData.paymentReference}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Comprobante de pago</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? 'Procesando...' : 'Comprar Tickets (Prueba)'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestPurchasePage;
