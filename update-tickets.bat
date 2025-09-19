@echo off
echo Venezuelan Raffle Website - Update Ticket Availability
echo =================================================
echo.

echo This script will set your active raffle to have 500 total tickets with 500 available.
echo It will also set the ticket price to 320 Bs. each.
echo.
echo Press any key to continue or CTRL+C to cancel...
pause > nul

cd backend
node src\utils\updateTickets.js

echo.
echo If successful, you should now be able to purchase tickets on the website.
echo Please refresh your browser and try again.
echo.

pause
