@echo off
echo ===================================================
echo Email Configuration Diagnostic Tool
echo ===================================================
echo.
echo This will verify your SendGrid email configuration
echo and test if emails can be sent successfully.
echo.

cd backend
mkdir test 2>nul

echo Running email diagnostics...
echo Results will be saved to email-diagnostic-results.txt
node test/email-diagnostic.js > email-diagnostic-results.txt 2>&1

echo.
echo Diagnostic complete. Displaying results:
echo.
type email-diagnostic-results.txt

echo.
echo ===================================================
echo If you see errors, please check:
echo 1. Your .env file contains all email configuration
echo 2. SendGrid API key is valid and active
echo 3. Network connectivity to smtp.sendgrid.net
echo ===================================================

pause
