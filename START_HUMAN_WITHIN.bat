@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 18 or later, then run this file again.
  pause
  exit /b 1
)
echo Human Within is starting.
echo Open http://localhost:3000 in your browser.
node server.js
pause
