#!/usr/bin/env bash
set -euo pipefail

PORT="${CLAWNSOLE_PORT:-5173}"

if ! pgrep -f "openclaw" >/dev/null 2>&1; then
  exit 0
fi

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  exit 0
fi

USER_ID="$(id -u)"
launchctl kickstart -k "gui/$USER_ID/ai.openclaw.clawnsole" >/dev/null 2>&1 || true
launchctl kickstart -k "user/$USER_ID/ai.openclaw.clawnsole" >/dev/null 2>&1 || true
