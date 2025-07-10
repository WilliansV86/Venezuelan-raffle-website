@echo off
echo ===============================================
echo Venezuelan Raffle Website - Secure Email Server
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo Setting environment variables...
setlocal
set PORT=5001
set NODE_ENV=production
set MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority

:: Email Configuration with SSL
set EMAIL_HOST=smtp.gmail.com
set EMAIL_PORT=465
set EMAIL_USER=ing.williamvalderrama@gmail.com
set EMAIL_PASSWORD=ykevefymfdnheqkq
set EMAIL_FROM=ing.williamvalderrama@gmail.com
set EMAIL_FROM_NAME=Sorteo Venezolano
set ADMIN_EMAIL=ing.williamvalderrama@gmail.com

echo.
echo Starting secure email server...
echo.

cd backend
node email-enabled-server.js

pause
