@echo off
echo ===================================================
echo RUNNING FIXED VENEZUELAN RAFFLE WEBSITE BACKEND
echo ===================================================
echo.

echo 1. Killing any existing Node.js processes...
taskkill /f /im node.exe > nul 2>&1
timeout /t 2 > nul

echo 2. Creating/verifying .env file...
cd %~dp0backend
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority > .env
echo PORT=5100 >> .env
echo ADMIN_KEY=test-admin-key-123 >> .env
echo NODE_ENV=development >> .env

echo 3. Running fixed raffle server...
node fixed-raffle-server.js

echo.
echo If you see this message, the server failed to start properly.
pause
