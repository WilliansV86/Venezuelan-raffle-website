@echo off
echo ===============================================
echo VENEZUELAN RAFFLE WEBSITE - VERSION3 SETUP
echo ===============================================
echo.

REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

echo Setting up backend...
cd backend

REM Create .env file with proper configuration
echo Creating backend .env file...
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority> .env
echo PORT=5100>> .env
echo ADMIN_KEY=admin123>> .env
echo NODE_ENV=development>> .env

echo Installing backend dependencies...
call npm install

echo Starting backend server...
start cmd /k "node server.js"

REM Wait for backend to start
timeout /t 5 /nobreak

echo.
echo ===============================================
echo Backend should be running on port 5100
echo Testing backend connection...
curl http://localhost:5100/api/ping
echo.
echo ===============================================

REM Create setupProxy.js for frontend if it doesn't exist
cd ..\frontend\src
if not exist setupProxy.js (
  echo Creating frontend proxy configuration...
  echo // Proxy configuration to connect to backend server > setupProxy.js
  echo const { createProxyMiddleware } = require('http-proxy-middleware'); >> setupProxy.js
  echo. >> setupProxy.js
  echo module.exports = function(app) { >> setupProxy.js
  echo   app.use( >> setupProxy.js
  echo     '/api', >> setupProxy.js
  echo     createProxyMiddleware({ >> setupProxy.js
  echo       target: 'http://localhost:5100', >> setupProxy.js
  echo       changeOrigin: true, >> setupProxy.js
  echo     }) >> setupProxy.js
  echo   ); >> setupProxy.js
  echo }; >> setupProxy.js
  echo Frontend proxy setup complete.
) else (
  echo Frontend proxy already configured.
)

echo Installing frontend dependencies...
cd ..
call npm install

echo.
echo ===============================================
echo Starting frontend...
echo ===============================================
echo.

start cmd /k "npm start"

echo.
echo ===============================================
echo SETUP COMPLETE!
echo.
echo If everything worked properly:
echo - Backend is running on http://localhost:5100
echo - Frontend is running on http://localhost:3000
echo.
echo You can test the backend with: curl http://localhost:5100/api/ping
echo Open your browser to: http://localhost:3000
echo ===============================================

cd ..
