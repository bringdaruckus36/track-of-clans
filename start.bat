@echo off
echo ====================================================
echo  Starting Clash of Clans Tracker WebApp
echo ====================================================

REM Check if Docker is available
where docker >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Docker detected! Starting containers with Docker Compose...
    docker compose up --build -d
    if %ERRORLEVEL% equ 0 (
        echo.
        echo [SUCCESS] WebApp started in Docker container!
        echo Open your browser at: http://localhost:3000
        pause
        exit /b 0
    )
)

REM Fallback local launch
echo [INFO] Docker not found or not running. Checking Node.js runtime...
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Starting server via local Node.js...
    node src/server.js
    exit /b 0
)

echo [ERROR] Neither Docker nor Node.js were found in system PATH.
echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
pause
exit /b 1
