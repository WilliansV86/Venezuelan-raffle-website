@echo off
echo Restarting Venezuelan Raffle Website servers...
echo.

REM Kill any existing Node.js processes
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Start the backend server in its own window
echo Starting backend server...
start "Backend Server" cmd /k "cd %~dp0backend && node server.cjs"

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 15 /nobreak >nul

REM Start the frontend server in its own window
echo Starting frontend server...
start "Frontend Server" cmd /k "cd %~dp0frontend && set PORT=3001 && npm start"

echo.
echo Servers started successfully!
echo Backend: http://localhost:5100
echo Frontend: http://localhost:3001
echo.
echo Press any key to exit...
pause >nul
