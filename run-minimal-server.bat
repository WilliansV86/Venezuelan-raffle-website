@echo off
echo ===============================================
echo Minimal Test Server - Sorteo Venezolano
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo Setting up environment variables...
SET PORT=5001
SET NODE_ENV=production

echo.
echo ===============================================
echo Starting minimal test server...
echo ===============================================
echo.
echo Server will start on http://localhost:5001
echo.
echo Test the server using:
echo file:///c:/Users/WParedes/Desktop/Venezuelan-raffle-website/test-purchase-directly.html
echo.
echo Press Ctrl+C to stop the server when finished testing.
echo.

cd backend
node minimal-server.js

pause
