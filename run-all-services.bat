@echo off
echo Starting Venezuelan Raffle Website Services
echo ==========================================
echo.

REM Kill any existing Node.js processes
echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Start backend
echo Starting backend server on port 5100...
start "Backend Server" cmd /k "cd %~dp0backend && node server.cjs"

REM Wait for backend to initialize
echo Waiting for backend to initialize (15 seconds)...
timeout /t 15 /nobreak >nul

REM Start frontend on port 3000 (default React port)
echo Starting frontend server on port 3000...
start "Frontend Server" cmd /k "cd %~dp0frontend && npm start"

echo.
echo Servers started successfully!
echo Backend: http://localhost:5100
echo Frontend: http://localhost:3000
echo.
echo Navigate to http://localhost:3000 in your browser
echo.
pause
