import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAdminRaffles, deleteRaffleAdmin, updateRaffleStatus } from '../../services/apiService';
import { setAdminKey, getAdminKey, isAdminLoggedIn } from '../../utils/adminAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const AdminRafflesListPage = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminKeyInput, setAdminKeyInput] = useState(getAdminKey() || '');
  const [isKeySet, setIsKeySet] = useState(isAdminLoggedIn());
  const navigate = useNavigate();

  const handleSetKey = () => {
    setAdminKey(adminKeyInput);
    setIsKeySet(true);
    // Optionally, reload data or give feedback
    alert('Admin Key configurada. Refresca la lista si es necesario.');
    loadRaffles(); // Reload raffles after setting key
  };

  const handleClearKey = () => {
    setAdminKey(null);
    setAdminKeyInput('');
    setIsKeySet(false);
    setRaffles([]); // Clear raffles as we are "logged out"
    alert('Admin Key eliminada.');
  };

  const loadRaffles = async () => {
    if (!isAdminLoggedIn()) {
      setError('Por favor, configure la Admin Key para ver los sorteos.');
      setRaffles([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Use our new admin-specific function to fetch all raffles
      const response = await fetchAdminRaffles();
      const data = response.data;
      setRaffles(data);
    } catch (err) {
      console.error('Error fetching raffles for admin:', err);
      setError(err.response?.data?.message || 'Error al cargar sorteos. Asegúrate de que la Admin Key sea correcta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isKeySet) {
      loadRaffles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKeySet]);

  const handleDeleteRaffle = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este sorteo?')) {
      return;
    }
    if (!isAdminLoggedIn()) {
        alert('Por favor, configure la Admin Key.');
        return;
    }
    setLoading(true); // Or a specific deleting state
    try {
      await deleteRaffleAdmin(id);
      // Reload raffles after deletion
      loadRaffles();
    } catch (err) {
      console.error('Error deleting raffle:', err);
      setError(err.response?.data?.message || 'Error al eliminar el sorteo.');
      setLoading(false);
    }
  };

  const handleUpdateRaffleStatus = async (id, newStatus) => {
    if (!isAdminLoggedIn()) {
      alert('Por favor, configure la Admin Key.');
      return;
    }
    
    try {
      await updateRaffleStatus(id, newStatus);
      alert(`Estatus del sorteo actualizado a: ${newStatus}`);
      // Reload raffles after status change
      loadRaffles();
    } catch (err) {
      console.error('Error updating raffle status:', err);
      setError(err.response?.data?.message || 'Error al actualizar el estatus del sorteo.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración de Sorteos</h1>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Configuración de Admin Key</h2>
        <div className="flex items-center space-x-2">
          <input
            type="password"
            placeholder="Ingresa tu Admin Key"
            value={adminKeyInput}
            onChange={(e) => setAdminKeyInput(e.target.value)}
            className="p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 flex-grow"
          />
          <button onClick={handleSetKey} className="btn btn-primary">Guardar Key</button>
          {isKeySet && <button onClick={handleClearKey} className="btn bg-red-500 hover:bg-red-600 text-white">Limpiar Key</button>}
        </div>
        {!isKeySet && <p className="text-sm text-red-600 mt-2">La Admin Key es necesaria para realizar operaciones de administración.</p>}
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Sorteos</h2>
        <Link to="/admin/raffles/new" className="btn btn-primary">
          Crear Nuevo Sorteo
        </Link>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} />}

      {!isKeySet && !loading && <p>Por favor, ingresa y guarda la Admin Key para cargar la lista de sorteos.</p>}

      {isKeySet && !loading && !error && raffles.length === 0 && (
        <p>No hay sorteos para mostrar. Intenta crear uno nuevo.</p>
      )}

      {isKeySet && raffles.length > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precios</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boletos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progreso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {raffles.map((raffle) => (
                <tr key={raffle._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{raffle.title}</div>
                    <div className="text-xs text-gray-500">{raffle._id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">USD: ${raffle.ticketPrice}</div>
                    <div className="text-sm text-gray-500">Bs: {raffle.priceBS || raffle.ticketPriceBs || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Total: {raffle.totalTickets}</div>
                    <div className="text-sm text-gray-500">Vendidos: {raffle.soldTickets || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${((raffle.soldTickets || 0) / raffle.totalTickets) * 100}%` }}>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(((raffle.soldTickets || 0) / raffle.totalTickets) * 100)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      raffle.status === 'active' ? 'bg-green-100 text-green-800' : 
                      raffle.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {raffle.status === 'active' ? 'Activo' : 
                       raffle.status === 'completed' ? 'Completado' : raffle.status || 'Borrador'}
                    </span>
                    <div className="mt-2 space-y-1">
                      <button 
                        onClick={() => handleUpdateRaffleStatus(raffle._id, 'active')} 
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 w-full">
                        Activar
                      </button>
                      <button 
                        onClick={() => handleUpdateRaffleStatus(raffle._id, 'completed')} 
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 w-full">
                        Completar
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                    <button onClick={() => navigate(`/admin/raffles/edit/${raffle._id}`)} className="block w-full text-indigo-600 hover:text-indigo-900 border border-indigo-600 rounded px-2 py-1">Editar</button>
                    <button onClick={() => handleDeleteRaffle(raffle._id)} className="block w-full text-red-600 hover:text-red-900 border border-red-600 rounded px-2 py-1">Eliminar</button>
                  </td>
                </tr>
              ))}
            
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRafflesListPage;
