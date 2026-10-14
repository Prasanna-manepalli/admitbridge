#!/usr/bin/env bash
# AdmitBridge — start all three services (client, server, ML) with logs.
# Usage: ./start.sh [--no-ml]   (--no-ml skips the Python ML service)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/.logs"
mkdir -p "$LOG_DIR"

# Fix: some sandbox environments set PORT=0 — treat as unset
if [[ "${PORT:-}" == "0" || -z "${PORT:-}" ]]; then
  PORT=5001
fi

echo "▶ Starting AdmitBridge services (logs in $LOG_DIR) ..."

# Use screen for persistent background processes if available
USE_SCREEN=false
if command -v screen &>/dev/null; then
  USE_SCREEN=true
fi

start_process() {
  local name="$1"
  shift
  if $USE_SCREEN; then
    screen -S "$name" -X quit 2>/dev/null || true
    screen -dmS "$name" bash -c "$* >> \"$LOG_DIR/$name.log\" 2>&1"
  else
    (nohup "$@" >> "$LOG_DIR/$name.log" 2>&1 &)
  fi
}

# 1) ML service (Python / FastAPI)
if [[ "${1:-}" != "--no-ml" ]]; then
  if [[ ! -x "$ROOT/ml/venv/bin/uvicorn" ]]; then
    echo "  ml: no venv found — creating it and installing dependencies ..."
    (cd "$ROOT/ml" && python3 -m venv venv && ./venv/bin/pip install -q -r requirements.txt)
  fi
  start_process ml "cd $ROOT/ml && ./venv/bin/uvicorn app:app --port 8000"
  echo "  ml       → http://localhost:8000  (log: $LOG_DIR/ml.log)"
else
  echo "  ml       → skipped"
fi

# 2) Express server
start_process srv "cd $ROOT/server && PORT=$PORT node server.js"
echo "  server   → http://localhost:$PORT  (log: $LOG_DIR/server.log)"

# 3) React client (Vite)
start_process cli "cd $ROOT/client && npm run dev"
echo "  client   → http://localhost:5173  (log: $LOG_DIR/client.log)"

# Wait for services to start
echo ""
echo "Waiting for services to start..."
sleep 5

echo ""
echo "Health checks:"
curl -s -m 3 http://localhost:8000/health && echo "  ✓ ML service" || echo "  ✗ ML service"
curl -s -m 3 "http://localhost:$PORT/api/health" && echo "  ✓ API server" || echo "  ✗ API server"
curl -s -m 3 -o /dev/null -w "  ✓ client (HTTP %{http_code})\n" http://localhost:5173/ || echo "  ✗ client"

echo ""
echo "Open http://localhost:5173 — seed login (run 'cd server && npm run seed' first if needed):"
echo "  student@admitbridge.com / password123"
echo "  admin@admitbridge.com   / password123"
echo "  consultant@admitbridge.com / password123"
echo ""
echo "Stop everything with: ./stop.sh"
