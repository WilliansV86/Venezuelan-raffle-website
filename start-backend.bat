@echo off
echo ===============================================
echo VENEZUELAN RAFFLE WEBSITE - BACKEND SETUP
echo ===============================================
echo.

REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

cd %~dp0\backend

REM Create .env file with proper configuration
echo Creating backend .env file...
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority> .env
echo PORT=5100>> .env
echo ADMIN_KEY=admin123>> .env
echo NODE_ENV=development>> .env

echo Installing backend dependencies...
call npm install

echo.
echo ===============================================
echo Starting backend server on port 5100...
echo Press CTRL+C to stop the server
echo ===============================================
echo.

node server.js
