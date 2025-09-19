@echo off
echo Venezuelan Raffle Website - Setup Four-Digit Ticket System
echo =======================================================
echo.

echo This script will set up the raffle with tickets numbered 0001-9999
echo with proper tracking for sold tickets and percentage available.
echo.
echo Press any key to continue or CTRL+C to cancel...
pause > nul

cd backend
node src\utils\setupFourDigitTickets.js

echo.
echo If successful, your raffle is now configured with tickets from 0001 to 9999.
echo The system will track sold tickets and prevent reassignment.
echo The percentage available will update automatically based on sold tickets.
echo.
echo Please refresh your browser and try the purchase flow again.
echo.

pause
