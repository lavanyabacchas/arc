#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "============================================================"
echo "  ARC — AI-Powered Critical Infrastructure Cybersecurity   "
echo "============================================================"
echo ""

# Ensure Python Virtualenv exists
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment in backend/venv..."
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# Ensure Frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm --prefix frontend install
fi

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Shutting down ARC services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "Starting ARC FastAPI Backend on http://127.0.0.1:8000..."
cd "$DIR/backend"
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd "$DIR"

echo "Starting ARC Vite Frontend on http://localhost:5173..."
npm --prefix frontend run dev &
FRONTEND_PID=$!

echo ""
echo "============================================================"
echo "  ARC SOC Platform is Running!"
echo "  - Web Dashboard:     http://localhost:5173"
echo "  - Interactive APIs:  http://127.0.0.1:8000/docs"
echo "  - Environment:       SIMULATION ENVIRONMENT (Safe Sandbox)"
echo "============================================================"
echo "Press Ctrl+C to stop all services."

wait
