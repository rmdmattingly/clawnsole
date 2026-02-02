#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"
PORT_RAW="${CLAWNSOLE_PORT:-5173}"
PLIST_SRC="$INSTALL_DIR/scripts/clawnsole-watchdog.launchagent.plist"
PLIST_DST="$HOME/Library/LaunchAgents/ai.openclaw.clawnsole-watchdog.plist"
PATH_VALUE="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

if [[ "$PORT_RAW" =~ ^[0-9]+$ ]]; then
  PORT="$PORT_RAW"
else
  PORT="5173"
fi

mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$OPENCLAW_HOME/logs"

sed "s|\$HOME|$HOME|g" "$PLIST_SRC" | \
  sed "s|__PATH__|$PATH_VALUE|g" > "$PLIST_DST"

USER_ID="$(id -u)"
LABEL="ai.openclaw.clawnsole-watchdog"
DOMAIN_GUI="gui/$USER_ID"
DOMAIN_USER="user/$USER_ID"

launchctl bootout "$DOMAIN_GUI" "$PLIST_DST" >/dev/null 2>&1 || true
launchctl bootout "$DOMAIN_USER" "$PLIST_DST" >/dev/null 2>&1 || true

if ! launchctl bootstrap "$DOMAIN_GUI" "$PLIST_DST" >/dev/null 2>&1; then
  launchctl bootstrap "$DOMAIN_USER" "$PLIST_DST" >/dev/null 2>&1 || true
fi

if launchctl print "$DOMAIN_GUI/$LABEL" >/dev/null 2>&1; then
  launchctl enable "$DOMAIN_GUI/$LABEL" >/dev/null 2>&1 || true
  launchctl kickstart -k "$DOMAIN_GUI/$LABEL" >/dev/null 2>&1 || true
elif launchctl print "$DOMAIN_USER/$LABEL" >/dev/null 2>&1; then
  launchctl enable "$DOMAIN_USER/$LABEL" >/dev/null 2>&1 || true
  launchctl kickstart -k "$DOMAIN_USER/$LABEL" >/dev/null 2>&1 || true
fi

echo "Watchdog installed: $PLIST_DST"
