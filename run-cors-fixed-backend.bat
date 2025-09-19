@echo off
echo ===================================================
echo STARTING BACKEND WITH CORS FIX
echo ===================================================
echo.

cd %~dp0\backend
echo Working directory: %CD%

echo Starting backend with fixed CORS configuration...
node ..\cors-fixed-server.cjs

echo.
pause
