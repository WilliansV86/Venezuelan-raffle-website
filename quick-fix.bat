@echo off
echo Venezuelan Raffle Website - Quick Fix
echo =================================
echo.

echo 1. Stopping any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
echo   Done!
echo.

echo 2. Starting backend server on port 5100...
cd %~dp0backend
start "Backend Server" cmd /k "npm run dev"
echo   Server starting...
echo.
timeout /t 5 /nobreak >nul

echo 3. Starting frontend server...
cd %~dp0frontend
start "Frontend Server" cmd /k "npm start"
echo   Server starting...
echo.
echo 4. All servers started! Please wait a moment for them to initialize.
echo.
echo Visit: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
