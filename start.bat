@echo off
echo Starting Tomato Admin Panel...

echo.
echo [1/2] Starting Backend on http://localhost:4000
start "Backend - Port 4000" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Admin Frontend on http://localhost:5173
start "Admin Frontend - Port 5173" cmd /k "cd /d %~dp0.vscode\admin && npm run dev"

echo.
echo Both servers starting...
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo.
pause
