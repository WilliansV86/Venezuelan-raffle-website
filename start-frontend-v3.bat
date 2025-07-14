@echo off
echo ===============================================
echo VENEZUELAN RAFFLE WEBSITE - FRONTEND SETUP
echo ===============================================

:: Create frontend proxy configuration
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

:: Navigate to frontend directory and install dependencies
cd frontend
echo Installing frontend dependencies...
call npm install

echo ===============================================
echo Starting frontend server on port 3000...
echo Press CTRL+C to stop the server
echo ===============================================
echo.
echo IMPORTANT: Make sure the backend server is running!
echo            Check http://localhost:5100
echo ===============================================

:: Start the frontend development server
npm start
