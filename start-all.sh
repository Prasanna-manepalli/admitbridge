#!/usr/bin/env bash
# Start all services and keep running
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/.logs"
mkdir -p "$LOG_DIR"
PORT="${PORT:-5001}"

echo "Starting ML service..."
(cd "$ROOT/ml" && nohup ./venv/bin/uvicorn app:app --port 8000 > "$LOG_DIR/ml.log" 2>&1 &)

echo "Starting server..."
(cd "$ROOT/server" && PORT="$PORT" nohup node server.js > "$LOG_DIR/server.log" 2>&1 &)

echo "Starting client..."
(cd "$ROOT/client" && nohup npm run dev > "$LOG_DIR/client.log" 2>&1 &)

sleep 5

echo ""
echo "=== Health Checks ==="
curl -s -m 3 http://localhost:8000/health && echo "  ✓ ML service" || echo "  ✗ ML service"
curl -s -m 3 "http://localhost:$PORT/api/health" && echo "  ✓ API server" || echo "  ✗ API server"  
curl -s -m 3 -o /dev/null -w "  ✓ Client (HTTP %{http_code})\n" http://localhost:5173/ || echo "  ✗ Client"

echo ""
echo "All services started. Logs in $LOG_DIR/"
echo "  ML:     http://localhost:8000"
echo "  Server: http://localhost:$PORT"
echo "  Client: http://localhost:5173"
echo ""
echo "Run ./stop.sh to stop all services."
