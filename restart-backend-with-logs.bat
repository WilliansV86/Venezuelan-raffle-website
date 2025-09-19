@echo on
echo ===================================================
echo Restarting Backend Server with Enhanced Email Logging
echo ===================================================
echo.
echo This will restart the backend with detailed email logging
echo The logs will be saved to backend/logs/email-service.log
echo.

cd backend
echo Stopping any running node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting backend server with enhanced email logging...
node src/app.js

pause
