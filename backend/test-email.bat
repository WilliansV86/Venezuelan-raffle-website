@echo off
echo Installing nodemailer...
call npm install nodemailer

echo.
echo Running email test script...
node src/utils/testEmail.js

echo.
echo Press any key to exit
pause > nul
