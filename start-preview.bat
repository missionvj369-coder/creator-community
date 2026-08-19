@echo off
cd /d "%~dp0"
echo Starting Living Creation Intelligence Preview...
echo.
echo API Server will start at http://localhost:3001
echo Web UI will be available at http://localhost:3001
echo.
echo Features:
echo   - Intention Processing (AI-powered project generation)
echo   - System Diagnostics (hardware detection)
echo   - Tool Discovery (14 open-source tools)
echo   - GitHub Integration (OAuth + repository creation)
echo.
echo Press Ctrl+C to stop the server
echo.
 
npx tsx src/api/server.ts
 
pause
