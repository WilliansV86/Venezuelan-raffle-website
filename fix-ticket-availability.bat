@echo off
echo Venezuelan Raffle Website - FIX TICKET AVAILABILITY
echo =======================================================
echo.

echo This script will fix the ticket availability issues by ensuring:
echo 1. Available tickets is stored as a NUMBER (not an array)
echo 2. Ticket format and range are properly configured
echo 3. All ticket-related fields are consistent
echo.
echo Press any key to continue or CTRL+C to cancel...
pause > nul

cd backend
node src\utils\fixTicketAvailability.js

echo.
echo Fix completed! Please follow these steps:
echo 1. Kill all existing node.exe processes
echo 2. Start the CORS-enabled server with start-cors-enabled-server.bat
echo 3. Start the frontend with npm start
echo 4. Refresh your browser
echo.

pause
