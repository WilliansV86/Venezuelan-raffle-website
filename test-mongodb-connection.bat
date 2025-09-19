@echo off
echo Venezuelan Raffle Website - MongoDB Connection Test
echo ==============================================
echo.

REM Check if .env file exists in backend
if not exist "backend\.env" (
    echo [ERROR] Missing .env file in backend directory
    echo Please create the .env file with your MongoDB connection string
    pause
    exit /b
)

echo Running MongoDB connection test...
echo This will verify your database connection and IP whitelist settings
echo.

cd backend
node src/utils/checkMongoDbConnection.js

REM Check if the test succeeded
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] MongoDB connection test failed
    echo Please check the error messages above and verify your settings
    echo.
    echo Common issues:
    echo 1. Your server IP is not whitelisted in MongoDB Atlas
    echo 2. Your MONGO_URI in .env is incorrect
    echo 3. Your MongoDB Atlas cluster is not running
    echo.
) else (
    echo.
    echo [SUCCESS] MongoDB connection test passed!
    echo Your database connection is working properly
    echo.
)

pause
