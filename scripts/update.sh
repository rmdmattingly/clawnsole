#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"

if [ ! -d "$INSTALL_DIR/.git" ]; then
  echo "Clawnsole not found at $INSTALL_DIR"
  exit 1
fi

echo "Updating Clawnsole..."
git -C "$INSTALL_DIR" pull --ff-only

if [ -f "$HOME/Library/LaunchAgents/ai.openclaw.clawnsole.plist" ]; then
  launchctl unload "$HOME/Library/LaunchAgents/ai.openclaw.clawnsole.plist" >/dev/null 2>&1 || true
  launchctl load "$HOME/Library/LaunchAgents/ai.openclaw.clawnsole.plist"
  launchctl kickstart -k gui/$(id -u)/ai.openclaw.clawnsole || true
  echo "LaunchAgent restarted"
else
  echo "LaunchAgent not found; run npm run dev manually if needed"
fi

echo "Update complete."
