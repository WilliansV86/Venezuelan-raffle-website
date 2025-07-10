@echo off
echo ===============================================
echo Installing Dependencies for Venezuelan Raffle Website
echo ===============================================
echo.

cd backend

echo Installing required packages...
call npm install express mongoose dotenv cors colors morgan winston express-rate-limit

echo.
echo Dependencies installed!
echo.
echo Now you can run: start-final-server.bat

pause
