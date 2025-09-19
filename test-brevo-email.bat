@echo on
echo ===================================================
echo Testing Brevo Email Service
echo ===================================================
echo.
cd backend
echo Running Brevo email test script...
node test-brevo-email.js
echo.
echo Test completed.
pause
