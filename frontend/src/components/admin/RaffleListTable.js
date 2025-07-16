import React from 'react';
import { FaArrowUp, FaArrowDown, FaEdit, FaTrash, FaCheckCircle, FaPlay } from 'react-icons/fa';

const RaffleListTable = ({ raffles, onPromote, onDemote, onEdit, onDelete, isSubmitting }) => {

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

  const ProgressBar = ({ sold, total }) => {
    const percentage = total > 0 ? (sold / total) * 100 : 0;
    return (
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg h-full">
      <h3 className="text-xl font-bold text-white mb-4">Gestionar Rifas Existentes</h3>
      <div>
        {/* Header for larger screens */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-bold text-gray-400 uppercase">
          <div className="col-span-3">Nombre</div>
          <div className="col-span-2">Precios</div>
          <div className="col-span-2">Estado</div>
          <div className="col-span-2">Progreso</div>
          <div className="col-span-1">Vendidos</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* Raffle list */}
        <div className="space-y-2">
          {raffles.map((raffle) => (
            <div key={raffle._id} className="bg-gray-900/60 rounded-lg p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-gray-800/80 transition-colors duration-200">
              
              {/* Column 1: Name */}
              <div className="md:col-span-3 font-medium text-white">
                <span className="md:hidden font-bold text-gray-400">Nombre: </span>
                {raffle.name || raffle.title}
                <div className="text-xs text-gray-500 truncate">{raffle._id}</div>
              </div>
              
              {/* Column 2: Prices */}
              <div className="md:col-span-2">
                <div className="text-sm text-gray-300">USD: ${raffle.ticketPrice || raffle.price}</div>
                <div className="text-sm text-gray-300">Bs: {raffle.priceBS || raffle.ticketPriceBs || 'N/A'}</div>
              </div>
              
              {/* Column 3: Status */}
              <div className="md:col-span-2">
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
                </div>
              </div>

              {/* Column 4: Progress */}
              <div className="md:col-span-2">
                <ProgressBar sold={raffle.soldTickets || 0} total={raffle.maxTickets || raffle.totalTickets} />
                <div className="text-xs text-gray-400 mt-1 text-center">
                  {Math.round(((raffle.soldTickets || 0) / (raffle.maxTickets || raffle.totalTickets || 1)) * 100)}%
                </div>
              </div>

              {/* Column 5: Sold/Total */}
              <div className="md:col-span-1 text-sm text-gray-300">
                <span className="md:hidden font-bold text-gray-400">Vendidos: </span>
                {raffle.soldTickets || 0} / {raffle.maxTickets || raffle.totalTickets}
              </div>

              {/* Column 6: Actions */}
              <div className="md:col-span-2 flex justify-end items-center space-x-3">
                <button onClick={() => onEdit(raffle._id)} disabled={isSubmitting} className="text-blue-400 hover:text-blue-300 disabled:text-gray-600"><FaEdit title="Editar" /></button>
                <button onClick={() => onDelete(raffle._id)} disabled={isSubmitting} className="text-red-400 hover:text-red-300 disabled:text-gray-600"><FaTrash title="Eliminar" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RaffleListTable;
