@echo off
echo ===============================================
echo Venezuelan Raffle Website - Ultra Minimal Server
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo Setting environment variables...
setlocal
set PORT=5001
set NODE_ENV=production
set MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority

echo.
echo Starting ultra-minimal server with embedded routes and models...
echo.

cd backend
node ultra-minimal.js

pause
