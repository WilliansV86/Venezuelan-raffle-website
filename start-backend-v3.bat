@echo off
echo ===============================================
echo VENEZUELAN RAFFLE WEBSITE - BACKEND SETUP
echo ===============================================

:: Kill any existing node processes to avoid port conflicts
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

:: Create backend .env file
echo Creating backend .env file...
(
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority
echo PORT=5100
echo ADMIN_KEY=admin123
echo NODE_ENV=development
) > backend\.env

:: Navigate to backend directory and install dependencies
cd backend
echo Installing backend dependencies...
call npm install

echo ===============================================
echo Starting backend server on port 5100...
echo Press CTRL+C to stop the server
echo ===============================================

:: Start the backend server
node server.js
