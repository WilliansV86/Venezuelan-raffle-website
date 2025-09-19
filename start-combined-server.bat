@echo off
echo Starting Venezuelan Raffle Website (Combined Server)...
echo.
echo This server includes both the backend API and frontend interface
echo.
cd %~dp0
node simple-server.cjs
pause
