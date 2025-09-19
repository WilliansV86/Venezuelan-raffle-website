@echo on
echo ===================================================
echo Running Verbose Gmail Test
echo ===================================================
echo.
cd backend
echo This will show detailed diagnostics for Gmail configuration...
node test-gmail-verbose.js
echo.
echo Test completed.
pause
