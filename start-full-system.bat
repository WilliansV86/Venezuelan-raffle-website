@echo off
echo ===================================================
echo Starting Venezuelan Raffle Website - Full Test Mode
echo ===================================================
echo.
echo Make sure you have the following environment variables in your .env file:
echo - MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority
echo - PORT=5100
echo - ADMIN_PORT=5200
echo - ADMIN_KEY=test-admin-key-123
echo - EMAIL_FROM=your-sender-email@example.com
echo - ADMIN_EMAIL=your-admin-email@example.com
echo - SENDGRID_API_KEY=your-sendgrid-api-key
echo.
echo ===================================================
echo Starting Main Server on port 5100...
start cmd /k "cd %~dp0backend && node main-server.js"
timeout /t 5
echo ===================================================
echo Starting Admin Server on port 5200...
start cmd /k "cd %~dp0backend && node admin-server.js"
timeout /t 5
echo ===================================================
echo Starting React Frontend...
start cmd /k "cd %~dp0frontend && npm start"
echo ===================================================
echo.
echo All systems starting up! Please wait a moment...
echo.
echo Main Website: http://localhost:3000
echo Admin Dashboard: http://localhost:3000/admin/payments
echo.
echo Main Server API: http://localhost:5100/ping
echo Admin Server API: http://localhost:5200/ping
