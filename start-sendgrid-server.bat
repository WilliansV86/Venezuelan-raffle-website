@echo off
echo ===============================================
echo Venezuelan Raffle Website - SendGrid Email Server
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo Setting environment variables...
setlocal
set PORT=5000
set NODE_ENV=production
set MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority

:: SendGrid Email Configuration
:: You need to replace the placeholder below with your actual SendGrid API key
set SENDGRID_API_KEY=API_KEY_REMOVED_FOR_SECURITY
set EMAIL_FROM=tusuerteestaaquive@gmail.com
:: Change this to your preferred admin email address
set ADMIN_EMAIL=tusuerteestaaquive@gmail.com

echo.
echo SendGrid configuration is ready.
echo If you haven't created a SendGrid account yet, visit https://app.sendgrid.com/ to get an API key.
echo Then edit this file to add your SendGrid API key.
echo.
echo Starting server with SendGrid email functionality...
echo.

cd backend
node sendgrid-server.js

pause
