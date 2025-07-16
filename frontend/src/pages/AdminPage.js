import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Import the refactored components

import RaffleStatusManager from '../components/admin/RaffleStatusManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

// Transaction components
import TransactionTable from '../components/admin/TransactionTable';
import TransactionDetailModal from '../components/admin/TransactionDetailModal';
import { FaReceipt, FaCube, FaSync } from 'react-icons/fa';

const AdminPage = () => {
  const { auth, logout } = useAuth();
  const adminInfo = auth.adminInfo;
  const navigate = useNavigate();

  const [view, setView] = useState('transactions'); // Default to transactions view

  // State for raffles
  const [raffles, setRaffles] = useState([]);
  const [rafflesLoading, setRafflesLoading] = useState(true);
  const [rafflesError, setRafflesError] = useState(null);

  // State for transactions
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Effect to redirect if not authenticated
  useEffect(() => {
    // The AuthProvider is the source of truth. If it has no user, redirect.
    if (adminInfo === null) {
      navigate('/admin/login', { replace: true });
    }
  }, [adminInfo, navigate]);

  // Data fetching functions
  const fetchRaffles = useCallback(async () => {
    if (!adminInfo?.token) return;
    setRafflesLoading(true);
    setRafflesError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      const { data } = await api.get('/api/admin/raffles', config);
      setRaffles(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Error al cargar las rifas.';
      setRafflesError(message);
    } finally {
      setRafflesLoading(false);
    }
  }, [adminInfo?.token]);

  const fetchTransactions = useCallback(async () => {
    if (!adminInfo?.token) return;
    setTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };
      const { data } = await api.get('/api/admin/transactions', config);
      setTransactions(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Error al cargar las transacciones.';
      setTransactionsError(message);
    } finally {
      setTransactionsLoading(false);
    }
  }, [adminInfo?.token]);

  // Effect to fetch data when view or auth changes
  useEffect(() => {
    if (adminInfo?.token) {
      if (view === 'raffles') {
        fetchRaffles();
      } else if (view === 'transactions') {
        fetchTransactions();
      }
    }
  }, [view, adminInfo, fetchRaffles, fetchTransactions]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleRaffleUpdate = () => {
    fetchRaffles(); // Re-fetch raffles after an update
  };
  
  const handleTransactionStatusUpdate = async (transactionId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      await api.put(`/api/admin/transactions/${transactionId}/status`, { status: newStatus }, config);
      fetchTransactions(); // Refresh transactions list
      if (selectedTransaction && selectedTransaction._id === transactionId) {
        setSelectedTransaction(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  const handleOpenModal = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseModal = () => {
    setSelectedTransaction(null);
  };

  const buttonBaseStyle = "px-6 py-3 font-bold rounded-lg transition-all duration-300 flex items-center justify-center space-x-2";
  const activeButtonStyle = "bg-blue-600 text-white shadow-lg ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-500";
  const inactiveButtonStyle = "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white";

  if (!adminInfo) {
    return <LoadingSpinner message="Verificando credenciales..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-luckiest-guy bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Panel de Administrador</h1>
        <div className="flex items-center space-x-4">
          {view === 'transactions' && (
            <button
              onClick={fetchTransactions}
              disabled={transactionsLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              <FaSync className={transactionsLoading ? 'animate-spin' : ''} />
              <span>{transactionsLoading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="mb-8 flex justify-start space-x-4">
        <button
          onClick={() => setView('transactions')}
          className={`${buttonBaseStyle} ${view === 'transactions' ? activeButtonStyle : inactiveButtonStyle}`}
        >
          <FaReceipt />
          <span>Ver Transacciones</span>
        </button>
        <button
          onClick={() => setView('raffles')}
          className={`${buttonBaseStyle} ${view === 'raffles' ? activeButtonStyle : inactiveButtonStyle}`}
        >
          <FaCube />
          <span>Gestionar Rifas</span>
        </button>
      </div>

      <main>
        {view === 'raffles' && (
          <RaffleStatusManager
            raffles={raffles}
            loading={rafflesLoading}
            error={rafflesError}
            onUpdate={handleRaffleUpdate}
            adminToken={adminInfo.token}
          />
        )}

        {view === 'transactions' && (
          <div>
            {transactionsLoading && <LoadingSpinner message="Cargando transacciones..." />}
            {transactionsError && <ErrorAlert message={transactionsError} />}
            {!transactionsLoading && !transactionsError && (
              <TransactionTable 
                transactions={transactions} 
                onRowClick={handleOpenModal} 
              />
            )}
          </div>
        )}
      </main>

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={handleCloseModal}
          onUpdateStatus={handleTransactionStatusUpdate}
        />
      )}
    </div>
  );
};

export default AdminPage;
