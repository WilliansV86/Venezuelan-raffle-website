@echo off
echo Starting Venezuelan Raffle Frontend on port 3001...
cd %~dp0frontend
SET PORT=3001
SET BROWSER=none
cd %~dp0frontend
node node_modules\react-scripts\scripts\start.js
