import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Import the refactored components
import RaffleEditor from '../components/admin/RaffleEditor';
import RaffleStatusManager from '../components/admin/RaffleStatusManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

// Transaction components
import TransactionTable from '../components/admin/TransactionTable';
import TransactionDetailModal from '../components/admin/TransactionDetailModal';

const AdminPage = () => {
  const { adminInfo, setAdminInfo, logout } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('raffles'); // 'raffles' or 'transactions'

  // State for raffles
  const [raffles, setRaffles] = useState([]);
  const [rafflesLoading, setRafflesLoading] = useState(true);
  const [rafflesError, setRafflesError] = useState(null);

  // State for transactions
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Authentication check effect
  useEffect(() => {
    const savedInfo = localStorage.getItem('adminInfo');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        if (parsed && parsed.token) {
          setAdminInfo(parsed);
        } else {
          navigate('/admin/login');
        }
      } catch (err) {
        navigate('/admin/login');
      }
    } else {
      navigate('/admin/login');
    }
  }, [navigate, setAdminInfo]);

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
      const { data } = await api.get('/admin/raffles', config);
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
      const { data } = await api.get('/admin/transactions', config);
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
      await api.put(`/admin/transactions/${transactionId}/status`, { status: newStatus }, config);
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

  const buttonBaseStyle = "px-6 py-2 font-bold rounded-lg transition-colors duration-300";
  const activeButtonStyle = "bg-cyan-500 text-white shadow-md";
  const inactiveButtonStyle = "bg-gray-700 text-gray-300 hover:bg-gray-600";

  if (!adminInfo) {
    return <LoadingSpinner message="Verificando credenciales..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-luckiest-guy text-white">Panel de Administrador</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Cerrar Sesión
        </button>
      </header>

      <div className="mb-8 flex justify-center space-x-4">
        <button
          onClick={() => setView('raffles')}
          className={`${buttonBaseStyle} ${view === 'raffles' ? activeButtonStyle : inactiveButtonStyle}`}
        >
          Gestionar Rifas
        </button>
        <button
          onClick={() => setView('transactions')}
          className={`${buttonBaseStyle} ${view === 'transactions' ? activeButtonStyle : inactiveButtonStyle}`}
        >
          Ver Transacciones
        </button>
      </div>

      <main>
        {view === 'raffles' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RaffleEditor 
              onRaffleCreated={handleRaffleUpdate} 
              adminToken={adminInfo.token} 
            />
            <RaffleStatusManager
              raffles={raffles}
              loading={rafflesLoading}
              error={rafflesError}
              onUpdate={handleRaffleUpdate}
              adminToken={adminInfo.token}
            />
          </div>
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
