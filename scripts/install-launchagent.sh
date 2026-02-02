#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"
PORT_RAW="${CLAWNSOLE_PORT:-5173}"
PLIST_SRC="$INSTALL_DIR/scripts/clawnsole.launchagent.plist"
PLIST_DST="$HOME/Library/LaunchAgents/ai.openclaw.clawnsole.plist"
PATH_VALUE="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

if [[ "$PORT_RAW" =~ ^[0-9]+$ ]]; then
  PORT="$PORT_RAW"
else
  PORT="5173"
fi

mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$OPENCLAW_HOME/logs"

sed "s|\$HOME|$HOME|g" "$PLIST_SRC" | \
  sed "s|__PORT__|$PORT|g" | \
  sed "s|__PATH__|$PATH_VALUE|g" > "$PLIST_DST"

if ! plutil -p "$PLIST_DST" >/dev/null 2>&1; then
  echo "LaunchAgent plist is invalid: $PLIST_DST"
  exit 1
fi

USER_ID="$(id -u)"
LABEL="ai.openclaw.clawnsole"
DOMAIN_GUI="gui/$USER_ID"
DOMAIN_USER="user/$USER_ID"

launchctl bootout "$DOMAIN_GUI" "$PLIST_DST" >/dev/null 2>&1 || true
launchctl bootout "$DOMAIN_USER" "$PLIST_DST" >/dev/null 2>&1 || true

TARGET_DOMAIN="$DOMAIN_GUI"
if ! launchctl print "$DOMAIN_GUI" >/dev/null 2>&1; then
  TARGET_DOMAIN="$DOMAIN_USER"
fi

if ! launchctl bootstrap "$TARGET_DOMAIN" "$PLIST_DST" >/dev/null 2>&1; then
  echo "LaunchAgent bootstrap failed for $TARGET_DOMAIN. Trying legacy load..."
  launchctl load "$PLIST_DST" >/dev/null 2>&1 || true
fi

if launchctl print "$DOMAIN_GUI/$LABEL" >/dev/null 2>&1; then
  launchctl enable "$DOMAIN_GUI/$LABEL" >/dev/null 2>&1 || true
  launchctl kickstart -k "$DOMAIN_GUI/$LABEL" >/dev/null 2>&1 || true
elif launchctl print "$DOMAIN_USER/$LABEL" >/dev/null 2>&1; then
  launchctl enable "$DOMAIN_USER/$LABEL" >/dev/null 2>&1 || true
  launchctl kickstart -k "$DOMAIN_USER/$LABEL" >/dev/null 2>&1 || true
else
  echo "LaunchAgent not registered (yet). It should appear after login or a manual load."
fi

echo "LaunchAgent installed: $PLIST_DST (port $PORT)"
