@echo off
echo ===============================================
echo Venezuelan Raffle Website - Standard Server with Email
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

:: Email Configuration
set EMAIL_HOST=smtp.gmail.com
set EMAIL_PORT=587
set EMAIL_USER=ing.williamvalderrama@gmail.com
set EMAIL_PASSWORD=ykevefymfdnheqkq
set EMAIL_FROM=ing.williamvalderrama@gmail.com
set EMAIL_FROM_NAME=Sorteo Venezolano
:: Change this to your preferred admin email address
set ADMIN_EMAIL=ing.williamvalderrama@gmail.com

echo.
echo Email configuration is ready to use.
echo.
echo Starting standard server with email functionality...
echo.

cd backend
node server.js

pause
