@echo off
echo Starting Venezuelan Raffle Website servers...
echo.

REM Kill any existing Node.js processes
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

REM Start the backend server
echo Starting backend server...
start cmd /k "cd backend && node server.cjs"

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start the frontend server
echo Starting frontend server...
start cmd /k "cd frontend && npm start"

echo.
echo Servers started successfully!
echo Backend: http://localhost:5100
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
