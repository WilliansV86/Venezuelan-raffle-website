@echo off
echo ===============================================
echo Venezuelan Raffle Website - Starting Servers
echo ===============================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo 2. Starting backend server (localhost:5100)...
start cmd /k "cd %~dp0backend && node server.js"

echo 3. Waiting 8 seconds for backend to initialize...
timeout /t 8 /nobreak >nul

echo 4. Starting frontend server (localhost:3000)...
start cmd /k "cd %~dp0frontend && npm start"

echo 5. Waiting 5 seconds for frontend to initialize...
timeout /t 5 /nobreak >nul

echo 6. Opening website in browser...
start http://localhost:3000

echo.
echo =============================================
echo Servers started! Please check the separate
echo command windows for any error messages.
echo.
echo Backend: http://localhost:5100
echo Frontend: http://localhost:3000
echo =============================================
echo.
pause
