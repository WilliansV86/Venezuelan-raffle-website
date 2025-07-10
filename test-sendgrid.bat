@echo off
echo Venezuelan Raffle Website - SendGrid Email Test
echo ============================================
echo.

REM Check if .env file exists in backend
if not exist "backend\.env" (
    echo [ERROR] Missing .env file in backend directory
    echo Please create the .env file with your SENDGRID_API_KEY, EMAIL_FROM, and ADMIN_EMAIL
    pause
    exit /b
)

echo Running SendGrid email test...
echo This will verify your SendGrid configuration and send a test email
echo.

cd backend
node test-sendgrid.js

echo.
pause
