#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"
STATE_PATH="${CLAWNSOLE_STATE_PATH:-$OPENCLAW_HOME/clawnsole-install.json}"
PLIST_AGENT="$HOME/Library/LaunchAgents/ai.openclaw.clawnsole.plist"
PLIST_UPDATER="$HOME/Library/LaunchAgents/ai.openclaw.clawnsole-updater.plist"
PLIST_DAEMON="/Library/LaunchDaemons/ai.openclaw.clawnsole-caddy.plist"

launchctl unload "$PLIST_AGENT" >/dev/null 2>&1 || true
launchctl unload "$PLIST_UPDATER" >/dev/null 2>&1 || true
rm -f "$PLIST_AGENT" "$PLIST_UPDATER"

if [ -f "$PLIST_DAEMON" ]; then
  sudo launchctl unload "$PLIST_DAEMON" >/dev/null 2>&1 || true
  sudo rm -f "$PLIST_DAEMON"
fi

if command -v node >/dev/null 2>&1; then
  OPENCLAW_CONFIG="$OPENCLAW_HOME/openclaw.json" CLAWNSOLE_STATE_PATH="$STATE_PATH" \
    node "$INSTALL_DIR/scripts/uninstall.mjs" || true
fi

if [ -f "$STATE_PATH" ]; then
  PREV_LOCAL=$(node -e "const s=require(process.argv[1]);console.log(s.prevLocalHostName||'')" "$STATE_PATH" 2>/dev/null || true)
  PREV_HOST=$(node -e "const s=require(process.argv[1]);console.log(s.prevHostName||'')" "$STATE_PATH" 2>/dev/null || true)
  PREV_COMP=$(node -e "const s=require(process.argv[1]);console.log(s.prevComputerName||'')" "$STATE_PATH" 2>/dev/null || true)
  CADDY_INSTALLED=$(node -e "const s=require(process.argv[1]);console.log(s.caddyInstalledByScript===true)" "$STATE_PATH" 2>/dev/null || true)

  if [ -n "$PREV_LOCAL" ]; then
    sudo scutil --set LocalHostName "$PREV_LOCAL" || true
  fi
  if [ -n "$PREV_HOST" ]; then
    sudo scutil --set HostName "$PREV_HOST" || true
  fi
  if [ -n "$PREV_COMP" ]; then
    sudo scutil --set ComputerName "$PREV_COMP" || true
  fi

  if [ "$CADDY_INSTALLED" = "true" ]; then
    read -r -p "Uninstall Caddy (installed by Clawnsole)? [y/N]: " REMOVE_CADDY
    REMOVE_CADDY="${REMOVE_CADDY:-N}"
    if [[ "$REMOVE_CADDY" =~ ^[Yy]$ ]]; then
      brew uninstall caddy || true
    fi
  fi
fi

read -r -p "Remove Clawnsole files at $INSTALL_DIR? [y/N]: " REMOVE_FILES
REMOVE_FILES="${REMOVE_FILES:-N}"
if [[ "$REMOVE_FILES" =~ ^[Yy]$ ]]; then
  rm -rf "$INSTALL_DIR"
fi

echo "Clawnsole uninstall complete."
