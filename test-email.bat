@echo on
echo Venezuelan Raffle Website - Email Test Script
echo ==============================================
echo.
cd backend

echo Checking Node.js installation...
node --version
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not properly installed or not in PATH
    pause
    exit /b 1
)

echo Starting email test with verbose error reporting...
node --trace-warnings --trace-uncaught test-email.js

echo If you see this message, the test completed (successfully or with errors).
pause
