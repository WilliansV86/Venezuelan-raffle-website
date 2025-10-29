import React, { useState, useEffect } from 'react';
import { updateRaffleDisplayProgress } from '../../services/raffleProgressService';

const RaffleProgressManager = ({ raffle, onUpdate }) => {
  // State
  const [mode, setMode] = useState(raffle.displayProgressMode || 'automatic');
  const [value, setValue] = useState(raffle.displayProgressValue || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Calculate the actual progress percentage
  const actualProgress = Math.round(((raffle.soldTickets || raffle.ticketsSold || 0) / (raffle.maxTickets || raffle.totalTickets || 100)) * 100);

  // Handle mode change
  const handleModeChange = (newMode) => {
    setMode(newMode);
    // Reset success/error messages
    setSuccess(false);
    setError(null);
  };

  // Handle value change
  const handleValueChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setValue(newValue);
    // Reset success/error messages
    setSuccess(false);
    setError(null);
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    console.log('Saving progress settings:');
    console.log('Raffle ID:', raffle._id);
    console.log('Mode:', mode);
    console.log('Value:', mode === 'manual' ? value : null);
    
    try {
      console.log('LocalStorage contents:', localStorage);
      
      // Get adminInfo directly from localStorage to troubleshoot
      const adminInfoStr = localStorage.getItem('adminInfo');
      console.log('adminInfo from localStorage:', adminInfoStr);
      
      const response = await updateRaffleDisplayProgress(
        raffle._id, 
        mode, 
        mode === 'manual' ? value : null
      );
      
      console.log('Server response:', response);
      
      setSuccess(true);
      if (onUpdate) {
        onUpdate({
          ...raffle,
          displayProgressMode: mode,
          displayProgressValue: mode === 'manual' ? value : null
        });
      }
    } catch (err) {
      console.error('Error updating raffle progress:', err);
      
      // Detailed error logging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
        setError(`Error ${err.response.status}: ${err.response.data?.message || 'Error updating progress display'}`);
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('Request was made but no response was received from the server');
      } else {
        console.error('Error message:', err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-white">Gestionar Porcentaje de Progreso</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-cyan-300 mb-2">Modo de Visualización</label>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              id="automatic"
              name="progress-mode"
              type="radio"
              value="automatic"
              checked={mode === 'automatic'}
              onChange={() => handleModeChange('automatic')}
              className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="automatic" className="ml-2 block text-sm text-gray-300">
              Automático (basado en ventas reales)
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="manual"
              name="progress-mode"
              type="radio"
              value="manual"
              checked={mode === 'manual'}
              onChange={() => handleModeChange('manual')}
              className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="manual" className="ml-2 block text-sm text-gray-300">
              Control Manual
            </label>
          </div>
        </div>
      </div>
      
      {mode === 'manual' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-cyan-300 mb-2">
            Porcentaje a Mostrar: <span className="text-white font-bold">{value}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={handleValueChange}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          <div className="mt-2">
            <label className="block text-sm font-medium text-cyan-300 mb-1">Ajuste Fino:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={value}
              onChange={handleValueChange}
              className="border-gray-600 bg-gray-800 text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm w-24"
            />
            <span className="ml-1 text-sm text-cyan-400">%</span>
          </div>
        </div>
      )}
      
      {/* Progress Bar Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-cyan-300 mb-2">
          Vista Previa:
        </label>
        <div className="w-full bg-gray-700 rounded-full h-3 p-0.5">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full relative" 
            style={{ width: `${mode === 'manual' ? value : actualProgress}%` }}>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-full"></div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {mode === 'manual' ? value : actualProgress}% 
          {mode === 'manual' && actualProgress !== value && (
            <span className="ml-2 text-gray-500">
              (Real: {actualProgress}% - {raffle.soldTickets || raffle.ticketsSold || 0}/{raffle.maxTickets || raffle.totalTickets || 100} tickets vendidos)
            </span>
          )}
        </p>
      </div>
      
      {/* Save Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 transform hover:scale-105 ${
            loading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-blue-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-lg'
          }`}
        >
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
      
      {/* Success/Error Messages */}
      {success && (
        <div className="mt-4 flex items-center p-3 rounded-lg bg-green-900/40 border border-green-700 text-sm text-green-300">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Configuración de progreso actualizada con éxito.
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center p-3 rounded-lg bg-red-900/40 border border-red-700 text-sm text-red-300">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default RaffleProgressManager;
