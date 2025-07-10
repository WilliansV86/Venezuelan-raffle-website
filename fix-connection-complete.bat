@echo off
echo ===================================================
echo FIXING VENEZUELAN RAFFLE WEBSITE CONNECTION
echo ===================================================
echo.

echo 1. Killing any existing Node.js processes...
taskkill /F /IM node.exe > nul 2>&1

echo 2. Setting up environment...
cd %~dp0backend
node create-env-file.js

echo 3. Testing MongoDB connection...
node test-mongodb-connection.js
if %errorlevel% neq 0 (
  echo.
  echo ===================================================
  echo ERROR: MongoDB connection failed!
  echo.
  echo Please check:
  echo 1. Your IP is whitelisted in MongoDB Atlas
  echo 2. Your network connection is working
  echo 3. MongoDB Atlas is available
  echo ===================================================
  pause
  exit /b 1
)

echo 4. Starting main server...
start cmd /k "cd %~dp0backend && node main-server.js"
timeout /t 5

echo 5. Creating test raffle...
curl -s http://localhost:5100/api/create-test-raffle > nul

echo 6. Starting admin server...
start cmd /k "cd %~dp0backend && node admin-server.js"
timeout /t 2

echo 7. Creating frontend .env file...
cd %~dp0frontend
echo REACT_APP_API_URL=http://localhost:5100/api> .env.local

echo 8. Starting React frontend...
start cmd /k "cd %~dp0frontend && npm start"

echo.
echo ===================================================
echo COMPLETE SOLUTION
echo ===================================================
echo.
echo All services are now running!
echo.
echo Frontend:    http://localhost:3000
echo API Server:  http://localhost:5100
echo Admin Panel: http://localhost:3000/admin/payments
echo.
echo IMPORTANT TROUBLESHOOTING:
echo.
echo If you still see connection errors:
echo 1. Open a NEW private/incognito browser window
echo 2. Try these direct links to confirm servers are working:
echo    - http://localhost:5100/ping  (should show {"status":"ok"})
echo    - http://localhost:5100/api/raffles (should show raffle data)
echo.
echo ===================================================
