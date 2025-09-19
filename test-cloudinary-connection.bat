@echo off
echo Venezuelan Raffle Website - Cloudinary Connection Test
echo ==============================================
echo.

REM Check if .env file exists in backend
if not exist "backend\.env" (
    echo [ERROR] Missing .env file in backend directory
    echo Please create the .env file with your Cloudinary credentials
    pause
    exit /b
)

echo Running Cloudinary connection test...
echo This will verify your Cloudinary API access and upload capabilities
echo.

cd backend
node src/utils/testCloudinaryConnection.js

REM Check if the test succeeded
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Cloudinary connection test failed
    echo Please check the error messages above and verify your credentials
    echo.
    echo Common issues:
    echo 1. Incorrect CLOUDINARY_CLOUD_NAME
    echo 2. Invalid CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET
    echo 3. Your Cloudinary account has usage limitations or restrictions
    echo.
) else (
    echo.
    echo [SUCCESS] Cloudinary connection test passed!
    echo Your image upload service is working properly
    echo.
)

pause
