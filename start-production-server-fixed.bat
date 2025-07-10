@echo off
echo ===============================================
echo Venezuelan Raffle Website - Production Server
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo Starting production server...
echo.

echo IMPORTANT: Make sure your MongoDB IP whitelist is configured
echo Your MongoDB URI is: %MONGO_URI:~0,30%[PASSWORD]%MONGO_URI:~-40%
echo.

cd backend
npm start -- production-server.js

pause
