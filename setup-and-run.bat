@echo off
echo ===============================================
echo VENEZUELAN RAFFLE WEBSITE - SETUP AND RUN
echo ===============================================
echo.

REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

cd %~dp0\backend

REM Create .env file with proper configuration
echo Creating backend .env file...
echo MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority> .env
echo PORT=5100>> .env
echo ADMIN_KEY=admin123>> .env
echo NODE_ENV=development>> .env

REM Start the backend
start cmd /k "cd %~dp0\backend && npm start"

echo Waiting for backend to start...
timeout /t 5

REM Start the frontend (on port 3001 since 3000 might be in use)
start cmd /k "cd %~dp0\frontend && set PORT=3001 && npm start"

echo ===============================================
echo Services started:
echo - Backend running on http://localhost:5100
echo - Frontend running on http://localhost:3001
echo ===============================================
