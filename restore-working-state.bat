@echo off
echo ===============================================
echo Restoring Venezuelan Raffle Website to working state
echo ===============================================
echo.

echo 1. Stopping any running Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo 2. Creating frontend .env file with correct backend URL...
cd %~dp0frontend
echo REACT_APP_API_URL=http://localhost:5100/api> .env.local
echo REACT_APP_PORT=3001>> .env.local

echo 3. Starting backend server...
start cmd /k "cd %~dp0backend && set PORT=5100 && set JWT_SECRET=test-secret-key-123 && set ADMIN_KEY=test-admin-key-123 && set MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority && node server.cjs"
echo Waiting for backend to initialize...
timeout /t 5 >nul

echo 4. Testing backend connection...
curl -s http://localhost:5100/test
if %errorlevel% neq 0 (
  echo Backend server failed to start properly.
  echo Please check the backend server window for errors.
) else (
  echo Backend server started successfully!
)

echo 5. Starting frontend development server...
start cmd /k "cd %~dp0frontend && set PORT=3001 && npm start"

echo.
echo ===============================================
echo Setup complete! Please wait for both servers to start.
echo - Backend: http://localhost:5100
echo - Frontend: http://localhost:3001
echo ===============================================
echo.
