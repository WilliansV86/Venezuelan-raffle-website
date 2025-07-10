@echo off
echo Venezuelan Raffle Website - Database Backup
echo =======================================
echo.

REM Check if .env file exists in backend
if not exist "backend\.env" (
    echo [ERROR] Missing .env file in backend directory
    echo Please create the .env file with your MongoDB connection string
    pause
    exit /b
)

echo Running MongoDB database backup...
echo This will create a backup of your database in backend/backups folder
echo.

cd backend
node src/utils/databaseBackup.js

REM Check if the backup succeeded
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Database backup failed
    echo Please check the error messages above and verify your MongoDB connection
    echo.
    echo Common issues:
    echo 1. mongodump tool is not installed on the system
    echo 2. Your MongoDB Atlas connection string is incorrect
    echo 3. Your IP is not whitelisted in MongoDB Atlas
    echo.
) else (
    echo.
    echo [SUCCESS] Database backup completed!
    echo Your database has been backed up to backend/backups folder
    echo.
)

pause
