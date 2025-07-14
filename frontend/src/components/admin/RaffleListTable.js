import React from 'react';
import { FaArrowUp, FaArrowDown, FaEdit, FaTrash } from 'react-icons/fa';

const RaffleListTable = ({ raffles, onPromote, onDemote, onEdit, onDelete, isSubmitting }) => {

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'active':
        return <span className={`${baseClasses} bg-blue-500/20 text-blue-300`}>Activo</span>;
      case 'completed':
        return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>Completado</span>;
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
          <div className="col-span-2">Estado</div>
          <div className="col-span-3">Progreso</div>
          <div className="col-span-2">Vendidos</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* Raffle list */}
        <div className="space-y-2">
          {raffles.map((raffle) => (
            <div key={raffle._id} className="bg-gray-900/60 rounded-lg p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-gray-800/80 transition-colors duration-200">
              
              {/* Column 1: Name */}
              <div className="md:col-span-3 font-medium text-white">
                <span className="md:hidden font-bold text-gray-400">Nombre: </span>
                {raffle.name}
              </div>
              
              {/* Column 2: Status */}
              <div className="md:col-span-2">
                {getStatusBadge(raffle.status)}
              </div>

              {/* Column 3: Progress */}
              <div className="md:col-span-3">
                <ProgressBar sold={raffle.soldTickets || 0} total={raffle.maxTickets} />
              </div>

              {/* Column 4: Sold/Total */}
              <div className="md:col-span-2 text-sm text-gray-300">
                <span className="md:hidden font-bold text-gray-400">Vendidos: </span>
                {raffle.soldTickets || 0} / {raffle.maxTickets}
              </div>

              {/* Column 5: Actions */}
              <div className="md:col-span-2 flex justify-end items-center space-x-3">
                {raffle.status !== 'active' && (
                  <button onClick={() => onPromote(raffle._id)} disabled={isSubmitting} className="text-green-400 hover:text-green-300 disabled:text-gray-600"><FaArrowUp title="Promover a Activo" /></button>
                )}
                {raffle.status === 'active' && (
                  <button onClick={() => onDemote(raffle._id)} disabled={isSubmitting} className="text-yellow-400 hover:text-yellow-300 disabled:text-gray-600"><FaArrowDown title="Mover a Completado" /></button>
                )}
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
