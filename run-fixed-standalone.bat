@echo off
echo ===================================================
echo STARTING VENEZUELAN RAFFLE WEBSITE - FIXED STANDALONE
echo ===================================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /F /IM node.exe > nul 2>&1
timeout /t 2 > nul

echo 2. Starting fixed standalone server...
start cmd /k "cd %~dp0backend && node fixed-standalone-server.js"
timeout /t 3 > nul

echo 3. Testing server connection...
curl http://localhost:5100/ping
if %errorlevel% neq 0 (
  echo ERROR: Server not responding! Check port conflicts.
  pause
  exit /b 1
)
echo.
echo Server is running successfully!

echo 4. Starting React frontend...
cd %~dp0frontend
echo REACT_APP_API_URL=http://localhost:5100/api> .env.local
start cmd /k "cd %~dp0frontend && SET PORT=3000 && npm start"

echo.
echo ===================================================
echo FIXED STANDALONE SYSTEM READY
echo.
echo Server:          http://localhost:5100 
echo Frontend:        http://localhost:3000
echo Admin dashboard: http://localhost:3000/admin/payments
echo                  (Login with: test-admin-key-123)
echo.
echo IMPORTANT NOTES:
echo 1. This fixed standalone version has the correct data format
echo    for the frontend to display raffles properly.
echo 2. All transactions and tickets are stored in memory.
echo 3. The admin panel works with admin key: test-admin-key-123
echo.
echo ===================================================
