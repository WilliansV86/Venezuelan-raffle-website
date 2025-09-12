@echo on
echo Venezuelan Raffle Website - Starting Backend Server
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

echo Checking for .env file...
if not exist ".env" (
    echo WARNING: .env file not found, copying from .env.example
    copy .env.example .env
)

echo Creating ultra minimal test file...
echo console.log('Ultra minimal test running successfully!'); > test-minimal.js

echo Testing minimal Node.js execution...
node test-minimal.js
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js cannot execute even a minimal script
    pause
    exit /b 1
)

echo Starting backend server on port 5100 with verbose error reporting...
node --trace-warnings --trace-uncaught server.cjs

echo If you see this message, the server exited unexpectedly.
pause
