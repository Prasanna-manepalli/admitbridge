#!/usr/bin/env bash
# Start AdmitBridge services in screen sessions
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/.logs"
mkdir -p "$LOG_DIR"
PORT="${PORT:-5001}"

echo "Starting AdmitBridge services..."

# Kill old screens
screen -S ml -X quit 2>/dev/null || true
screen -S server -X quit 2>/dev/null || true
screen -S client -X quit 2>/dev/null || true

# ML service
screen -dmS ml bash -c "cd $ROOT/ml && ./venv/bin/uvicorn app:app --port 8000 > $LOG_DIR/ml.log 2>&1"
echo "  ML → http://localhost:8000 (screen: ml)"

# Server
screen -dmS server bash -c "cd $ROOT/server && PORT=$PORT node server.js > $LOG_DIR/server.log 2>&1"
echo "  Server → http://localhost:$PORT (screen: server)"

# Client
screen -dmS client bash -c "cd $ROOT/client && npm run dev > $LOG_DIR/client.log 2>&1"
echo "  Client → http://localhost:5173 (screen: client)"

sleep 5

echo ""
echo "=== Health Checks ==="
curl -s -m 3 http://localhost:8000/health && echo "  ✓ ML service" || echo "  ✗ ML service"
curl -s -m 3 "http://localhost:$PORT/api/health" && echo "  ✓ API server" || echo "  ✗ API server"
curl -s -m 3 -o /dev/null -w "  ✓ Client (HTTP %{http_code})\n" http://localhost:5173/ || echo "  ✗ Client"
echo ""
echo "Stop with: screen -S ml -X quit; screen -S server -X quit; screen -S client -X quit"
