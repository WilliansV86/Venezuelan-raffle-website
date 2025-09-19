@echo off
echo ===================================================
echo Setting up environment and starting servers
echo ===================================================

cd %~dp0backend

echo Creating .env file from template...
copy .env.template .env

echo ===================================================
echo IMPORTANT: Make sure your IP address is whitelisted in MongoDB Atlas
echo Your MongoDB connection string is:
echo mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle
echo ===================================================

echo Starting Main Server on port 5100...
start cmd /k "cd %~dp0backend && node main-server.js"
timeout /t 5

echo Starting Admin Server on port 5200...
start cmd /k "cd %~dp0backend && node admin-server.js"
timeout /t 5

echo Starting React Frontend...
start cmd /k "cd %~dp0frontend && npm start"

echo ===================================================
echo All services started!
echo Frontend: http://localhost:3000
echo Main Server: http://localhost:5100/ping
echo Admin Server: http://localhost:5200/ping
echo ===================================================

echo Press any key to create a test raffle...
pause > nul
curl http://localhost:5100/api/create-test-raffle
echo.
echo Done! Refresh your browser at http://localhost:3000
