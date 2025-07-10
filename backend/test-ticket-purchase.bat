@echo off
echo Running Ticket Purchase Test
cd %~dp0
node src/utils/testTicketPurchase.js
pause
