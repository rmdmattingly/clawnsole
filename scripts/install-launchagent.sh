#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"
PORT="${CLAWNSOLE_PORT:-5173}"
PLIST_SRC="$INSTALL_DIR/scripts/clawnsole.launchagent.plist"
PLIST_DST="$HOME/Library/LaunchAgents/ai.openclaw.clawnsole.plist"
PATH_VALUE="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$OPENCLAW_HOME/logs"

sed "s|\$HOME|$HOME|g" "$PLIST_SRC" | \
  sed "s|__PORT__|$PORT|g" | \
  sed "s|__PATH__|$PATH_VALUE|g" > "$PLIST_DST"

launchctl unload "$PLIST_DST" >/dev/null 2>&1 || true
launchctl load "$PLIST_DST"

launchctl kickstart -k gui/$(id -u)/ai.openclaw.clawnsole || true

echo "LaunchAgent installed: $PLIST_DST (port $PORT)"
