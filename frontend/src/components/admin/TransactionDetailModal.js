import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import apiConfig from '../../config/apiConfig';


const TransactionDetailModal = ({ transaction, onClose, onUpdateStatus }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!transaction) return null;

  // Construct the full URL for the payment proof image
  const getImageUrl = (filePath) => {
    if (!filePath) return null;
    // The backend serves the 'uploads' folder. We need to get the relative path from there.
    const parts = filePath.replace(/\\/g, '/').split('/');
    const uploadsIndex = parts.lastIndexOf('uploads');
    if (uploadsIndex === -1) return null; // Should not happen if path is correct

    const relativePath = parts.slice(uploadsIndex + 1).join('/');
    return `${apiConfig.API_URL.replace('/api', '')}/uploads/${relativePath}`;
  };

  const imageUrl = getImageUrl(transaction.paymentScreenshot);

  const handleStatusUpdate = async (newStatus) => {
    setIsSubmitting(true);
    await onUpdateStatus(transaction._id, newStatus);
    setIsSubmitting(false);
    // Do not close on update, allow user to see result
  };

  const getStatusBadge = (status) => {
    const baseStyle = "px-3 py-1 text-sm font-medium rounded-full inline-block";
    switch (status) {
      case 'approved':
      case 'completed':
        return <span className={`${baseStyle} bg-green-500/20 text-green-300`}>Aprobado</span>;
      case 'pending':
        return <span className={`${baseStyle} bg-yellow-500/20 text-yellow-300`}>Pendiente</span>;
      case 'rejected':
        return <span className={`${baseStyle} bg-red-500/20 text-red-300`}>Rechazado</span>;
      default:
        return <span className={`${baseStyle} bg-gray-500/20 text-gray-300`}>{status}</span>;
    }
  };

  const DetailItem = ({ label, value, mono = false }) => (
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-lg text-white ${mono ? 'font-mono' : ''}`}>{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800/80 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Detalle de Transacción</h2>
            <p className="text-sm text-gray-400 font-mono">ID: {transaction._id}</p>
          </div>
          {getStatusBadge(transaction.status)}
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Buyer & Raffle Info */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <DetailItem label="Comprador" value={transaction.participantInfo ? `${transaction.participantInfo.name} ${transaction.participantInfo.lastName}` : 'N/A'} />
              <DetailItem label="Email" value={transaction.participantInfo?.email} />
              <DetailItem label="WhatsApp" value={transaction.participantInfo?.whatsapp} />
              <DetailItem label="Rifa" value={transaction.raffle?.name} />
              <DetailItem label="Monto" value={typeof transaction.totalAmount === 'number' ? `${transaction.paymentMethod?.toLowerCase() === 'zelle' || transaction.paymentMethod?.toLowerCase() === 'binance' ? '$' : 'Bs'} ${transaction.totalAmount.toFixed(2)}` : 'N/A'} />
              <DetailItem label="Método de Pago" value={transaction.paymentMethod} />
              <DetailItem label="Referencia de Pago" value={transaction.paymentReference} mono />
              <DetailItem label="Fecha" value={new Date(transaction.createdAt).toLocaleString()} />
            </div>

            {/* Right Column: Screenshot */}
            {imageUrl && (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-300">Comprobante</h3>
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block group">
                  <img 
                    src={imageUrl} 
                    alt="Comprobante de pago" 
                    className="w-full rounded-lg border-2 border-gray-600 group-hover:border-cyan-400 transition-all duration-300 transform group-hover:scale-105"
                  />
                </a>
              </div>
            )}
          </div>

          {/* Tickets */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-gray-300">Tickets Comprados ({transaction.tickets.length})</h3>
            <div className="flex flex-wrap gap-3">
              {transaction.tickets.map(ticket => (
                <span key={ticket._id || ticket.number} className="bg-cyan-500/20 text-cyan-300 font-mono text-base font-bold px-4 py-2 rounded-md">
                  {ticket.number}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center space-x-4 p-6 bg-gray-900/50 border-t border-gray-700 rounded-b-2xl">
          <p className="text-sm text-gray-400 mr-auto">Actualizar estado de la transacción:</p>
          <button 
            onClick={() => handleStatusUpdate('rejected')} 
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || transaction.status === 'rejected'}
          >
            {isSubmitting ? '...' : 'Rechazar'}
          </button>
          <button 
            onClick={() => handleStatusUpdate('approved')} 
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || transaction.status === 'approved'}
          >
            {isSubmitting ? '...' : 'Aprobar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
