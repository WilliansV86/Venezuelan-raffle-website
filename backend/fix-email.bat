@echo off
echo Installing nodemailer...
call npm install nodemailer

echo.
echo Running Email Configuration Diagnostic Tool...
node src/utils/fixEmailConfig.js

echo.
echo Press any key to exit when finished
pause > nul
