@echo off
echo Starting Food Dev...

echo.
echo [1/2] Starting Backend on http://localhost:4000
start "Backend - Port 4000" cmd /k "cd /d %~dp0backend && npm install && node server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend on http://localhost:5173
start "Frontend - Port 5173" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo Both servers starting...
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo.
pause
