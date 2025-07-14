@echo off
echo Starting Venezuelan Raffle Website Test Environment
echo =============================================
echo.

REM Check if MongoDB URI is set in .env file
echo Checking MongoDB configuration...
if not exist "backend\.env" (
    echo [ERROR] Missing .env file in backend directory
    echo Please create the .env file as instructed and try again
    pause
    exit /b
)

REM Start backend server
echo Starting backend server...
start cmd /k "cd backend && npm start"

REM Wait for backend to initialize
timeout /t 5

REM Start frontend server
echo Starting frontend server...
start cmd /k "cd frontend && npm start"

echo.
echo Test environment started!
echo Backend API: http://localhost:5100
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window. The servers will continue running in their own windows.
echo To stop the servers, close their respective command prompt windows.
echo.
pause
