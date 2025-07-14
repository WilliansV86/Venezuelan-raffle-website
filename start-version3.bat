@echo off
echo ===============================================
echo VENEZUELAN RAFFLE WEBSITE - VERSION3 STARTUP
echo ===============================================

:: Create backend .env file
echo Creating backend .env file...
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority> backend\.env
echo PORT=5100>> backend\.env
echo ADMIN_KEY=admin123>> backend\.env
echo NODE_ENV=development>> backend\.env

:: Create frontend proxy setup
echo Creating frontend proxy configuration...
(
echo const { createProxyMiddleware } = require('http-proxy-middleware'^);
echo.
echo module.exports = function(app^) {
echo   app.use(
echo     '/api',
echo     createProxyMiddleware({
echo       target: 'http://localhost:5100',
echo       changeOrigin: true,
echo     }^)
echo   ^);
echo };
) > frontend\src\setupProxy.js

:: Start the backend server
echo.
echo ===============================================
echo Starting backend server...
echo ===============================================
start cmd /k "cd backend && npm install && node server.js"

:: Give the backend time to start
timeout /t 5 /nobreak

:: Start the frontend server
echo.
echo ===============================================
echo Starting frontend server...
echo ===============================================
start cmd /k "cd frontend && npm install && npm start"

echo.
echo ===============================================
echo VERSION3 SETUP COMPLETE
echo ===============================================
echo Backend running on: http://localhost:5100
echo Frontend running on: http://localhost:3000
echo ===============================================
