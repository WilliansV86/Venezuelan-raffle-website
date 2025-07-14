import React from 'react';

const TransactionTable = ({ transactions, onRowClick }) => {

    const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
    switch (status) {
      case 'approved':
      case 'completed':
        return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>Completado</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}>Pendiente</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>Rechazado</span>;
      default:
        return <span className={`${baseClasses} bg-gray-500/20 text-gray-300`}>{status}</span>;
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Transacción</th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Rifa</th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Monto</th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Tickets</th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Fecha</th>
              <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx._id} onClick={() => onRowClick(tx)} className="hover:bg-gray-700/50 cursor-pointer transition-colors duration-200">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-base font-medium text-white">{tx.buyerName || 'N/A'}</div>
                    <div className="text-sm text-gray-400 font-mono">ID: {tx._id.slice(-8)}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-300">{tx.raffle?.name || 'N/A'}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-green-400 font-semibold">{typeof tx.amountUSD === 'number' ? tx.amountUSD.toFixed(2) : 'N/A'}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-center text-white">{tx.tickets.length}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">{getStatusBadge(tx.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-16">
                  <div className="text-gray-400 text-lg">No hay transacciones.</div>
                  <div className="text-gray-500">Cuando se realice una compra, aparecerá aquí.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
