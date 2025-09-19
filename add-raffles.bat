@echo off
echo ===============================================
echo ADDING TEST RAFFLES TO DATABASE
echo ===============================================
echo.

cd %~dp0\backend
echo Using mongoose from backend folder...

node ..\add-raffles.js

echo.
echo If successful, please refresh your browser at http://localhost:3001
echo to see the raffle cards.
echo.
pause
