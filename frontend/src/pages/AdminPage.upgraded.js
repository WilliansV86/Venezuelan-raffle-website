import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api'; // Keep the centralized API service
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

// Define API URL constants with multiple possible backend server URLs
const API_URLS = [
  '/api',                     // Production/relative path
  'http://localhost:5100/api', // Most common dev server
  'http://localhost:5000/api', // Alternative common port
  'http://localhost:3001/api', // Another common API port
  'http://localhost:8080/api'  // Another possibility
];

const AdminPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [raffles, setRaffles] = useState([]);
  const [raffleError, setRaffleError] = useState(null);
  const [raffleLoading, setRaffleLoading] = useState(false);
  
  const [showRaffleManager, setShowRaffleManager] = useState(false);
  
  const navigate = useNavigate();
  
  // Check if adminInfo exists in localStorage - keep the current working authentication
  useEffect(() => {
    const savedInfo = localStorage.getItem('adminInfo');
    if (savedInfo) {
      try {
        // Parse the JSON data from localStorage
        const adminInfo = JSON.parse(savedInfo);
        if (adminInfo && adminInfo.token) {
          setAuthenticated(true);
        } else {
          // Invalid format of saved admin info
          localStorage.removeItem('adminInfo');
        }
      } catch (err) {
        console.error('Error parsing adminInfo from localStorage:', err);
        localStorage.removeItem('adminInfo');
      }
    }
  }, []);
  
  // Load transactions when authenticated
  useEffect(() => {
    if (authenticated) {
      fetchTransactions();
    } else {
      // Redirect to login if not authenticated
      navigate('/admin/login');
    }
  }, [authenticated, navigate]);
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching transactions using auth token from localStorage');
      
      // Use the centralized API instance that automatically includes the auth token
      const response = await api.get('/admin/transactions');
      
      console.log('Admin transactions response:', response);
      
      // Handle both array format and {success, data} format
      if (Array.isArray(response.data)) {
        console.log('Setting transactions (array format):', response.data);
        setTransactions(response.data);
      } else if (response.data && response.data.success && response.data.data) {
        console.log('Setting transactions (success.data format):', response.data.data);
        setTransactions(response.data.data);
      } else {
        console.error('API returned unexpected response format:', response.data);
        setError('Failed to load transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        // Handle unauthorized error
        if (err.response.status === 401) {
          console.log('Unauthorized access - token invalid or expired');
          localStorage.removeItem('adminInfo');
          setAuthenticated(false);
          navigate('/admin/login');
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
      }
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseModal = () => {
    setSelectedTransaction(null);
    setAdminNotes('');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    setAuthenticated(false);
    navigate('/admin/login');
  };

  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      setActionMessage(''); // Clear previous messages
      
      console.log(`Updating transaction ${transactionId} status to ${newStatus}`);
      
      const response = await api.put(`/admin/transactions/${transactionId}/status`, {
        status: newStatus,
        adminNotes: adminNotes
      });
      
      console.log('Update response:', response.data);
      
      if (response.data && response.data.success) {
        // Update the local transaction list
        setTransactions(transactions.map(t => 
          t._id === transactionId ? {...t, status: newStatus, adminNotes} : t
        ));
        setActionMessage(`Transaction status updated to ${newStatus}`);
        
        // Close the modal after successful update
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      setActionMessage('Failed to update transaction status');
    }
  };

  const handleApproveTransaction = () => {
    if (selectedTransaction) {
      updateTransactionStatus(selectedTransaction._id, 'Aprobado');
    }
  };

  const handleRejectTransaction = () => {
    if (selectedTransaction) {
      updateTransactionStatus(selectedTransaction._id, 'Rechazado');
    }
  };

  const handleMarkPending = () => {
    if (selectedTransaction) {
      updateTransactionStatus(selectedTransaction._id, 'Pendiente');
    }
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  const toggleRaffleManager = () => {
    setShowRaffleManager(!showRaffleManager);
    if (!showRaffleManager && !raffles.length) {
      fetchRaffles();
    }
  };

  const fetchRaffles = async () => {
    try {
      setRaffleLoading(true);
      setRaffleError(null);
      
      // Use the admin-specific raffles endpoint
      const response = await api.get('/admin/raffles');
      
      console.log('Admin raffles response:', response);
      
      // Handle both array format and {success, data} format
      if (Array.isArray(response.data)) {
        setRaffles(response.data);
      } else if (response.data && response.data.success && response.data.data) {
        setRaffles(response.data.data);
      } else {
        setRaffleError('Failed to load raffles');
      }
    } catch (err) {
      console.error('Error fetching raffles:', err);
      setRaffleError('Failed to load raffles');
    } finally {
      setRaffleLoading(false);
    }
  };

  // Render transaction status with color-coded badges
  const renderStatus = (status) => {
    let badgeClass = 'badge ';
    
    switch (status) {
      case 'Aprobado':
        badgeClass += 'bg-success';
        break;
      case 'Rechazado':
        badgeClass += 'bg-danger';
        break;
      case 'Pendiente':
      default:
        badgeClass += 'bg-warning text-dark';
        break;
    }
    
    return <span className={badgeClass}>{status}</span>;
  };

  // Format dates to local string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // If not authenticated, show message (actual redirect happens in useEffect)
  if (!authenticated) {
    return null; // Don't render anything as we're redirecting
  }

  return (
    <div className="container-fluid admin-page py-4">
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1 className="mb-0">Panel de Administración</h1>
          <div>
            <button 
              className="btn btn-outline-primary me-2" 
              onClick={toggleRaffleManager}
            >
              {showRaffleManager ? 'Ver Transacciones' : 'Gestión de Rifas'}
            </button>
            <button 
              className="btn btn-danger" 
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {error && (
        <ErrorAlert message={error} />
      )}

      {!showRaffleManager ? (
        /* Transactions Management Section */
        <div className="transactions-section">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Transacciones</h5>
              <button 
                className="btn btn-sm btn-light" 
                onClick={handleRefresh} 
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar Datos'}
              </button>
            </div>
            <div className="card-body">
              {loading ? (
                <LoadingSpinner />
              ) : transactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Comprador</th>
                        <th>Rifa</th>
                        <th>Monto</th>
                        <th>Método</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>{transaction._id.substring(0, 8)}...</td>
                          <td>{transaction.buyer?.name || 'N/A'}</td>
                          <td>{transaction.raffle?.name || 'N/A'}</td>
                          <td>${transaction.amount?.toFixed(2) || 'N/A'}</td>
                          <td>{transaction.paymentMethod || 'N/A'}</td>
                          <td>{renderStatus(transaction.status)}</td>
                          <td>{formatDate(transaction.createdAt)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => handleViewTransaction(transaction)}
                            >
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  No hay transacciones disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Raffle Management Section */
        <div className="raffles-section">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Gestión de Rifas</h5>
              <button 
                className="btn btn-sm btn-light" 
                onClick={fetchRaffles} 
                disabled={raffleLoading}
              >
                {raffleLoading ? 'Actualizando...' : 'Actualizar Rifas'}
              </button>
            </div>
            <div className="card-body">
              {raffleLoading ? (
                <LoadingSpinner />
              ) : raffleError ? (
                <ErrorAlert message={raffleError} />
              ) : raffles.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>Fecha Sorteo</th>
                        <th>Tickets Vendidos</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {raffles.map((raffle) => (
                        <tr key={raffle._id}>
                          <td>{raffle._id.substring(0, 8)}...</td>
                          <td>{raffle.name}</td>
                          <td>${raffle.price?.toFixed(2) || 'N/A'}</td>
                          <td>{raffle.active ? 'Activa' : 'Inactiva'}</td>
                          <td>{formatDate(raffle.drawDate)}</td>
                          <td>{raffle.ticketsSold || '0'}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary me-1"
                              onClick={() => navigate(`/admin/raffles/${raffle._id}`)}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  No hay rifas disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles de Transacción</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                {actionMessage && (
                  <div className="alert alert-success">{actionMessage}</div>
                )}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6>Información del Comprador</h6>
                    <table className="table table-sm table-bordered">
                      <tbody>
                        <tr>
                          <th>Nombre:</th>
                          <td>{selectedTransaction.buyer?.name || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Email:</th>
                          <td>{selectedTransaction.buyer?.email || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Teléfono:</th>
                          <td>{selectedTransaction.buyer?.phone || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6>Información del Pago</h6>
                    <table className="table table-sm table-bordered">
                      <tbody>
                        <tr>
                          <th>ID:</th>
                          <td>{selectedTransaction._id}</td>
                        </tr>
                        <tr>
                          <th>Monto:</th>
                          <td>${selectedTransaction.amount?.toFixed(2) || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Método:</th>
                          <td>{selectedTransaction.paymentMethod || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Estado:</th>
                          <td>{renderStatus(selectedTransaction.status)}</td>
                        </tr>
                        <tr>
                          <th>Fecha:</th>
                          <td>{formatDate(selectedTransaction.createdAt)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-12">
                    <h6>Información de la Rifa</h6>
                    <table className="table table-sm table-bordered">
                      <tbody>
                        <tr>
                          <th>Nombre:</th>
                          <td>{selectedTransaction.raffle?.name || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Precio:</th>
                          <td>${selectedTransaction.raffle?.price?.toFixed(2) || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Números:</th>
                          <td>
                            {selectedTransaction.tickets?.map(ticket => 
                              ticket.number
                            ).join(', ') || 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="adminNotes" className="form-label">Notas del Administrador</label>
                  <textarea
                    id="adminNotes"
                    className="form-control"
                    rows="3"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-success me-2"
                  onClick={handleApproveTransaction}
                >
                  Aprobar
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning me-2"
                  onClick={handleMarkPending}
                >
                  Marcar Pendiente
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger me-2"
                  onClick={handleRejectTransaction}
                >
                  Rechazar
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal backdrop */}
      {selectedTransaction && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default AdminPage;
