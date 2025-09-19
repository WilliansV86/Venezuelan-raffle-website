import React, { useState } from 'react';
import axios from 'axios';
import apiConfig from '../config/apiConfig';


const FormDebugPage = () => {
  const [formData, setFormData] = useState({
    name: 'William Valderrama',
    email: 'ing.williamvalderrama@gmail.com',
    phone: '+584141234567',
    paymentMethod: 'pago-movil',
    paymentReference: '1234',
    quantity: 5
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    showPagoMovil: true,
    showZelle: false,
    bsAmount: 4000,
    usdAmount: 5
  });
  
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedData);
    
    // Update payment info based on method and quantity
    if (name === 'paymentMethod' || name === 'quantity') {
      const quantity = parseInt(updatedData.quantity) || 5;
      const pricePerTicket = 5; // $5 USD per ticket base price
      const totalUSD = quantity * pricePerTicket;
      const bsExchangeRate = 800; // 1 USD = 800 Bs
      
      setPaymentInfo({
        showPagoMovil: updatedData.paymentMethod === 'pago-movil' || updatedData.paymentMethod === 'binance',
        showZelle: updatedData.paymentMethod === 'zelle',
        usdAmount: totalUSD,
        bsAmount: totalUSD * bsExchangeRate
      });
    }
  };
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      // Add file if selected
      if (file) {
        submitData.append('paymentProof', file);
      }
      
      // Add ticket data
      submitData.append('quantity', formData.quantity);
      submitData.append('raffleId', 'raffle123');
      
      // Log what we're sending
      console.log('Sending data:');
      for (let pair of submitData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      
      // Submit to debug endpoint
      const result = await axios.post(`${apiConfig.API_URL}/debug-form`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResponse(result.data);
      
      // Now submit to the actual purchase endpoint
      const purchaseResponse = await axios.post(`${apiConfig.endpoints.tickets}/purchase`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Purchase response:', purchaseResponse.data);
    } catch (error) {
      console.error('Error:', error);
      setResponse({
        error: true,
        message: error.message,
        details: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Form Debug Tester</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Nombre Completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
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
            />
          </div>
          
          <div>
            <label className="block mb-1">Teléfono</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
            />
          </div>
          
          <div>
            <label className="block mb-1">Cantidad de Tickets</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max="20"
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
            />
          </div>

          <div>
            <label className="block mb-1">Método de Pago</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
            >
              <option value="pago-movil">Pago Móvil</option>
              <option value="zelle">Zelle</option>
              <option value="binance">Binance</option>
            </select>
          </div>
          
          <div className="p-4 rounded bg-blue-900/30 border border-blue-800">
            <h3 className="font-bold mb-2">Información de Pago:</h3>
            {paymentInfo.showZelle ? (
              <div className="text-yellow-300 font-bold">
                Monto a pagar: ${paymentInfo.usdAmount.toFixed(2)} USD
              </div>
            ) : (
              <div className="text-green-300 font-bold">
                Monto a pagar: Bs. {paymentInfo.bsAmount.toFixed(2)} Bs
              </div>
            )}
          </div>
          
          <div>
            <label className="block mb-1">Referencia de Pago</label>
            <input
              type="text"
              name="paymentReference"
              value={formData.paymentReference}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
            />
          </div>
          
          <div>
            <label className="block mb-1">Comprobante de Pago</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? 'Enviando...' : 'Enviar Formulario de Prueba'}
          </button>
        </form>
        
        {response && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Respuesta del Servidor:</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormDebugPage;
