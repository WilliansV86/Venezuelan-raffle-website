@echo off
echo ===================================================
echo Starting Venezuelan Raffle Website with Test Data
echo ===================================================

cd %~dp0backend

echo Ensuring .env file exists with correct settings...
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority> .env
echo PORT=5100>> .env
echo ADMIN_PORT=5200>> .env
echo ADMIN_KEY=test-admin-key-123>> .env
echo EMAIL_FROM=example@example.com>> .env
echo ADMIN_EMAIL=admin@example.com>> .env

echo Starting Main Server on port 5100...
start cmd /k "cd %~dp0backend && node main-server.js"
timeout /t 5

echo Creating test raffle...
curl http://localhost:5100/api/create-test-raffle

echo Starting Admin Server on port 5200...
start cmd /k "cd %~dp0backend && node admin-server.js"
timeout /t 2

echo Starting React Frontend (with correct proxy)...
start cmd /k "cd %~dp0frontend && npm start"

echo ===================================================
echo All services started!
echo Main Website: http://localhost:3000
echo Admin Dashboard: http://localhost:3000/admin/payments
echo ===================================================
echo.
echo IMPORTANT: If you still see "No se pudieron cargar los sorteos",
echo try these steps:
echo 1. Close your browser completely
echo 2. Open a new browser window
echo 3. Go to http://localhost:3000
echo.
