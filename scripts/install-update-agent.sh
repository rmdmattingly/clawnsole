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

UID="$(id -u)"
LABEL="ai.openclaw.clawnsole-updater"

launchctl bootout "gui/$UID" "$PLIST_DST" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$UID" "$PLIST_DST"
launchctl enable "gui/$UID/$LABEL" >/dev/null 2>&1 || true
launchctl kickstart -k "gui/$UID/$LABEL" >/dev/null 2>&1 || true

echo "Updater LaunchAgent installed: $PLIST_DST (interval ${UPDATE_INTERVAL_SECONDS}s)"
