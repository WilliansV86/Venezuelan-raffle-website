@echo off
echo ===============================================
echo Venezuelan Raffle Website - Test Purchase
echo ===============================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo Setting up environment variables...

:: Server Settings
SET NODE_ENV=production
SET PORT=5001

:: MongoDB with enhanced connection options
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
echo Starting backend server for purchase testing
echo ===============================================
echo.
echo Server will start on http://localhost:5001
echo.
echo After the server starts, open the test purchase form:
echo file:///c:/Users/WParedes/Desktop/Venezuelan-raffle-website/simple-test-purchase.html
echo.
echo Press Ctrl+C to stop the server when finished testing.
echo.

cd backend
node server.js

pause
