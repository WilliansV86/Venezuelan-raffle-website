@echo off
echo Starting Venezuelan Raffle Website Servers...
echo.

echo Step 1: Killing any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
echo Done!
echo.

echo Step 2: Starting backend server (port 5100)...
start powershell -NoExit -Command "cd '%~dp0backend'; npm run dev"
echo Backend server starting! Please wait 5 seconds...
timeout /t 5 >nul
echo.

echo Step 3: Starting frontend server (port 3001)...
start powershell -NoExit -Command "cd '%~dp0frontend'; npm start"
echo Frontend server starting!
echo.

echo All servers started! You can access the website at: http://localhost:3001
echo.
echo Press any key to exit this window...
pause >nul
