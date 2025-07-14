import React, { useState } from 'react';

const TransactionDetailModal = ({ transaction, onClose, onUpdateStatus }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!transaction) return null;

  const handleStatusUpdate = async (newStatus) => {
    setIsSubmitting(true);
    await onUpdateStatus(transaction._id, newStatus);
    setIsSubmitting(false);
    onClose(); 
  };

  const detailItemStyle = "py-2 border-b border-gray-700";
  const labelStyle = "font-semibold text-gray-400";
  const valueStyle = "text-white";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl m-4 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
        
        <h2 className="text-2xl font-bold mb-4 text-cyan-400 font-luckiest-guy">Detalles de la Transacción</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
          <div className={detailItemStyle}><span className={labelStyle}>ID:</span> <span className={`${valueStyle} font-mono text-sm`}>{transaction._id}</span></div>
          <div className={detailItemStyle}><span className={labelStyle}>Rifa:</span> <span className={valueStyle}>{transaction.raffle?.name || 'No disponible'}</span></div>
          <div className={detailItemStyle}><span className={labelStyle}>Comprador:</span> <span className={valueStyle}>{transaction.buyerName}</span></div>
          <div className={detailItemStyle}><span className={labelStyle}>Email:</span> <span className={valueStyle}>{transaction.buyerEmail}</span></div>
          <div className={detailItemStyle}><span className={labelStyle}>Monto (USD):</span> <span className={valueStyle}>${transaction.amountUSD}</span></div>
          <div className={detailItemStyle}><span className={labelStyle}>Monto (Bs.):</span> <span className={valueStyle}>{transaction.amountBs || 'N/A'}</span></div>
          <div className={detailItemStyle}><span className={labelStyle}>Método de Pago:</span> <span className={valueStyle}>{transaction.paymentMethod}</span></div>
          <div className={detailItemStyle}><span className={labelStyle}>Referencia:</span> <span className={`${valueStyle} font-mono text-sm`}>{transaction.paymentReference || 'N/A'}</span></div>
          <div className={detailItemStyle}><span className={labelStyle}>Fecha:</span> <span className={valueStyle}>{new Date(transaction.createdAt).toLocaleString()}</span></div>
          <div className={detailItemStyle}><span className={labelStyle}>Estado:</span> <span className={valueStyle}>{transaction.status}</span></div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2 text-gray-300">Tickets Comprados ({transaction.tickets.length})</h3>
          <div className="flex flex-wrap gap-2">
            {transaction.tickets.map(ticket => (
              <span key={ticket} className="bg-cyan-600 text-white font-bold px-3 py-1 rounded-full text-sm">{ticket}</span>
            ))}
          </div>
        </div>

        {transaction.paymentScreenshot && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 text-gray-300">Comprobante de Pago</h3>
            <a href={transaction.paymentScreenshot} target="_blank" rel="noopener noreferrer">
              <img src={transaction.paymentScreenshot} alt="Comprobante" className="max-w-xs mx-auto rounded-lg border-2 border-gray-600" />
            </a>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
          <button 
            onClick={() => handleStatusUpdate('rejected')} 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
            disabled={isSubmitting || transaction.status === 'rejected'}
          >
            Rechazar
          </button>
          <button 
            onClick={() => handleStatusUpdate('approved')} 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
            disabled={isSubmitting || transaction.status === 'approved'}
          >
            Aprobar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
