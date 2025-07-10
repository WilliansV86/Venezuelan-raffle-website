@echo off
echo ===============================================
echo Venezuelan Raffle Website - FINAL Production Server
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo Starting FINAL production server with robust MongoDB connection...
echo.

echo IMPORTANT: Your MongoDB connection should be stable now
echo Your MongoDB URI is: mongodb+srv://WilliansV86:[PASSWORD]@cluster0.adlajpr.mongodb.net/raffle
echo.

cd backend
node final-production-server.js

pause
