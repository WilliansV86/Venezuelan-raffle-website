@echo off
echo ===================================================
echo STARTING VENEZUELAN RAFFLE WEBSITE WITH SEPARATE SERVERS
echo ===================================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /F /IM node.exe > nul 2>&1
timeout /t 2 > nul

echo 2. Creating environment file...
cd %~dp0backend
node create-env.js
timeout /t 1 > nul

echo 3. Starting main server on port 5100...
start cmd /k "cd %~dp0backend && node main-server-fixed.js"
timeout /t 5 > nul

echo 4. Testing main server connection...
curl http://localhost:5100/ping
if %errorlevel% neq 0 (
  echo ERROR: Main server not responding! Check port conflicts.
  pause
  exit /b 1
)
echo.

echo 5. Creating test raffle data...
curl -s http://localhost:5100/api/create-test-raffle > nul

echo 6. Starting admin server on port 5200...
start cmd /k "cd %~dp0backend && node admin-server.js"
timeout /t 2 > nul

echo 7. Starting React frontend...
cd %~dp0frontend
echo REACT_APP_API_URL=http://localhost:5100/api> .env.local
start cmd /k "cd %~dp0frontend && npm start"

echo.
echo ===================================================
echo SYSTEM READY - SEPARATE SERVERS
echo.
echo Main server:     http://localhost:5100
echo Admin server:    http://localhost:5200
echo Frontend:        http://localhost:3000
echo Admin dashboard: http://localhost:3000/admin/payments
echo                  (Login with: test-admin-key-123)
echo.
echo IMPORTANT: Your MongoDB Atlas connection is working!
echo Both servers share the same MongoDB database, so
echo tickets purchased on the main server will appear
echo in the admin panel.
echo.
echo ===================================================
