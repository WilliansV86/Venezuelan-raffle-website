@echo on
echo ===================================================
echo Testing SendGrid Web API
echo ===================================================
echo.
cd backend
echo Running SendGrid Web API test...
node test-sendgrid-api.js
echo.
echo Test completed.
pause
