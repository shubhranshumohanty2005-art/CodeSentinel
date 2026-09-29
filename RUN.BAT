@echo off
echo ============================================================
echo   CodeSentinel — Starting all services...
echo ============================================================
echo.
echo Starting Docker Compose (frontend + backend + redis)...
echo.
docker compose up --build
pause
