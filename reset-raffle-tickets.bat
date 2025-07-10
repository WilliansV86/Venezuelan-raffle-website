@echo off
echo Venezuelan Raffle Website - COMPLETE RAFFLE TICKET RESET
echo =======================================================
echo.

echo WARNING: This will COMPLETELY RESET the ticket system for all active raffles.
echo All existing tickets will be deleted and the system will be reset to 9999 tickets.
echo.
echo Press any key to continue or CTRL+C to cancel...
pause > nul

cd backend
node src\utils\resetRaffleTickets.js

echo.
echo Reset completed! Please follow these steps:
echo 1. Kill all existing node.exe processes
echo 2. Start the CORS-enabled server with start-cors-enabled-server.bat
echo 3. Start the frontend with npm start
echo 4. Refresh your browser
echo.

pause
