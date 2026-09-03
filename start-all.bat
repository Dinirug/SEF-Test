@echo off
echo ========================================================
echo   Launching UniReserve University Equipment Platform
echo ========================================================
echo.
start "UniReserve Backend API" cmd /k "cd /d "%~dp0backend\UniReserve.Api" && dotnet run --launch-profile http"
start "UniReserve Frontend (React)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host"
echo Backend starting at: http://localhost:5000/swagger
echo Frontend starting at: http://localhost:3000
echo.
