@echo off
echo ===============================================
echo Venezuelan Raffle Website - Production Server
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo Setting up environment variables...

:: Server Settings
SET NODE_ENV=production
SET PORT=5100

:: MongoDB with enhanced connection options
SET MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority^&connectTimeoutMS=30000^&socketTimeoutMS=45000^&maxPoolSize=10^&family=4

:: Admin Authentication
SET ADMIN_KEY=test-admin-key-123
SET JWT_SECRET=secreto2023

:: Email Configuration (placeholder values for testing)
SET EMAIL_HOST=smtp.gmail.com
SET EMAIL_PORT=587
SET EMAIL_SECURE=false
SET EMAIL_USER=test@example.com
SET EMAIL_PASSWORD=test-password
SET EMAIL_FROM=test@example.com
SET EMAIL_FROM_NAME=Sorteo Venezolano Test
SET ADMIN_EMAIL=admin@example.com

:: Cloudinary Configuration (placeholder values for testing)
SET CLOUDINARY_CLOUD_NAME=test-cloud
SET CLOUDINARY_API_KEY=test-key
SET CLOUDINARY_API_SECRET=test-secret

echo.
echo ===============================================
echo Starting server with improved MongoDB connection
echo ===============================================
echo.
echo Server will start on http://localhost:5001
echo.
echo NOTE: Purchase testing instructions:
echo 1. Wait for "MongoDB Conectado" message
echo 2. In a new PowerShell window, run:
echo    powershell -ExecutionPolicy Bypass -File test-purchase-api-1.5-price.ps1
echo.
echo Press Ctrl+C to stop the server when finished testing.
echo.

cd backend
node server.js

pause
