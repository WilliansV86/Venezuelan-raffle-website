@echo off
echo ================================
echo Starting Admin Server
echo ================================
start cmd /k "cd %~dp0backend && node admin-server.js"
timeout /t 3
echo ================================
echo Starting React Frontend
echo ================================
start cmd /k "cd %~dp0frontend && npm start"
