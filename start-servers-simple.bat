@echo off
echo Starting Venezuelan Raffle Website servers...
echo.

REM Kill any existing Node.js processes
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Start the backend server
cd %~dp0backend
start "Backend Server" cmd /k "node server.cjs"

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 10 /nobreak >nul

REM Start the frontend server
cd %~dp0frontend
start "Frontend Server" cmd /k "set PORT=3000 && npm start"

echo.
echo Servers started! Please wait a moment for them to fully initialize.
echo Backend: http://127.0.0.1:5100
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
