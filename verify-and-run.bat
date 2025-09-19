@echo off
echo ======================================================
echo Venezuelan Raffle Website - Configuration Check and Run
echo ======================================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo 2. Verifying backend configuration...
cd %~dp0backend
if not exist .env (
    echo Creating .env file...
    echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority > .env
    echo PORT=5100 >> .env
    echo ADMIN_KEY=admin123 >> .env
    echo NODE_ENV=development >> .env
) else (
    echo .env file exists, ensuring it has required variables...
    findstr /C:"MONGO_URI" .env > nul || echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority >> .env
    findstr /C:"PORT" .env > nul || echo PORT=5100 >> .env
    findstr /C:"ADMIN_KEY" .env > nul || echo ADMIN_KEY=admin123 >> .env
    findstr /C:"NODE_ENV" .env > nul || echo NODE_ENV=development >> .env
)

echo 3. Starting backend server (Port 5100)...
start cmd /k "cd %~dp0backend && node server.js"

echo 4. Waiting 10 seconds for backend to initialize...
timeout /t 10 /nobreak > nul

echo 5. Starting frontend server (Port 3001)...
start cmd /k "cd %~dp0frontend && set PORT=3001 && npm start"

echo 6. Waiting 8 seconds for frontend to initialize...
timeout /t 8 /nobreak > nul

echo 7. Opening website in browser...
start http://localhost:3001

echo.
echo =======================================================
echo Servers started! Please check terminal windows for logs
echo.
echo Backend: http://localhost:5100
echo Frontend: http://localhost:3001
echo =======================================================

pause
