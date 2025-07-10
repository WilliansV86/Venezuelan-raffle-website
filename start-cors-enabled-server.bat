@echo off
echo ===============================================
echo Venezuelan Raffle Website - CORS Enabled Server
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo Setting environment variables...
setlocal
set PORT=5000
set NODE_ENV=development
set MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority

:: SendGrid Email Configuration
set /p SENDGRID_API_KEY="Enter your SendGrid API Key (or press Enter to skip): "
set /p EMAIL_FROM="Enter your SendGrid verified email address (or press Enter to skip): "
set ADMIN_EMAIL=%EMAIL_FROM%

echo.
echo Starting CORS-enabled server (API available at http://localhost:5000/api/raffles)...
echo.

cd backend
node cors-enabled-server.js

pause
