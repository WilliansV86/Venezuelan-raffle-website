@echo off
echo ===============================================
echo Venezuelan Raffle Website - PRODUCTION TEST
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo Setting up environment variables...

:: Server Settings
SET NODE_ENV=production
SET PORT=5001

:: MongoDB with enhanced connection options - matches the MongoDB Atlas whitelist
SET MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority

:: Admin Authentication
SET ADMIN_KEY=test-admin-key-123

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
echo Starting server with fixed MongoDB connection...
echo ===============================================
echo.
echo TESTING INSTRUCTIONS:
echo.
echo 1. Wait for the "MongoDB Conectado" message below
echo 2. Open this file in your browser to test purchases:
echo    file:///c:/Users/WParedes/Desktop/Venezuelan-raffle-website/complete-purchase-test.html
echo.
echo 3. First click "Verificar Servidor" to confirm connectivity
echo 4. Then complete the purchase form and submit
echo.
echo Press Ctrl+C to stop the server when finished testing.
echo.

cd backend
node server-fixed.js

pause
