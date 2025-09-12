@echo on
echo ===================================================
echo Full Email Configuration Test
echo ===================================================
echo.
echo This will test multiple email configurations and save
echo detailed logs to backend/email-debug.log
echo.

cd backend
echo Running comprehensive email tests...
node test-email-full-debug.js

echo.
echo Test completed.
echo Check the backend/email-debug.log file for detailed results.
echo.
pause
