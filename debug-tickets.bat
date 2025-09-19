@echo off
echo Venezuelan Raffle Website - Ticket Availability Debugger
echo ====================================================
echo.
echo This script will help diagnose ticket availability issues.
echo.

cd backend
node src\utils\debugTicketAvailability.js

echo.
echo Debug complete! If you need to make changes:
echo 1. Update the code based on debug findings
echo 2. Kill any node.exe processes (taskkill /f /im node.exe)
echo 3. Restart your servers
echo.

pause
