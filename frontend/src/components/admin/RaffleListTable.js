import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheckCircle, FaPlay, FaArchive, FaSync } from 'react-icons/fa';
import axios from 'axios';
import apiConfig from '../../config/apiConfig';


const RaffleListTable = ({ raffles, onPromote, onDemote, onSetToDraft, onEdit, onDelete, isSubmitting }) => {
  // State to store raffle stats
  const [raffleStats, setRaffleStats] = useState({});
  const [refreshingStats, setRefreshingStats] = useState(false);
  
  // Function to fetch stats for all raffles
  const fetchAllRaffleStats = async () => {
    setRefreshingStats(true);
    try {
      // Create a copy of the current stats to update
      const newStats = { ...raffleStats };
      
      // Fetch stats for each raffle in parallel
      await Promise.all(raffles.map(async (raffle) => {
        try {
          const response = await axios.get(`http://localhost:5100/api/raffles/${raffle._id}/stats`);
          const stats = response.data.data || response.data;
          
          // Store the stats with raffle ID as key
          newStats[raffle._id] = stats;
          console.log(`Updated stats for raffle ${raffle._id}:`, stats);
        } catch (error) {
          console.error(`Failed to fetch stats for raffle ${raffle._id}:`, error);
        }
      }));
      
      // Update the stats state
      setRaffleStats(newStats);
    } catch (error) {
      console.error('Error refreshing raffle stats:', error);
    } finally {
      setRefreshingStats(false);
    }
  };
  
  // Fetch stats on component mount and when raffles change
  // Define fetchRaffleStats separately from the useEffect to avoid dependency issues
  const fetchRaffleStats = async () => {
    setRefreshingStats(true);
    try {
      // Create a copy of the current stats to update
      const newStats = { ...raffleStats };
      
      // Fetch stats for each raffle in parallel
      await Promise.all(raffles.map(async (raffle) => {
        try {
          const response = await axios.get(`http://localhost:5100/api/raffles/${raffle._id}/stats`);
          const stats = response.data.data || response.data;
          
          // Store the stats with raffle ID as key
          newStats[raffle._id] = stats;
          console.log(`Updated stats for raffle ${raffle._id}:`, stats);
        } catch (error) {
          console.error(`Failed to fetch stats for raffle ${raffle._id}:`, error);
        }
      }));
      
      // Update the stats state
      setRaffleStats(newStats);
    } catch (error) {
      console.error('Error refreshing raffle stats:', error);
    } finally {
      setRefreshingStats(false);
    }
  };

  useEffect(() => {
    if (raffles.length > 0) {
      fetchRaffleStats();
      
      // Set up interval to refresh stats every 15 seconds
      const refreshInterval = setInterval(fetchRaffleStats, 15000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [raffles]);

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'active':
        return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>Activo</span>;
      case 'completed':
        return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>Completado</span>;
      case 'draft':
        return <span className={`${baseClasses} bg-gray-500/20 text-gray-300`}>Borrador</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}>{status}</span>;
    }
  };

  // Test cases for ProgressBar
  const testCases = [
    { sold: 0, total: 100, expectedColor: 'bg-green-500', label: 'Green: 0% sold' },
    { sold: 30, total: 100, expectedColor: 'bg-green-500', label: 'Green: 30% sold' }, 
    { sold: 50, total: 100, expectedColor: 'bg-yellow-500', label: 'Yellow: 50% sold' },
    { sold: 85, total: 100, expectedColor: 'bg-red-500', label: 'Red: 85% sold' },
  ];
  
  // Simplified ProgressBar with explicit colors
  const ProgressBar = ({ sold, total }) => {
    // Force test values to verify color display
    // Uncomment to test a specific scenario:
    // Test green (0% sold)
    // const actualSold = 0; const actualTotal = 100;
    
    // Test yellow (50% sold)
    // const actualSold = 50; const actualTotal = 100;
    
    // Test red (85% sold) 
    // const actualSold = 85; const actualTotal = 100;
    
    // Use actual values
    const actualSold = sold;
    const actualTotal = total;
    
    const percentage = actualTotal > 0 ? (actualSold / actualTotal) * 100 : 0;
    const remainingPercentage = 100 - percentage;
    
    // Debug output
    console.log(`Progress Bar - Sold: ${actualSold}, Total: ${actualTotal}, Percentage: ${percentage.toFixed(2)}%, Remaining: ${remainingPercentage.toFixed(2)}%`);
    
    // Determine the correct color
    let barColorHex = '#00FF00'; // Default green - using brighter green that displays correctly
    
    if (remainingPercentage < 20) {
      barColorHex = '#EF4444'; // Red
      console.log('Using RED color for progress bar');
    } else if (remainingPercentage < 60) {
      barColorHex = '#F59E0B'; // Yellow
      console.log('Using YELLOW color for progress bar');
    } else {
      console.log('Using GREEN color for progress bar');
    }
    
    // Manual color override for testing
    // Uncomment to force a specific color:
    // barColorHex = '#10B981'; // Force green
    // barColorHex = '#F59E0B'; // Force yellow
    // barColorHex = '#EF4444'; // Force red
    
    return (
      <div style={{ 
        width: '100%', 
        backgroundColor: '#374151', 
        borderRadius: '9999px', 
        height: '10px',
        marginBottom: '5px'
      }}>
        <div style={{ 
          width: `${percentage}%`, 
          backgroundColor: barColorHex,
          height: '10px',
          borderRadius: '9999px',
          transition: 'width 0.5s ease-in-out'
        }}></div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Gestionar Rifas Existentes</h3>
        
        <button 
          onClick={fetchAllRaffleStats}
          disabled={refreshingStats}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-md flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
        >
          <FaSync className={refreshingStats ? 'animate-spin' : ''} />
          <span>{refreshingStats ? 'Actualizando...' : 'Actualizar Estadísticas'}</span>
        </button>
      </div>

      <div>
        {/* Raffle list */}
        <div className="space-y-2">
          {raffles.map((raffle) => (
            <div key={raffle._id} className="bg-gray-900/60 rounded-lg p-4 space-y-3 hover:bg-gray-800/80 transition-colors duration-200">
              
              {/* Individual raffle column titles */}
              <div className="hidden md:grid grid-cols-12 gap-10 mb-3 text-sm font-bold text-gray-400 uppercase border-b border-gray-700 pb-1">
                <div className="col-span-5 pl-4">Nombre</div>
                <div className="col-span-2 text-center">Precios</div>
                <div className="col-span-2 text-center">Estado</div>
                <div className="col-span-3 text-right pr-4">Acciones</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                {/* Column 1: Name with Image */}
                <div className="md:col-span-5 font-medium text-white text-lg flex items-center gap-4 pl-4">
                  {/* Image preview */}
                  <div className="hidden md:block">
                    {raffle.image ? (
                      <img 
                        src={raffle.image} 
                        alt={raffle.name || raffle.title} 
                        className="w-20 h-20 object-cover rounded-md" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x100?text=Sin+Imagen';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-400">Sin imagen</div>
                    )}
                  </div>
                  <div>
                    <span className="md:hidden font-bold text-gray-400">Nombre: </span>
                    {raffle.name || raffle.title}
                    <div className="text-xs text-gray-500 truncate">{raffle._id}</div>
                  </div>
                </div>
              
                {/* Column 2: Prices */}
                <div className="md:col-span-2 text-center">
                  <div className="text-sm text-gray-300">USD: ${raffle.ticketPrice || raffle.price}</div>
                  <div className="text-sm text-gray-300">Bs: {raffle.priceBS || raffle.ticketPriceBs || 'N/A'}</div>
                </div>
                
                {/* Column 3: Status */}
                <div className="md:col-span-2 text-center">
                  {getStatusBadge(raffle.status)}
                  <div className="mt-1 space-y-1">
                    <button 
                      onClick={() => onPromote(raffle._id)} 
                      disabled={isSubmitting || raffle.status === 'active'} 
                      className="px-2 py-0.5 text-xs flex items-center justify-center space-x-1 w-full rounded bg-green-500/20 hover:bg-green-500/40 text-green-300 disabled:opacity-30 disabled:cursor-not-allowed">
                      <FaPlay size={8} /><span>Activar</span>
                    </button>
                    <button 
                      onClick={() => onDemote(raffle._id)} 
                      disabled={isSubmitting || raffle.status === 'completed'} 
                      className="px-2 py-0.5 text-xs flex items-center justify-center space-x-1 w-full rounded bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed">
                      <FaCheckCircle size={8} /><span>Completar</span>
                    </button>
                    <button 
                      onClick={() => onSetToDraft(raffle._id)} 
                      disabled={isSubmitting || raffle.status === 'draft'} 
                      className="px-2 py-0.5 text-xs flex items-center justify-center space-x-1 w-full rounded bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed">
                      <FaArchive size={8} /><span>Borrador</span>
                    </button>
                  </div>
                </div>

                {/* Column 4: Actions */}
                <div className="md:col-span-3 flex justify-end items-center space-x-3">
                  <button onClick={() => onEdit(raffle._id)} disabled={isSubmitting} className="text-blue-400 hover:text-blue-300 disabled:text-gray-600"><FaEdit title="Editar" /></button>
                  <button onClick={() => onDelete(raffle._id)} disabled={isSubmitting} className="text-red-400 hover:text-red-300 disabled:text-gray-600"><FaTrash title="Eliminar" /></button>
                </div>
              </div>
              
              {/* Text-based status indicator at bottom */}
              <div className="w-full mt-4 text-center">
                {(() => {
                  // Get raffle stats from our real-time stats state if available
                  const currentRaffleStats = raffleStats[raffle._id] || {};
                  const sold = currentRaffleStats.soldTickets || raffle.soldTickets || 0;
                  const total = currentRaffleStats.totalTickets || raffle.maxTickets || raffle.totalTickets || 1;
                  const percentage = total > 0 ? (sold / total) * 100 : 0;
                  const remainingPercentage = 100 - percentage;
                  
                  // Determine text and color based on remaining percentage
                  let statusText = "";
                  let statusColor = "";
                  
                  if (remainingPercentage >= 60) {
                    statusText = "DISPONIBLES";
                    statusColor = "#00FF00";
                  } else if (remainingPercentage >= 20) {
                    statusText = "LIMITADOS";
                    statusColor = "#F59E0B";
                  } else {
                    statusText = "AGOTADOS";
                    statusColor = "#EF4444";
                  }
                  
                  return (
                    <div className="flex flex-col items-center">
                      <div style={{
                        padding: '5px',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: statusColor,
                        borderRadius: '4px',
                        color: statusColor,
                        fontWeight: 'bold',
                        marginBottom: '5px',
                        minWidth: '150px'
                      }}>
                        {statusText}
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.round(percentage)}% Vendido ({sold}/{total})
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RaffleListTable;
