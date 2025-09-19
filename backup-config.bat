@echo off
echo Venezuelan Raffle Website - Backup Configuration Files
echo ================================================
echo.

REM Set timestamp for backup folder name
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"

set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

REM Create backup directory
set "backupDir=config-backups\backup_%timestamp%"
mkdir "%backupDir%"

echo Creating backup in %backupDir%...
echo.

REM Copy configuration files
echo Backing up production configuration files...
copy backend\.env "%backupDir%\backend.env" >nul 2>&1
copy backend\.env.production "%backupDir%\backend.env.production" >nul 2>&1

echo Backing up deployment scripts...
copy deploy-production.bat "%backupDir%\" >nul 2>&1
copy start-production-server.bat "%backupDir%\" >nul 2>&1
copy check-production-readiness.bat "%backupDir%\" >nul 2>&1
copy test-mongodb-connection.bat "%backupDir%\" >nul 2>&1
copy test-cloudinary-connection.bat "%backupDir%\" >nul 2>&1
copy test-email-connection.bat "%backupDir%\" >nul 2>&1
copy install-production-dependencies.bat "%backupDir%\" >nul 2>&1

echo Backing up documentation...
copy README-PRODUCTION.md "%backupDir%\" >nul 2>&1
copy HTTPS-SETUP.md "%backupDir%\" >nul 2>&1
copy PRODUCTION-CHECKLIST.md "%backupDir%\" >nul 2>&1
copy SCHEDULED-BACKUPS.md "%backupDir%\" >nul 2>&1
copy PRODUCTION-DOCS.md "%backupDir%\" >nul 2>&1

echo.
echo Backup complete!
echo Configuration files have been backed up to %backupDir%
echo.

echo Remember: These files contain sensitive credentials.
echo Store this backup in a secure location.
echo.

pause
