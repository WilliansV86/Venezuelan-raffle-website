@echo off
echo ===================================================
echo STARTING COMPLETE VENEZUELAN RAFFLE WEBSITE SYSTEM
echo ===================================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /F /IM node.exe > nul 2>&1
timeout /t 2 > nul

echo 2. Starting enhanced main server with ticket purchase support...
start cmd /k "cd %~dp0backend && node simple-server.js"
timeout /t 3 > nul

echo 3. Testing main server connection...
curl http://localhost:5100/ping
if %errorlevel% neq 0 (
  echo ERROR: Main server not responding! Check port conflicts.
  pause
  exit /b 1
)
echo.

echo 4. Starting admin server...
start cmd /k "cd %~dp0backend && node admin-server.js"
timeout /t 2 > nul

echo 5. Starting React frontend...
start cmd /k "cd %~dp0frontend && npm start"

echo.
echo ===================================================
echo COMPLETE SYSTEM READY!
echo.
echo 1. Main website:     http://localhost:3000
echo 2. Admin dashboard:  http://localhost:3000/admin/payments
echo    (Login with: test-admin-key-123)
echo.
echo FULL PURCHASE FLOW NOW WORKS:
echo - Select a raffle and click "Comprar Ticket"
echo - Fill out the form and upload a payment proof image
echo - Submit the form to create a transaction
echo - Go to the admin panel to approve the payment
echo.
echo ===================================================
