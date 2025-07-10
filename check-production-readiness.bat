@echo off
echo Venezuelan Raffle Website - Production Readiness Check
echo ================================================
echo.

REM Check if .env file exists in backend
if not exist "backend\.env" (
    echo [ERROR] Missing .env file in backend directory
    echo Please create the .env file with your production settings
    pause
    exit /b
)

REM Initialize variables
set DB_CHECK=FAIL
set EMAIL_CHECK=FAIL
set CLOUDINARY_CHECK=FAIL

echo Step 1/3: Testing MongoDB Connection
echo -------------------------------------
echo.

cd backend
node src/utils/checkMongoDbConnection.js
if %ERRORLEVEL% EQU 0 set DB_CHECK=PASS

echo.
echo Step 2/3: Testing Cloudinary Connection
echo ---------------------------------------
echo.

node src/utils/testCloudinaryConnection.js
if %ERRORLEVEL% EQU 0 set CLOUDINARY_CHECK=PASS

echo.
echo Step 3/3: Testing Email Connection
echo -------------------------------
echo.

node src/utils/testEmailConnection.js
if %ERRORLEVEL% EQU 0 set EMAIL_CHECK=PASS

echo.
echo.
echo Production Readiness Check Results
echo =================================
echo.

if "%DB_CHECK%"=="PASS" (
    echo [✓] MongoDB Connection: PASSED
) else (
    echo [✗] MongoDB Connection: FAILED
)

if "%CLOUDINARY_CHECK%"=="PASS" (
    echo [✓] Cloudinary Connection: PASSED
) else (
    echo [✗] Cloudinary Connection: FAILED
)

if "%EMAIL_CHECK%"=="PASS" (
    echo [✓] Email Connection: PASSED
) else (
    echo [✗] Email Connection: FAILED
)

echo.
if "%DB_CHECK%"=="PASS" if "%CLOUDINARY_CHECK%"=="PASS" if "%EMAIL_CHECK%"=="PASS" (
    echo [SUCCESS] All checks passed! Your system is ready for production.
    echo You can deploy your application with confidence.
) else (
    echo [WARNING] Some checks failed. Please fix the issues before deploying to production.
)

echo.
echo Next Steps:
echo 1. Run deploy-production.bat to build and prepare your application
echo 2. Deploy the backend to your server
echo 3. Deploy the frontend to your hosting service
echo.

cd ..
pause
