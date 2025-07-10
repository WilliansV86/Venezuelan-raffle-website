@echo off
echo Venezuelan Raffle Website - Production Server Startup
echo ===============================================
echo.

REM Check if .env file exists
if not exist "backend\.env" (
    echo [ERROR] Missing .env file in backend directory
    echo Please create the .env file with your production settings
    echo You can copy .env.production to .env and update as needed
    pause
    exit /b
)

echo Starting production server...
echo.
echo IMPORTANT: Make sure your MongoDB IP whitelist is configured
echo Your MongoDB URI is: mongodb+srv://WilliansV86:[PASSWORD]@cluster0.adlajpr.mongodb.net/raffle

REM Start the backend server in production mode
cd backend
set NODE_ENV=production
npm start

REM If the server stops, wait for user input
echo.
echo Server has stopped. Press any key to exit.
pause
