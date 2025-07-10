@echo off
echo ===============================================
echo Venezuelan Raffle Website - Final Test Solution
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
SET MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority^&connectTimeoutMS=30000^&socketTimeoutMS=45000^&maxPoolSize=10^&family=4

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
echo Copying improved MongoDB connection code...
copy /Y config\db.improved.js config\db.js

echo Copying improved health routes...
copy /Y src\routes\healthRoutes.improved.js src\routes\healthRoutes.js

echo.
echo ===============================================
echo Starting server with improved connection handling
echo ===============================================
echo.
echo The server will attempt to maintain a persistent MongoDB connection
echo even if there are temporary network issues.
echo.
echo Press Ctrl+C to stop the server when finished testing.
echo.

node server.js

pause
