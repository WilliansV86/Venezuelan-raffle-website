@echo on
echo ===================================================
echo Testing Email with Alternate Port (587)
echo ===================================================
echo.
cd backend
echo Running alternate port test (using port 587 instead of 465)...
node test-email-alternate.js
echo.
echo Test completed.
pause
