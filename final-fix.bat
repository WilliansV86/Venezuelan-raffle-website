@echo off
echo ===================================================
echo FINAL FIX FOR VENEZUELAN RAFFLE WEBSITE
echo ===================================================
echo.

echo 1. Stopping all Node.js processes...
taskkill /F /IM node.exe > nul 2>&1

echo 2. Creating proper .env file...
cd %~dp0backend
node create-env-file.js

echo 3. Starting minimal main server on port 5100...
start cmd /k "cd %~dp0backend && node minimal-main-server.js"
timeout /t 5

echo 4. Creating test raffle data...
curl http://localhost:5100/api/create-test-raffle
echo.

echo 5. Starting admin server on port 5200...
start cmd /k "cd %~dp0backend && node admin-server.js"
timeout /t 2

echo 6. Creating frontend environment file...
cd %~dp0frontend
echo REACT_APP_API_URL=http://localhost:5100/api> .env.local

echo 7. Starting React frontend...
start cmd /k "cd %~dp0frontend && npm start"

echo.
echo ===================================================
echo SYSTEM IS READY!
echo.
echo 1. Wait 15-20 seconds for everything to start
echo 2. OPEN A NEW BROWSER WINDOW and go to:
echo    http://localhost:3000
echo.
echo Admin Dashboard: http://localhost:3000/admin/payments
echo Admin Login Key: test-admin-key-123
echo.
echo ===================================================
