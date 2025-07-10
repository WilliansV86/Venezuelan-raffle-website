@echo off
echo Venezuelan Raffle Website - Ticket Availability Check
echo =================================================
echo.

echo Checking ticket availability in active raffles...
echo This will help diagnose why you're seeing "0 boletos disponibles" (0 tickets available)
echo.

cd backend
node src/utils/checkTickets.js

echo.
echo If you see a warning about "Available tickets is zero", this explains the error message.
echo To fix this, you'll need to update your raffle data in MongoDB to set a proper ticket count.
echo.

pause
