#!/usr/bin/env bash
# AdmitBridge — start ML (8000), API server (5001) and frontend (5173),
# verify each health endpoint against OUR OWN process, and exit nonzero
# if any required service fails.
#
# Processes are fully detached (new session), tracked in .run/<svc>.pid,
# logs in .logs/<svc>.log. Idempotent: re-running skips services that are
# already running and healthy. Stop with ./stop.sh.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/.logs"
RUN_DIR="$ROOT/.run"

# Intended ports; override via env if they are unavailable
# (e.g. ML_PORT=8010 PORT=5010 CLIENT_PORT=5183 ./run-once.sh).
# Overrides are propagated to the server (ML_SERVICE_URL) and the client
# (VITE_API_URL) so API/ML wiring stays consistent.
ML_PORT="${ML_PORT:-8000}"
CLIENT_PORT="${CLIENT_PORT:-5173}"
# A "0" PORT (some sandboxes export it) would make Express pick a random port.
if [[ "${PORT:-}" == "0" ]]; then unset PORT; fi
API_PORT="${PORT:-5001}"

HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-30}"   # seconds to wait per service
HTTP_ERR=""

mkdir -p "$LOG_DIR" "$RUN_DIR"

info() { echo "[INFO] $*"; }
pass() { echo "[PASS] $*"; }
fail() { echo "[FAIL] $*"; }

# --- process / port helpers -------------------------------------------------

read_pid() { # service -> pid (empty if none)
  local f="$RUN_DIR/$1.pid" v=""
  [[ -f "$f" ]] && v="$(tr -dc '0-9' < "$f")"
  echo "$v"
}

pid_alive() { [[ -n "${1:-}" ]] && kill -0 "$1" 2>/dev/null; }
pid_cmd()   { ps -p "$1" -o command= 2>/dev/null | cut -c1-160; }
pid_cwd()   { lsof -a -d cwd -p "$1" -Fn 2>/dev/null | awk '/^n/{print substr($0,2); exit}'; }

in_root() { case "${1:-}" in "$ROOT"|"$ROOT"/*) return 0 ;; *) return 1 ;; esac; }

owns_port() { # port pid -> 0 if pid is a listener on port
  local pids p
  pids="$(lsof -t -nP -iTCP:"$1" -sTCP:LISTEN 2>/dev/null | sort -u)"
  for p in $pids; do [[ "$p" == "$2" ]] && return 0; done
  return 1
}

port_who() { # port -> "free" | "pid (cmd, cwd)"
  local pids p cmd cwd
  pids="$(lsof -t -nP -iTCP:"$1" -sTCP:LISTEN 2>/dev/null | sort -u)"
  [[ -z "$pids" ]] && { echo "free"; return; }
  p="${pids%% *}"
  cmd="$(pid_cmd "$p")"; cwd="$(pid_cwd "$p")"
  echo "$p (${cmd:-?} | cwd: ${cwd:-?})"
}

# --- spawn: double-fork into a new session so the service outlives this shell

spawn() { # service  workdir  cmd [args...]
  local svc="$1" cwd="$2"; shift 2
  local pidfile="$RUN_DIR/$svc.pid" logfile="$LOG_DIR/$svc.log"
  python3 - "$pidfile" "$logfile" "$cwd" "$@" <<'PY'
import os, sys
pidfile, logfile, cwd = sys.argv[1], sys.argv[2], sys.argv[3]
cmd = sys.argv[4:]

if os.fork() > 0:          # detach from the launching shell immediately
    os._exit(0)
os.setsid()                # new session + process group (survives shell exit/HUP)
if os.fork() > 0:          # classic double-fork so we cannot be a session leader
    os._exit(0)

os.chdir(cwd)
os.umask(0o022)
out = os.open(logfile, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
os.dup2(out, 1)
os.dup2(out, 2)
null = os.open(os.devnull, os.O_RDONLY)
os.dup2(null, 0)
with open(pidfile, "w") as f:
    f.write(str(os.getpid()))
try:
    os.execvp(cmd[0], cmd)
except Exception as exc:
    sys.stderr.write("failed to start %r: %s\n" % (cmd, exc))
    sys.stderr.flush()
    os._exit(127)
PY
}

wait_pidfile() { # service -> pid (waits briefly for the daemon to write it)
  local i v
  for i in 1 2 3 4 5 6 7 8 9 10; do
    v="$(read_pid "$1")"
    [[ -n "$v" ]] && { echo "$v"; return 0; }
    sleep 0.2
  done
  echo ""
}

# --- health checking --------------------------------------------------------

http_ok() { # url  expected-substring -> sets HTTP_ERR
  local url="$1" expect="$2" body="$RUN_DIR/.http-body" code
  if ! code="$(curl -s -m 3 -o "$body" -w '%{http_code}' "$url" 2>"$RUN_DIR/.http-err")"; then
    HTTP_ERR="request failed: $(tr '\n' ' ' < "$RUN_DIR/.http-err" | sed 's/  */ /g; s/ $//')"
    return 1
  fi
  if [[ "$code" != "200" ]]; then
    HTTP_ERR="HTTP $code from $url (body: $(head -c 160 "$body" | tr '\n' ' '))"
    return 1
  fi
  if ! grep -qF -- "$expect" "$body"; then
    HTTP_ERR="response from $url does not look like AdmitBridge (missing '$expect'): $(head -c 160 "$body" | tr '\n' ' ')"
    return 1
  fi
  HTTP_ERR=""
  return 0
}

tail_log() { # service
  local f="$LOG_DIR/$1.log"
  if [[ -s "$f" ]]; then
    echo "       --- last lines of $f ---"
    tail -n 8 "$f" | sed 's/^/       /'
  else
    echo "       (log $f is empty)"
  fi
}

wait_service() { # name  service  port  url  expect-substr
  local name="$1" svc="$2" port="$3" url="$4" expect="$5"
  local pid waited=0 reason=""
  pid="$(read_pid "$svc")"

  while (( waited < HEALTH_TIMEOUT )); do
    if ! pid_alive "$pid"; then
      fail "$name — process (pid ${pid:-?}) exited during startup"
      tail_log "$svc"
      return 1
    fi
    if owns_port "$port" "$pid"; then
      if http_ok "$url" "$expect"; then
        pass "$name"
        return 0
      fi
      reason="$HTTP_ERR"          # port is ours, but response not good yet
    else
      reason="port $port not yet served by our process (current: $(port_who "$port"))"
    fi
    sleep 1
    waited=$((waited + 1))
  done

  fail "$name — not healthy after ${HEALTH_TIMEOUT}s: ${reason:-unknown}"
  tail_log "$svc"
  return 1
}

# --- preflight --------------------------------------------------------------
# port_status <port> -> "free" | "ours:<pid>" | "foreign:<pid>:<cmd>:<cwd>"
port_status() {
  local pids p cwd cmd
  pids="$(lsof -t -nP -iTCP:"$1" -sTCP:LISTEN 2>/dev/null | sort -u)"
  [[ -z "$pids" ]] && { echo "free"; return; }
  for p in $pids; do
    cwd="$(pid_cwd "$p")"
    if ! in_root "$cwd"; then
      cmd="$(pid_cmd "$p")"
      echo "foreign:$p:$cmd:$cwd"
      return
    fi
  done
  echo "ours:${pids%% *}"
}

port_conflict_exit() { # port  status-string
  local port="$1" st="$2" pid cmd cwd
  pid="${st#foreign:}"; pid="${pid%%:*}"
  cmd="$(pid_cmd "$pid")"; cwd="$(pid_cwd "$pid")"
  fail "Port $port is occupied by another project's process — refusing to start."
  echo "       pid:  $pid"
  echo "       cmd:  ${cmd:-?}"
  echo "       cwd:  ${cwd:-?}"
  echo "       That process does not belong to $ROOT, so it was NOT killed."
  echo "       Free the port (stop that process yourself) and re-run this script."
  exit 2
}

# ============================== main ========================================

echo "Starting AdmitBridge services."
echo ""
info "Project root: $ROOT"

# 1) dependency preflight
rc=0
if [[ ! -x "$ROOT/ml/venv/bin/python3" ]]; then
  fail "ML venv missing: $ROOT/ml/venv (run: cd ml && python3 -m venv venv && venv/bin/pip install -r requirements.txt)"
  rc=1
elif ! "$ROOT/ml/venv/bin/python3" -c 'import uvicorn, fastapi' 2>/dev/null; then
  fail "ML venv is missing dependencies (run: ml/venv/bin/pip install -r ml/requirements.txt)"
  rc=1
fi
[[ -f "$ROOT/server/server.js" ]] || { fail "server/server.js not found"; rc=1; }
[[ -d "$ROOT/server/node_modules" ]] || { fail "server/node_modules missing (run: cd server && npm install)"; rc=1; }
[[ -x "$ROOT/client/node_modules/.bin/vite" ]] || { fail "client/node_modules missing (run: cd client && npm install)"; rc=1; }
if (( rc != 0 )); then exit 3; fi

# 2) port preflight — never touch processes from outside this project
# per-service state: "start" | "running:<pid>" | "adopt:<pid>"
state_ml="start"; state_server="start"; state_client="start"
for spec in "ml:$ML_PORT" "server:$API_PORT" "client:$CLIENT_PORT"; do
  svc="${spec%%:*}"; port="${spec##*:}"
  st="$(port_status "$port")"
  case "$st" in
    free) st="start" ;;
    ours:*)
      pid="${st#ours:}"
      tracked="$(read_pid "$svc")"
      if [[ "$tracked" == "$pid" ]]; then
        st="running:$pid"
      else
        st="adopt:$pid"
        echo "$pid" > "$RUN_DIR/$svc.pid"
      fi
      ;;
    *) port_conflict_exit "$port" "$st" ;;
  esac
  case "$svc" in
    ml)     state_ml="$st" ;;
    server) state_server="$st" ;;
    client) state_client="$st" ;;
  esac
done

# 3) start whatever is not already running
if [[ "$state_ml" == "start" ]]; then
  info "Starting ML service on port $ML_PORT..."
  spawn ml "$ROOT/ml" "$ROOT/ml/venv/bin/python3" -m uvicorn app:app \
        --app-dir "$ROOT/ml" --port "$ML_PORT" --host 127.0.0.1
  pid="$(wait_pidfile ml)" || true
  [[ -z "$pid" ]] && { fail "ML service: could not record a pid"; tail_log ml; exit 4; }
else
  info "ML service already running (pid ${state_ml#*:}) — skipping start"
fi

if [[ "$state_server" == "start" ]]; then
  info "Starting API server on port $API_PORT..."
  spawn server "$ROOT/server" env PORT="$API_PORT" \
        ML_SERVICE_URL="${ML_SERVICE_URL:-http://127.0.0.1:$ML_PORT}" node server.js
  pid="$(wait_pidfile server)" || true
  [[ -z "$pid" ]] && { fail "API server: could not record a pid"; tail_log server; exit 4; }
else
  info "API server already running (pid ${state_server#*:}) — skipping start"
fi

if [[ "$state_client" == "start" ]]; then
  info "Starting frontend on port $CLIENT_PORT..."
  spawn client "$ROOT/client" env \
        PORT="$API_PORT" \
        VITE_API_URL="${VITE_API_URL:-http://localhost:$API_PORT/api}" \
        "$ROOT/client/node_modules/.bin/vite" --port "$CLIENT_PORT" --strictPort
  pid="$(wait_pidfile client)" || true
  [[ -z "$pid" ]] && { fail "Frontend: could not record a pid"; tail_log client; exit 4; }
else
  info "Frontend already running (pid ${state_client#*:}) — skipping start"
fi

# 4) health checks — a response only counts if OUR process serves the port
echo ""
echo "=== Health Checks ==="
failed=0
wait_service "ML service"   ml      "$ML_PORT"   "http://127.0.0.1:$ML_PORT/health"           '"admitbridge-ml"'   || failed=1
wait_service "API server"   server  "$API_PORT"  "http://127.0.0.1:$API_PORT/api/health"       '"admitbridge-server"' || failed=1
# Vite 8 listens on ::1 only, so "localhost" (not 127.0.0.1) is the reliable host.
wait_service "Frontend"     client  "$CLIENT_PORT" "http://localhost:$CLIENT_PORT/"            '<title>AdmitBridge</title>' || failed=1

echo ""
if (( failed != 0 )); then
  echo "Startup FAILED — one or more services are not healthy."
  echo "Logs: $LOG_DIR/"
  exit 1
fi

echo "All AdmitBridge services are healthy."
echo ""
echo "ML PID: $(read_pid ml) | API PID: $(read_pid server) | Frontend PID: $(read_pid client)"
echo ""
echo "Logs: .logs/"
