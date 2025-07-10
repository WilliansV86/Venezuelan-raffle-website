@echo off
echo Starting Venezuelan Raffle Website Frontend on port 3001...
echo.

cd %~dp0frontend
echo Setting PORT environment variable to 3001...
set PORT=3001

echo Starting React development server...
start cmd /c "npm start"

echo.
echo Frontend server started!
echo.
echo Website URL: http://localhost:3001
echo.
timeout /t 5 > nul
start http://localhost:3001
pause
