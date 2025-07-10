@echo off
echo Venezuelan Raffle Website - Add Sample Raffles
echo ==============================================
echo.
echo This script will add sample raffles to your database for testing purposes.
echo It will create 2 active raffles and 2 completed raffles.
echo.
cd backend
node src/utils/addSampleRaffles.js
pause
