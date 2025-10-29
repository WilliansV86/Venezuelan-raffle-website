// Add this button to the actions column in AdminRafflesListPage.js
// Look for the actions section (around line 193) and add this button before or after the Edit button

<button 
  onClick={() => navigate(`/admin/raffles/progress/${raffle._id}`)} 
  className="block w-full text-blue-600 hover:text-blue-900 border border-blue-600 rounded px-2 py-1 mt-2">
  Gestionar Progreso
</button>
