@echo off
echo Venezuelan Raffle Website - Installing Production Dependencies
echo =====================================================
echo.

echo Installing backend dependencies...
cd backend
npm install winston winston-daily-rotate-file express-rate-limit --save

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b
)

echo.
echo Backend dependencies installed successfully!
echo.

cd ..
echo All production dependencies have been installed.
echo.
echo Next Steps:
echo 1. Run check-production-readiness.bat to verify your configuration
echo 2. Make sure your MongoDB Atlas IP whitelist includes your server's IP address
echo 3. Configure your .env file with all required credentials
echo 4. Run deploy-production.bat to build and deploy your application
echo.

pause
