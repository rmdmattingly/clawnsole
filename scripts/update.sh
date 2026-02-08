#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"
STATE_PATH="${CLAWNSOLE_STATE_PATH:-$OPENCLAW_HOME/clawnsole-install.json}"
HOSTNAME="${CLAWNSOLE_LOCAL_HOSTNAME:-clawnsole}"

if [ ! -d "$INSTALL_DIR/.git" ]; then
  echo "Clawnsole not found at $INSTALL_DIR"
  exit 1
fi

cd "$INSTALL_DIR"

echo "Updating Clawnsole (git pull + npm ci)..."
git pull --ff-only
npm ci --silent || npm ci

# Determine blue/green ports.
# Prefer reading from ~/.openclaw/clawnsole-install.json, but initialize defaults if missing.
STATE_JSON="$(CLAWNSOLE_STATE_PATH="$STATE_PATH" node "$INSTALL_DIR/scripts/bluegreen-state.mjs" get 2>/dev/null || echo '{}')"
ACTIVE_PORT="$(node -e 'let s={}; try{s=JSON.parse(process.argv[1])}catch{}; process.stdout.write(String((s&&s.activePort)||5173));' "$STATE_JSON")"
PORT_A="$(node -e 'let s={}; try{s=JSON.parse(process.argv[1])}catch{}; process.stdout.write(String((s&&s.ports&&s.ports[0])||5173));' "$STATE_JSON")"
PORT_B="$(node -e 'let s={}; try{s=JSON.parse(process.argv[1])}catch{}; process.stdout.write(String((s&&s.ports&&s.ports[1])||5175));' "$STATE_JSON")"

if [ -z "$PORT_A" ] || [ -z "$PORT_B" ]; then
  PORT_A="5173"
  PORT_B="5175"
fi

if [ -z "$ACTIVE_PORT" ]; then
  ACTIVE_PORT="$PORT_A"
fi

# Ensure the state file is initialized for next time.
CLAWNSOLE_STATE_PATH="$STATE_PATH" CLAWNSOLE_PORT_A="$PORT_A" CLAWNSOLE_PORT_B="$PORT_B" CLAWNSOLE_ACTIVE_PORT="$ACTIVE_PORT" \
  node "$INSTALL_DIR/scripts/bluegreen-state.mjs" init "$PORT_A" "$PORT_B" "$ACTIVE_PORT" >/dev/null 2>&1 || true

if [ "$ACTIVE_PORT" = "$PORT_A" ]; then
  NEXT_PORT="$PORT_B"
else
  NEXT_PORT="$PORT_A"
fi

echo "Active port: $ACTIVE_PORT"
echo "Staging next version on: $NEXT_PORT"

# Start next instance (staging) directly. This avoids touching the primary port until cutover.
LOG_OUT="$OPENCLAW_HOME/logs/clawnsole.$NEXT_PORT.out.log"
LOG_ERR="$OPENCLAW_HOME/logs/clawnsole.$NEXT_PORT.err.log"
PID_FILE="$OPENCLAW_HOME/clawnsole.$NEXT_PORT.pid"
mkdir -p "$OPENCLAW_HOME/logs"

# If something is already listening on NEXT_PORT, try to stop it.
if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$NEXT_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $NEXT_PORT already in use; attempting to stop existing listener..."
  EXISTING_PID="$(lsof -nP -iTCP:"$NEXT_PORT" -sTCP:LISTEN -t 2>/dev/null | head -n 1 || true)"
  if [ -n "$EXISTING_PID" ]; then
    kill "$EXISTING_PID" >/dev/null 2>&1 || true
    sleep 0.3
  fi
fi

# Launch staging instance
( PORT="$NEXT_PORT" CLAWNSOLE_INSTANCE="prod" nohup node server.js >"$LOG_OUT" 2>"$LOG_ERR" & echo $! >"$PID_FILE" )

cleanup_staging() {
  if [ -f "$PID_FILE" ]; then
    local pid
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [ -n "$pid" ]; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  fi
}

trap 'echo "Update failed; stopping staging instance on port $NEXT_PORT"; cleanup_staging' ERR

# Health check
echo "Waiting for /meta on 127.0.0.1:$NEXT_PORT..."
OK="false"
for i in {1..30}; do
  if curl -fsS "http://127.0.0.1:$NEXT_PORT/meta" >/dev/null 2>&1; then
    OK="true"
    break
  fi
  sleep 0.2
done

if [ "$OK" != "true" ]; then
  echo "Staging instance failed to become healthy on port $NEXT_PORT"
  echo "Logs: $LOG_ERR"
  exit 1
fi

# Guardrail: verify login/token behavior on the staging instance BEFORE cutover.
# This catches the class of regressions where /auth/login or cookie parsing breaks.
if command -v node >/dev/null 2>&1; then
  echo "Verifying login flow on staging instance (port $NEXT_PORT)..."
  node "$INSTALL_DIR/scripts/verify-login.js" --base-url "http://127.0.0.1:$NEXT_PORT" --role admin
else
  echo "Warning: node not found; skipping verify-login guardrail"
fi

# Flip Caddy upstream by rewriting the Caddyfile and restarting the daemon.
if [ -f "$INSTALL_DIR/scripts/Caddyfile" ]; then
  sed "s|__PORT__|$NEXT_PORT|g" "$INSTALL_DIR/scripts/Caddyfile" > "$INSTALL_DIR/Caddyfile"
  echo "Switching Caddy reverse proxy to $HOSTNAME.local -> 127.0.0.1:$NEXT_PORT"
  sudo launchctl kickstart -k system/ai.openclaw.clawnsole-caddy >/dev/null 2>&1 || true
fi

# Mark active port in state.
CLAWNSOLE_STATE_PATH="$STATE_PATH" CLAWNSOLE_ACTIVE_PORT="$NEXT_PORT" node "$INSTALL_DIR/scripts/bluegreen-state.mjs" set-active "$NEXT_PORT" >/dev/null || true

# Stop old active port listener (best-effort).
if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$ACTIVE_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  OLD_PID="$(lsof -nP -iTCP:"$ACTIVE_PORT" -sTCP:LISTEN -t 2>/dev/null | head -n 1 || true)"
  if [ -n "$OLD_PID" ]; then
    echo "Stopping old instance on port $ACTIVE_PORT (pid $OLD_PID)"
    kill "$OLD_PID" >/dev/null 2>&1 || true
  fi
fi

trap - ERR

echo "Update complete. Active port is now $NEXT_PORT (via Caddy)."
