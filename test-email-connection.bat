@echo off
echo Venezuelan Raffle Website - Email Connection Test
echo ===========================================
echo.

REM Check if .env file exists in backend
if not exist "backend\.env" (
    echo [ERROR] Missing .env file in backend directory
    echo Please create the .env file with your email service credentials
    pause
    exit /b
)

echo Running Email connection test...
echo This will verify your email service configuration and send a test email
echo.

cd backend
node src/utils/testEmailConnection.js

REM Check if the test succeeded
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Email connection test failed
    echo Please check the error messages above and verify your email settings
    echo.
    echo Common issues:
    echo 1. Incorrect EMAIL_HOST or EMAIL_PORT
    echo 2. Invalid EMAIL_USER or EMAIL_PASSWORD
    echo 3. If using Gmail, you may need to create an App Password
    echo 4. Your email provider may be blocking the connection
    echo.
) else (
    echo.
    echo [SUCCESS] Email connection test passed!
    echo Your email service is configured correctly
    echo.
    echo If you provided an ADMIN_EMAIL, check that inbox for a test email
    echo.
)

pause
