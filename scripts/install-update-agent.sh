#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"
UPDATE_INTERVAL_SECONDS="${CLAWNSOLE_UPDATE_INTERVAL_SECONDS:-21600}"
PLIST_SRC="$INSTALL_DIR/scripts/clawnsole-updater.launchagent.plist"
PLIST_DST="$HOME/Library/LaunchAgents/ai.openclaw.clawnsole-updater.plist"

mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$OPENCLAW_HOME/logs"

sed "s|\$HOME|$HOME|g" "$PLIST_SRC" | \
  sed "s|<integer>21600</integer>|<integer>${UPDATE_INTERVAL_SECONDS}</integer>|" > "$PLIST_DST"

USER_ID="$(id -u)"
LABEL="ai.openclaw.clawnsole-updater"
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

echo "Updater LaunchAgent installed: $PLIST_DST (interval ${UPDATE_INTERVAL_SECONDS}s)"
