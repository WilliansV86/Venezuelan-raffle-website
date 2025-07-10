import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  
  const navigate = useNavigate();
  
  // Check if adminKey exists in localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
      setAuthenticated(true);
    }
  }, []);
  
  // Load transactions when authenticated
  useEffect(() => {
    if (authenticated) {
      fetchTransactions();
    }
  }, [authenticated]);
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log('Fetching transactions with admin key:', adminKey);
      
      // Use API base URL from api.js configuration
      const API_URL = process.env.NODE_ENV === 'production'
        ? '/api' // In production, use relative path
        : 'http://localhost:5100/api'; // In development
      
      const response = await axios.get(`${API_URL}/admin/transactions`, {
        headers: { 'x-admin-key': adminKey }
      });
      
      console.log('Admin transactions response:', response);
      
      if (response.data && response.data.success) {
        console.log('Setting transactions:', response.data.data);
        setTransactions(response.data.data);
      } else {
        console.error('API returned unsuccessful response:', response.data);
        setError('Failed to load transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      }
      
      setError(err.response?.data?.message || 'Error connecting to server');
      
      if (err.response?.status === 401) {
        // Invalid admin key
        console.log('Unauthorized access - removing admin key');
        localStorage.removeItem('admin_key');
        setAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('admin_key', adminKey);
    setAuthenticated(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('admin_key');
    setAuthenticated(false);
    setAdminKey('');
  };
  
  const openTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
  };
  
  const closeTransactionDetails = () => {
    setSelectedTransaction(null);
    setAdminNotes('');
    setActionMessage('');
  };
  
  const updateTransactionStatus = async (status) => {
    try {
      setLoading(true);
      
      // Use API base URL from api.js configuration
      const API_URL = process.env.NODE_ENV === 'production'
        ? '/api' // In production, use relative path
        : 'http://localhost:5100/api'; // In development
      
      console.log(`Updating transaction ${selectedTransaction._id} status to ${status}`);
      
      const response = await axios.put(
        `${API_URL}/admin/transactions/${selectedTransaction._id}/status`,
        { status, adminNotes },
        { headers: { 'x-admin-key': adminKey } }
      );
      
      console.log('Update transaction response:', response.data);
      
      if (response.data.success) {
        setActionMessage(
          status === 'confirmed' 
            ? '✅ Pago confirmado exitosamente. Los números de ticket serán enviados por email.'
            : '❌ Pago rechazado.'
        );
        
        // Update local transaction data
        setTransactions(transactions.map(t => 
          t._id === selectedTransaction._id ? { ...t, status } : t
        ));
        
        // Update selected transaction
        setSelectedTransaction({ ...selectedTransaction, status });
        
        // Refresh transactions after 2 seconds
        setTimeout(() => {
          fetchTransactions();
        }, 2000);
      } else {
        setActionMessage('Error: No se pudo actualizar el estado del pago');
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      setActionMessage(`Error: ${err.response?.data?.message || 'Error de conexión'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const processEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5100/api/admin/process-emails',
        {},
        { headers: { 'x-admin-key': adminKey } }
      );
      
      if (response.data.success) {
        const { processed, success, failed } = response.data.result || { processed: 0, success: 0, failed: 0 };
        setActionMessage(`✅ Procesamiento de emails completado: ${processed} procesados, ${success} enviados, ${failed} fallidos`);
      } else {
        setActionMessage('Error al procesar emails');
      }
    } catch (err) {
      console.error('Error processing emails:', err);
      setActionMessage(`Error: ${err.response?.data?.message || 'Error de conexión'}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-yellow-400">Admin Login</h1>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-2">Admin Key:</label>
              <input 
                type="password" 
                value={adminKey} 
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                placeholder="Enter your admin key"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!adminKey}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-yellow-400">Panel de Administración</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin/raffle-management')}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Gestión de Rifas
            </button>
            <button
              onClick={processEmails}
              className="mr-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Procesar Emails Pendientes
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-600 text-white p-4 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading && !selectedTransaction ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">Comprador</th>
                    <th className="py-3 px-4 text-left">Rifa</th>
                    <th className="py-3 px-4 text-left">Monto</th>
                    <th className="py-3 px-4 text-left">Método</th>
                    <th className="py-3 px-4 text-left">Estado</th>
                    <th className="py-3 px-4 text-left">Fecha</th>
                    <th className="py-3 px-4 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <tr key={transaction._id} className={`border-t border-gray-700 ${
                        transaction.status === 'pending' ? 'bg-yellow-900/20' : 
                        transaction.status === 'confirmed' ? 'bg-green-900/20' : 'bg-red-900/20'
                      }`}>
                        <td className="py-3 px-4 text-gray-400">{transaction._id.substring(0, 8)}...</td>
                        <td className="py-3 px-4">{transaction.comprador || transaction.participant?.name || 'N/A'}</td>
                        <td className="py-3 px-4">{transaction.raffle?.title || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {transaction.paymentCurrencySymbol || (transaction.paymentCurrency === 'Bs' ? 'Bs.' : '$')}
                          {transaction.paymentAmount ? transaction.paymentAmount.toFixed(2) : '0.00'} 
                          {transaction.paymentCurrency || 'Bs'}
                        </td>
                        <td className="py-3 px-4">{transaction.paymentMethod}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.status === 'pending' ? 'bg-yellow-600' : 
                            transaction.status === 'confirmed' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {transaction.status === 'pending' ? 'Pendiente' : 
                             transaction.status === 'confirmed' ? 'Confirmado' : 'Rechazado'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => openTransactionDetails(transaction)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Detalles
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-4 px-4 text-center">
                        No hay transacciones disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <button
              onClick={() => fetchTransactions()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Actualizar Datos
            </button>
          </>
        )}
        
        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-yellow-400">Detalles de la Transacción</h2>
                <button 
                  onClick={closeTransactionDetails}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {loading && (
                <div className="flex justify-center my-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
                </div>
              )}
              
              {actionMessage && (
                <div className={`p-3 rounded mb-4 ${
                  actionMessage.startsWith('✅') ? 'bg-green-700' : 
                  actionMessage.startsWith('❌') ? 'bg-red-700' : 'bg-blue-700'
                }`}>
                  {actionMessage}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 mb-1">ID:</p>
                  <p>{selectedTransaction._id}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Estado:</p>
                  <p>
                    <span className={`px-2 py-1 rounded ${
                      selectedTransaction.status === 'pending' ? 'bg-yellow-600' : 
                      selectedTransaction.status === 'confirmed' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {selectedTransaction.status === 'pending' ? 'Pendiente' : 
                       selectedTransaction.status === 'confirmed' ? 'Confirmado' : 'Rechazado'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Comprador:</p>
                  <p>{selectedTransaction.comprador || selectedTransaction.participant?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Email:</p>
                  <p>{selectedTransaction.participant?.email || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Rifa:</p>
                  <p>{selectedTransaction.raffle?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Monto:</p>
                  <p>
                    {selectedTransaction.paymentCurrencySymbol || (selectedTransaction.paymentCurrency === 'Bs' ? 'Bs.' : '$')}
                    {selectedTransaction.paymentAmount ? selectedTransaction.paymentAmount.toFixed(2) : '0.00'} 
                    {selectedTransaction.paymentCurrency || 'Bs'}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Método de Pago:</p>
                  <p>{selectedTransaction.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Referencia:</p>
                  <p>{selectedTransaction.paymentReference || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-1">Tickets:</p>
                  <p>{selectedTransaction.ticketCount || 0} tickets</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Email Enviado:</p>
                  <p>{selectedTransaction.emailSent ? '✅ Sí' : '❌ No'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-400 mb-2">Comprobante de Pago:</p>
                {selectedTransaction.paymentProof ? (
                  <div className="border border-gray-700 rounded p-2">
                    <img 
                      src={`http://localhost:5100/${selectedTransaction.paymentProof}`}
                      alt="Comprobante de pago" 
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                  </div>
                ) : (
                  <p>No hay comprobante disponible</p>
                )}
              </div>
              
              {selectedTransaction.tickets && selectedTransaction.tickets.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-400 mb-2">Números de Ticket:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTransaction.tickets.map(ticket => (
                      <span key={ticket._id} className="bg-blue-700 px-2 py-1 rounded">
                        {ticket.number}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Only show action buttons if status is pending */}
              {selectedTransaction.status === 'pending' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Notas del Administrador:</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => updateTransactionStatus('confirmed')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      disabled={loading}
                    >
                      Confirmar Pago
                    </button>
                    <button
                      onClick={() => updateTransactionStatus('rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      disabled={loading}
                    >
                      Rechazar Pago
                    </button>
                  </div>
                </>
              )}
              
              {/* Show resend email button if status is confirmed */}
              {selectedTransaction.status === 'confirmed' && (
                <div className="mt-4">
                  <button
                    onClick={processEmails}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    disabled={loading}
                  >
                    Reenviar Email de Confirmación
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
