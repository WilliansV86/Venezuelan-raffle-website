@echo off
echo Starting both servers...

REM Set critical environment variables
cd backend
set PORT=5100
set JWT_SECRET=raffle_secret_token_key
set ADMIN_KEY=admin123

REM Start backend in a new window
start cmd /k "cd %cd% && node server.cjs"

REM Start frontend in a new window
cd ..\frontend
start cmd /k "set PORT=3000 && npm start"

echo Servers should be starting now in separate windows.
echo Backend: http://localhost:5100
echo Frontend: http://localhost:3000
