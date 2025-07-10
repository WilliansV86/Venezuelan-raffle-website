@echo off
echo ===============================================
echo Venezuelan Raffle Website - Standard Server with SendGrid
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo Setting environment variables...

REM Use simple format for environment variables to avoid any issues
set PORT=5000
set NODE_ENV=production
set MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority
set ADMIN_KEY=test-admin-key-123

REM SendGrid Email Configuration
set SENDGRID_API_KEY=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
set EMAIL_FROM=tusuerteestaaquive@gmail.com
set ADMIN_EMAIL=tusuerteestaaquive@gmail.com
set EMAIL_PROVIDER=sendgrid

echo.
echo Environment variables set successfully.
echo MongoDB URI is set.
echo SendGrid configuration is ready.
echo Starting standard server with SendGrid email integration...
echo.

cd backend
echo Current directory: %cd%
node server.js

pause
