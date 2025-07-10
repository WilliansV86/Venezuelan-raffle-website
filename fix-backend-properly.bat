@echo off
echo ===================================================
echo FIXING VENEZUELAN RAFFLE WEBSITE BACKEND CONNECTION
echo ===================================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /F /IM node.exe > nul 2>&1
timeout /t 2 > nul

echo 2. Creating proper backend .env file...
cd %~dp0backend
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority > .env
echo PORT=5100 >> .env
echo ADMIN_KEY=test-admin-key-123 >> .env
echo NODE_ENV=development >> .env

echo.
echo 3. Installing any missing dependencies...
call npm install

echo.
echo 4. Starting backend server directly...
start cmd /k "node server.js"

echo.
echo ===================================================
echo Backend server should now be running on port 5100
echo To verify, open http://localhost:5100/api/ping
echo.
echo Next, open a new command prompt to run the frontend
echo ===================================================
echo.
pause
