@echo off
echo Venezuelan Raffle Website Production Deployment
echo =============================================
echo.

REM Check if .env.production exists
if not exist "backend\.env.production" (
    echo [ERROR] Missing .env.production file in backend directory
    echo Please configure your production environment variables first
    pause
    exit /b
)

REM Build frontend
echo Building frontend for production...
cd frontend
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed
    pause
    exit /b
)

echo Frontend build successful!

REM Copy .env.production to .env for backend
echo Setting up production environment for backend...
cd ..\backend
copy /Y .env.production .env

echo.
echo Production build complete!
echo.
echo Next steps:
echo 1. Deploy the backend folder to your server
echo 2. Deploy the frontend/build folder to your static hosting service
echo 3. Update CORS settings in server.js with your production domain
echo.
echo For a single-server deployment:
echo 1. Copy the frontend/build folder to backend/public
echo 2. Update server.js to serve static files from the public directory
echo.
pause
