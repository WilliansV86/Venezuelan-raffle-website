@echo off
echo ===================================================
echo FIXING VENEZUELAN RAFFLE WEBSITE CONNECTION
echo ===================================================
echo.

echo 1. Killing any existing Node.js processes...
taskkill /F /IM node.exe > nul 2>&1

echo 2. Creating proper .env file with MongoDB credentials...
cd %~dp0backend
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority> .env
echo PORT=5100>> .env
echo ADMIN_PORT=5200>> .env
echo ADMIN_KEY=test-admin-key-123>> .env
echo EMAIL_FROM=example@example.com>> .env
echo ADMIN_EMAIL=admin@example.com>> .env

echo 3. Checking MongoDB connection...
node test-mongodb-connection.js
if %errorlevel% neq 0 (
  echo ERROR: Could not connect to MongoDB. Please check your network and MongoDB Atlas whitelist.
  exit /b 1
)

echo 4. Starting main server with debug output...
start cmd /k "cd %~dp0backend && set DEBUG=express:* && node main-server.js"
timeout /t 5

echo 5. Creating test raffle data...
curl http://localhost:5100/api/create-test-raffle
echo.

echo 6. Starting admin server...
start cmd /k "cd %~dp0backend && node admin-server.js"
timeout /t 2

echo 7. Starting React frontend...
cd %~dp0frontend
echo REACT_APP_API_URL=http://localhost:5100/api> .env.local
start cmd /k "cd %~dp0frontend && npm start"

echo.
echo ===================================================
echo All services started! Try the site now.
echo.
echo FRONTEND:    http://localhost:3000
echo API SERVER:  http://localhost:5100
echo ADMIN API:   http://localhost:5200
echo.
echo TEST ENDPOINTS:
echo - Test API:  http://localhost:5100/ping
echo - Raffles:   http://localhost:5100/api/raffles
echo - Test Data: http://localhost:5100/api/create-test-raffle
echo ===================================================
echo.
echo If you still have connection issues, open a NEW browser window
echo or try restarting your computer.
echo.
