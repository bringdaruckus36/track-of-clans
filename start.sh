#!/bin/sh
set -e

echo "===================================================="
echo " Starting Clash of Clans Tracker WebApp"
echo "===================================================="

if command -v docker >/dev/null 2>&1; then
    echo "[INFO] Docker detected! Starting containers with Docker Compose..."
    docker compose up --build -d
    echo ""
    echo "[SUCCESS] WebApp started in Docker container!"
    echo "Open your browser at: http://localhost:3000"
    exit 0
fi

if command -v node >/dev/null 2>&1; then
    echo "[INFO] Starting server via local Node.js..."
    exec node src/server.js
fi

echo "[ERROR] Neither Docker nor Node.js were found. Please install Docker or Node.js to run the application."
exit 1
