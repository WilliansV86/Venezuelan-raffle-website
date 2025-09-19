@echo off
echo ===============================================
echo REINICIANDO FRONTEND - VENEZUELAN RAFFLE WEBSITE
echo ===============================================
echo.

REM Kill any existing node processes
echo Deteniendo procesos previos de node...
taskkill /F /IM node.exe >nul 2>&1

echo Esperando 2 segundos...
timeout /t 2 /nobreak > nul

echo Iniciando frontend en puerto 3001...
cd %~dp0\frontend
set PORT=3001
start cmd /k "npm start"

echo.
echo ===============================================
echo FRONTEND REINICIADO
echo.
echo Por favor, visita http://localhost:3001 para ver el sitio.
echo Los sorteos deberian aparecer sin necesidad del backend.
echo ===============================================
