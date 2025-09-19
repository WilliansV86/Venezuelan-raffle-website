@echo off
echo ===================================================
echo STARTING VENEZUELAN RAFFLE WEBSITE - STANDALONE VERSION
echo ===================================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /F /IM node.exe > nul 2>&1
timeout /t 2 > nul

echo 2. Starting standalone server (handles both API and admin)...
start cmd /k "cd %~dp0backend && node standalone-server.js"
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
start cmd /k "cd %~dp0frontend && npm start"

echo.
echo ===================================================
echo STANDALONE SYSTEM READY
echo.
echo Server:          http://localhost:5100 
echo Frontend:        http://localhost:3000
echo Admin dashboard: http://localhost:3000/admin/payments
echo                  (Login with: test-admin-key-123)
echo.
echo IMPORTANT NOTES:
echo 1. This standalone version uses in-memory data storage
echo    and doesn't require MongoDB connection.
echo 2. You can purchase tickets on the main site.
echo 3. All transactions will appear in the admin panel.
echo 4. The admin panel can approve transactions.
echo 5. Email notifications are simulated in the console.
echo.
echo ===================================================
