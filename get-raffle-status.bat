@echo off
echo Running raffle status check...
cd backend\src\utils
node get-raffle-status.js
pause
