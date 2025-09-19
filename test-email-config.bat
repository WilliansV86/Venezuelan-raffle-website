@echo on
echo ===================================================
echo Testing Email Configuration
echo ===================================================
echo.
cd backend
echo Running detailed email configuration test...
node test-direct-email-config.js
echo.
echo Test completed.
echo Check the backend/email-test-results.log file for details.
pause
