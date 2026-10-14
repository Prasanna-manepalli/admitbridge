#!/usr/bin/env bash
# AdmitBridge — stop ONLY the services started by run-once.sh (this project).
#
# Services are tracked in .run/<svc>.pid. Before killing anything we verify
# that the PID is alive, that its command matches the expected service, and
# that its working directory is inside this project — so processes belonging
# to other projects (or unrelated processes that reused a PID) are never
# touched. Idempotent: safe to run when nothing is running.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="$ROOT/.run"
LOG_DIR="$ROOT/.logs"

read_pid() {
  local f="$RUN_DIR/$1.pid" v=""
  [[ -f "$f" ]] && v="$(tr -dc '0-9' < "$f")"
  echo "$v"
}
pid_cmd() { ps -p "$1" -o command= 2>/dev/null | cut -c1-160; }
pid_cwd() { lsof -a -d cwd -p "$1" -Fn 2>/dev/null | awk '/^n/{print substr($0,2); exit}'; }
in_root() { case "${1:-}" in "$ROOT"|"$ROOT"/*) return 0 ;; *) return 1 ;; esac; }

port_still_busy() { # port -> empty if free, else who holds it
  local pids p
  pids="$(lsof -t -nP -iTCP:"$1" -sTCP:LISTEN 2>/dev/null | sort -u)"
  [[ -z "$pids" ]] && return 0
  p="${pids%% *}"
  echo "$p ($(pid_cmd "$p"))"
}

stopped=0; skipped=0; warned=0

stop_svc() { # service  expected-command-substring
  local svc="$1" expect="$2" pid cmd cwd i
  pid="$(read_pid "$svc")"

  if [[ -z "$pid" ]]; then
    echo "[SKIP] $svc: not running (no pid file)"
    skipped=$((skipped + 1)); return 0
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    rm -f "$RUN_DIR/$svc.pid"
    echo "[SKIP] $svc: stale pid file removed (pid $pid was not running)"
    skipped=$((skipped + 1)); return 0
  fi

  # Ownership checks — refuse to kill anything we cannot verify.
  cmd="$(pid_cmd "$pid")"
  cwd="$(pid_cwd "$pid")"
  case "$cmd" in
    *"$expect"*) ;;
    *)
      echo "[WARN] $svc: pid $pid command does not look like '$expect' — refusing to kill."
      echo "       cmd: ${cmd:-?}"
      warned=$((warned + 1)); return 1
      ;;
  esac
  if ! in_root "$cwd"; then
    echo "[WARN] $svc: pid $pid cwd (${cwd:-?}) is outside $ROOT — refusing to kill."
    warned=$((warned + 1)); return 1
  fi

  kill "$pid" 2>/dev/null
  for i in 1 2 3 4 5 6 7 8 9 10; do
    kill -0 "$pid" 2>/dev/null || break
    sleep 1
  done
  if kill -0 "$pid" 2>/dev/null; then
    kill -9 "$pid" 2>/dev/null
    sleep 1
  fi
  rm -f "$RUN_DIR/$svc.pid"

  if kill -0 "$pid" 2>/dev/null; then
    echo "[FAIL] $svc: pid $pid is still alive after SIGKILL"
    warned=$((warned + 1)); return 1
  fi
  echo "[OK]   $svc stopped (pid $pid)"
  stopped=$((stopped + 1))
}

# Stop in reverse start order: frontend, API server, ML.
stop_svc client "vite"
stop_svc server "server.js"
stop_svc ml     "uvicorn"

# Report anything still holding our ports (must NOT be killed here).
echo ""
# Keep in sync with run-once.sh defaults (env overrides work for both scripts).
ML_PORT="${ML_PORT:-8000}"; API_PORT="${PORT:-5001}"; CLIENT_PORT="${CLIENT_PORT:-5173}"
if [[ "${PORT:-}" == "0" ]]; then API_PORT=5001; fi

busy=0
for spec in "ML:$ML_PORT" "API:$API_PORT" "Frontend:$CLIENT_PORT"; do
  name="${spec%%:*}"; port="${spec##*:}"
  who="$(port_still_busy "$port")"
  if [[ -n "$who" ]]; then
    echo "[WARN] port $port ($name) is still occupied by: $who"
    busy=$((busy + 1))
  fi
done

echo ""
if (( busy > 0 )); then
  echo "Note: the processes above were NOT started by this script and were not touched."
fi
if (( warned > 0 )); then
  echo "Finished with warnings: $warned service(s) could not be stopped safely."
  exit 1
fi
echo "Stopped $stopped service(s); $skipped were already stopped."
echo "Logs remain in: $LOG_DIR/"
exit 0
