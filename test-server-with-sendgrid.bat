@echo off
echo Starting test server with SendGrid integration...
echo.

REM Set all necessary environment variables
set MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true^&w=majority
set PORT=5100
set NODE_ENV=development

REM Email configuration
set EMAIL_PROVIDER=sendgrid
set SENDGRID_API_KEY=API_KEY_REMOVED_FOR_SECURITY
set EMAIL_FROM=tusuerteestaaquive@gmail.com
set ADMIN_EMAIL=tusuerteestaaquive@gmail.com

REM Echo environment variables for debugging
echo MongoDB URI: %MONGO_URI%
echo Port: %PORT%
echo Environment: %NODE_ENV%
echo Email Provider: %EMAIL_PROVIDER%
echo SendGrid API Key: [HIDDEN FOR SECURITY]
echo Email From: %EMAIL_FROM%
echo Admin Email: %ADMIN_EMAIL%
echo.

cd backend
node fixed-test-server.js

pause
