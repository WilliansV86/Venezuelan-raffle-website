@echo off
echo ===================================================
echo Detailed Email Testing Script
echo ===================================================
echo.
echo This will run a comprehensive test of the email system
echo with verbose output to diagnose any issues.
echo.

cd backend
node test-email-verbose.js

echo.
pause
