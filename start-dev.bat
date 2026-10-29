@echo off
title KEY Institute - PAA Simulator Dev Server
cd /d "%~dp0"

echo ===================================================
echo   KEY INSTITUTE - PAA Simulator (Development)
echo ===================================================
echo.

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo Starting Vite development server and opening browser...
echo Press Ctrl+C or close this window to stop the server.
echo.
call npm run dev
pause
