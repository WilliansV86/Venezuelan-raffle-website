@echo off
echo Venezuelan Raffle Website - Check Raffle Status
echo ==============================================
echo.
echo This script will check for active and completed raffles in the database.
echo.
cd backend
node src/utils/checkRaffleStatus.js
pause
