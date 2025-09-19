import React, { useState, useMemo } from 'react';

const TicketSelector = ({ totalTickets, availableTickets = [], selectedTickets = [], onSelectTicket }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 100;
  const totalPages = Math.ceil(totalTickets / ticketsPerPage);
  
  // Generate array of all tickets for display
  const generateTicketsArray = () => {
    const start = (currentPage - 1) * ticketsPerPage + 1;
    const end = Math.min(currentPage * ticketsPerPage, totalTickets);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Use a Set for efficient lookup of available tickets
  const availableTicketsSet = useMemo(() => new Set(availableTickets), [availableTickets]);

  const isTicketAvailable = (number) => availableTicketsSet.has(number);
  const isTicketSelected = (number) => selectedTickets.includes(number);
  
  const handleTicketClick = (number) => {
    if (!isTicketAvailable(number)) return; // Can't select unavailable tickets
    onSelectTicket(number);
  };
  
  const getTicketClassName = (number) => {
    let className = "w-10 h-10 flex items-center justify-center rounded-md m-1 transition-all duration-200 ";
    
    if (!isTicketAvailable(number)) {
      className += "bg-gray-300 text-gray-500 cursor-not-allowed"; // Style for unavailable/sold tickets
    } else if (isTicketSelected(number)) {
      className += "bg-vnz-yellow text-dark font-bold transform scale-110 shadow-md";
    } else {
      className += "bg-white border border-gray-300 hover:bg-vnz-blue hover:text-white cursor-pointer";
    }
    
    return className;
  };
  
  // Determine if the current page has any selectable (available) tickets
  // This is a simple check, could be more sophisticated by checking actual numbers on page
  const noAvailableTicketsOnPage = useMemo(() => {
      if (!availableTickets || availableTickets.length === 0) return true;
      // A more accurate check would be to see if any ticket number in the current page range is in availableTicketsSet
      // For now, if availableTickets is empty overall, it implies no tickets are available.
      // This component primarily renders based on totalTickets for pagination,
      // individual ticket availability is for styling/interaction.
      return false; // Assuming some tickets might be available if array is not empty
  }, [availableTickets]);


  return (
    <div>
      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="font-semibold">Leyenda:</span>
            <div className="flex items-center mt-2">
              <div className="w-6 h-6 bg-white border border-gray-300 rounded mr-2"></div>
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="w-6 h-6 bg-gray-300 rounded mr-2"></div>
              <span className="text-sm">No Disponible / Vendido</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="w-6 h-6 bg-vnz-yellow rounded mr-2"></div>
              <span className="text-sm">Seleccionado por ti</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-semibold">Filtro</p>
            <select 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              onChange={(e) => setCurrentPage(parseInt(e.target.value))}
              value={currentPage}
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {(i * ticketsPerPage) + 1} - {Math.min((i + 1) * ticketsPerPage, totalTickets)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center max-h-64 overflow-y-auto p-2">
          {generateTicketsArray().map(number => (
            <button
              key={number}
              className={getTicketClassName(number)}
              onClick={() => handleTicketClick(number)}
              disabled={!isTicketAvailable(number) && !isTicketSelected(number)} // Disable if not available, unless it's already selected by the user (allowing unselection)
              // Actually, if it's selected, it must have been available. So just !isTicketAvailable is fine for disabling purchase.
              // The handleTicketClick will prevent selection if not available.
              // For display and interaction, if it's selected, it should be clickable to deselect.
              // If not available and not selected, it's disabled.
              // If available and not selected, it's clickable to select.
              // If available AND selected, it's clickable to deselect.
              // So, disable only if !isTicketAvailable(number) AND !isTicketSelected(number)
              // However, getTicketClassName already styles it as "not-allowed" if !isTicketAvailable.
              // The simple disable should be:
              disabled={!isTicketAvailable(number)}
            >
              {number}
            </button>
          ))}
        </div>
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          
          <span>
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketSelector;
