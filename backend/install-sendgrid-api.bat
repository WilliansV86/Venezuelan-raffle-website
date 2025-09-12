@echo on
echo ===================================================
echo Installing SendGrid API Package
echo ===================================================
echo.
cd "%~dp0"
npm install @sendgrid/mail --save
echo.
echo Installation completed!
pause
