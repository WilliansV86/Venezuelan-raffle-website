@echo off
echo ===================================================
echo COMPLETE FIX - VENEZUELAN RAFFLE WEBSITE
echo ===================================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /F /IM node.exe > nul 2>&1
timeout /t 2 > nul

echo 2. Creating proper backend .env file...
cd /d "%~dp0backend"
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority > .env
echo PORT=5100 >> .env
echo ADMIN_KEY=test-admin-key-123 >> .env
echo NODE_ENV=development >> .env

echo 3. Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
  echo ERROR: Failed to install backend dependencies
  pause
  exit /b 1
)

echo 4. Starting backend server...
start cmd /k "cd /d "%~dp0backend" && node quick-fix-server.js"
timeout /t 5 > nul

echo 5. Testing backend connection...
curl http://localhost:5100/api/ping
if %errorlevel% neq 0 (
  echo WARNING: Backend server not responding. Please check for errors.
  pause
)

echo 6. Setting up frontend to connect to backend...
cd /d "%~dp0frontend"
echo REACT_APP_API_URL=http://localhost:5100/api> .env.local

echo 7. Creating setupProxy.js to handle connections...
mkdir -p src
echo // Proxy configuration to connect to backend server > src\setupProxy.js
echo const { createProxyMiddleware } = require('http-proxy-middleware'); >> src\setupProxy.js
echo. >> src\setupProxy.js
echo module.exports = function(app) { >> src\setupProxy.js
echo   app.use( >> src\setupProxy.js
echo     '/api', >> src\setupProxy.js
echo     createProxyMiddleware({ >> src\setupProxy.js
echo       target: 'http://localhost:5100', >> src\setupProxy.js
echo       changeOrigin: true, >> src\setupProxy.js
echo     }) >> src\setupProxy.js
echo   ); >> src\setupProxy.js
echo }; >> src\setupProxy.js

echo 8. Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
  echo ERROR: Failed to install frontend dependencies
  pause
  exit /b 1
)

echo 9. Installing http-proxy-middleware...
call npm install --save http-proxy-middleware
if %errorlevel% neq 0 (
  echo ERROR: Failed to install http-proxy-middleware
  pause
  exit /b 1
)

echo 10. Starting frontend server...
start cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ===================================================
echo SETUP COMPLETE!
echo.
echo Backend server: http://localhost:5100
echo Frontend: http://localhost:3000
echo.
echo If the frontend starts on port 3001 instead of 3000,
echo the proxy should still handle API connections correctly.
echo ===================================================
echo.
pause
