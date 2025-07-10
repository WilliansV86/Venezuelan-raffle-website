@echo off
echo Starting the Sorteos Venezolanos Web App...

echo 1. Stopping any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo 2. Starting Backend Server (Port 5100)...
start cmd /k "cd backend && npm start"

echo 3. Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo 4. Starting Frontend Server (Port 3000)...
start cmd /k "cd frontend && npm start"

echo 5. Opening application in browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ====================================================
echo Application started! Please check the terminal windows for any errors.
echo Backend: http://localhost:5100/api
echo Frontend: http://localhost:3000
echo ====================================================
