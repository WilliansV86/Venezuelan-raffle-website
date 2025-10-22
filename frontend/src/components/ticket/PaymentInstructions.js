import React, { useState } from 'react';
import axios from 'axios';

const PaymentInstructions = ({ purchaseData, orderId, onUploadComplete, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  // Upload payment proof
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Por favor selecciona una imagen del comprobante de pago.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    // Create form data
    const formData = new FormData();
    formData.append('paymentProof', selectedFile);
    formData.append('orderId', orderId);

    try {
      const response = await axios.post('/api/payments/proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Notify parent component of successful upload
      onUploadComplete(response.data);
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      setUploadError(
        error.response?.data?.message || 
        'Error al subir el comprobante. Por favor intenta de nuevo.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="font-bold text-xl text-center">Instrucciones de Pago</h3>
        <p className="text-center text-gray-500 mb-4">
          Tu orden #{orderId} ha sido creada. Por favor completa el pago siguiendo estas instrucciones.
        </p>
      </div>

      <div className="bg-vnz-yellow bg-opacity-20 border-l-4 border-vnz-yellow p-4 rounded mb-6">
        <h4 className="font-bold mb-2">Información Importante</h4>
        <p>
          Para confirmar tu participación en el sorteo, realiza el pago y sube una captura de pantalla o foto 
          del comprobante. Tus boletos serán reservados por 24 horas mientras verificamos tu pago.
        </p>
      </div>

      {/* Payment methods section */}
      <div className="mb-6">
        <h4 className="font-bold mb-3">Métodos de Pago Disponibles</h4>
        
        <div className="space-y-4">
          {/* Zelle */}
          <div className="border rounded-md p-4">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="font-medium">Zelle</h5>
            </div>
            <ul className="list-disc pl-6 text-sm">
              <li>Email: pagos@sorteosve.com</li>
              <li>A nombre de: SorteosVE</li>
              <li>Monto: ${purchaseData.totalPrice.toFixed(2)}</li>
            </ul>
          </div>
          
          {/* PayPal */}
          <div className="border rounded-md p-4">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded bg-blue-700 flex items-center justify-center text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="font-medium">PayPal</h5>
            </div>
            <ul className="list-disc pl-6 text-sm">
              <li>Usuario: @sorteosve</li>
              <li>Enlace: paypal.me/sorteosve</li>
              <li>Monto: ${purchaseData.totalPrice.toFixed(2)}</li>
            </ul>
          </div>
          
          {/* Pago Móvil */}
          <div className="border rounded-md p-4">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded bg-green-600 flex items-center justify-center text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="font-medium">Pago Móvil (Venezuela)</h5>
            </div>
            <ul className="list-disc pl-6 text-sm">
              <li>Banco: Provincial (0108)</li>
              <li>Teléfono: 04142881359</li>
              <li>CI: V-15605407</li>
              <li>Monto: Bs. equivalentes a ${purchaseData.totalPrice.toFixed(2)}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload proof section */}
      <div className="mb-6">
        <h4 className="font-bold mb-3">Subir Comprobante de Pago</h4>
        
        <div className="border-dashed border-2 border-gray-300 rounded-md p-6 text-center">
          {previewUrl ? (
            <div className="mb-4">
              <img 
                src={previewUrl} 
                alt="Vista previa del comprobante" 
                className="max-h-60 mx-auto"
              />
            </div>
          ) : (
            <div className="mb-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="mt-2">Haz clic para seleccionar una imagen, o arrastra y suelta aquí</p>
            </div>
          )}
          
          <input
            type="file"
            id="paymentProof"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex justify-center">
            <label
              htmlFor="paymentProof"
              className="btn btn-secondary cursor-pointer"
            >
              Seleccionar Imagen
            </label>
          </div>
          
          {uploadError && (
            <p className="text-red-500 text-sm mt-2">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Order summary section */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h4 className="font-bold mb-2">Resumen de tu Orden</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p className="font-medium">Sorteo:</p>
          <p>{purchaseData.raffleName || 'Sorteo Activo'}</p>
          
          <p className="font-medium">Nombre:</p>
          <p>{purchaseData.name}</p>
          
          <p className="font-medium">Boletos:</p>
          <p>{purchaseData.tickets.join(', ')}</p>
          
          <p className="font-medium">Cantidad:</p>
          <p>{purchaseData.tickets.length} boletos</p>
          
          <p className="font-medium">Total a pagar:</p>
          <p className="font-bold">${purchaseData.totalPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Volver al Formulario
        </button>
        
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="btn btn-primary flex items-center"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subiendo...
            </>
          ) : 'Confirmar Pago'}
        </button>
      </div>
    </div>
  );
};

export default PaymentInstructions;
