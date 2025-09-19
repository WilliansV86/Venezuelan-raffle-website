@echo off
echo ===================================================
echo VENEZUELAN RAFFLE WEBSITE - QUICK FIX (PORT 3001)
echo ===================================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo 2. Verifying backend .env file...
cd %~dp0backend
if not exist .env (
    echo Creating backend .env file...
    echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority > .env
    echo PORT=5100 >> .env
    echo ADMIN_KEY=test-admin-key-123 >> .env
    echo NODE_ENV=development >> .env
)

echo 3. Starting backend server (PORT 5100)...
start cmd /c "cd %~dp0backend && node server.js"

echo 4. Waiting for backend to initialize (10 seconds)...
timeout /t 10 >nul

echo 5. Creating frontend proxy file for port 3001...
cd %~dp0frontend\src
echo const { createProxyMiddleware } = require('http-proxy-middleware'); > setupProxy.js
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

echo 6. Starting frontend on port 3001...
start cmd /c "cd %~dp0frontend && set PORT=3001 && npm start"

echo 7. Waiting for frontend to initialize (8 seconds)...
timeout /t 8 >nul

echo 8. Opening website in browser...
start http://localhost:3001

echo.
echo ===================================================
echo WEBSITE STARTED ON PORT 3001!
echo.
echo Frontend: http://localhost:3001
echo Backend API: http://localhost:5100/api
echo.
echo If you still see connection errors, please:
echo 1. Make sure port 5100 is not blocked by firewall
echo 2. Check MongoDB Atlas connection is working
echo 3. Ensure you have active raffles in the database
echo ===================================================
pause
