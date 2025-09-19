@echo on
echo ===================================================
echo Testing Email with Gmail SMTP
echo ===================================================
echo.
echo IMPORTANT: Before running this test:
echo 1. Edit test-email-gmail.js to add your Gmail password
echo 2. Enable "Less secure app access" in your Google account
echo    or create an app password if using 2FA
echo.
echo Press any key to continue or CTRL+C to cancel
pause

cd backend
echo Running Gmail SMTP test...
node test-email-gmail.js
echo.
echo Test completed.
pause
