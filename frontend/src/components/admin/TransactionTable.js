import React from 'react';

const TransactionTable = ({ transactions, onRowClick }) => {

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Aprobado</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rechazado</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID de Transacción</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rifa</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Comprador</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Monto</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tickets</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx._id} onClick={() => onRowClick(tx)} className="hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{tx._id.slice(-8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{tx.raffle?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{tx.buyerName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${tx.amountUSD}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-white">{tx.tickets.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(tx.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-400">
                  No se encontraron transacciones.
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
