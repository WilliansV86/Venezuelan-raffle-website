@echo off
echo ===================================================
echo SIMPLE WORKING FIX - VENEZUELAN RAFFLE WEBSITE
echo ===================================================
echo.

echo 1. Stopping all Node.js processes...
taskkill /F /IM node.exe > nul 2>&1
timeout /t 2 > nul

echo 2. Starting simple main server on port 5100...
start cmd /k "cd %~dp0backend && node simple-server.js"
timeout /t 3 > nul

echo 3. Testing connection to main server...
curl http://localhost:5100/ping
if %errorlevel% neq 0 (
  echo ERROR: Main server not responding!
  echo Please check if port 5100 is already in use.
  pause
  exit /b 1
)

echo.
echo 4. Starting admin server on port 5200...
start cmd /k "cd %~dp0backend && node admin-server.js"
timeout /t 2 > nul

echo 5. Starting React frontend...
start cmd /k "cd %~dp0frontend && npm start"

echo.
echo ===================================================
echo SYSTEM READY!
echo.
echo IMPORTANT: Open a NEW BROWSER WINDOW and go to:
echo    http://localhost:3000
echo.
echo Admin Dashboard: http://localhost:3000/admin/payments
echo Login with: test-admin-key-123
echo.
echo Main API Test: http://localhost:5100/ping
echo.
echo For full functionality later, remember:
echo - Your MongoDB IP whitelist includes multiple entries
echo - You can use 0.0.0.0/0 for testing purposes
echo ===================================================
