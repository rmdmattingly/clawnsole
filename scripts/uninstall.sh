#!/usr/bin/env bash
set -euo pipefail

VERSION="2026-02-02.4"

echo "Clawnsole uninstall ${VERSION}"

OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"
STATE_PATH="${CLAWNSOLE_STATE_PATH:-$OPENCLAW_HOME/clawnsole-install.json}"
PLIST_AGENT="$HOME/Library/LaunchAgents/ai.openclaw.clawnsole.plist"
PLIST_UPDATER="$HOME/Library/LaunchAgents/ai.openclaw.clawnsole-updater.plist"
PLIST_WATCHDOG="$HOME/Library/LaunchAgents/ai.openclaw.clawnsole-watchdog.plist"
PLIST_DAEMON="/Library/LaunchDaemons/ai.openclaw.clawnsole-caddy.plist"

prompt_yes_no() {
  local message="$1"
  local default="$2"
  local reply=""
  if [ -r /dev/tty ]; then
    read -r -p "$message" reply < /dev/tty || true
  fi
  reply="${reply:-$default}"
  case "$reply" in
    [Yy]*) return 0 ;;
    *) return 1 ;;
  esac
}

USER_ID="$(id -u)"
launchctl bootout "gui/$USER_ID" "$PLIST_AGENT" >/dev/null 2>&1 || true
launchctl bootout "gui/$USER_ID" "$PLIST_UPDATER" >/dev/null 2>&1 || true
launchctl bootout "gui/$USER_ID" "$PLIST_WATCHDOG" >/dev/null 2>&1 || true
launchctl disable "gui/$USER_ID/ai.openclaw.clawnsole" >/dev/null 2>&1 || true
launchctl disable "gui/$USER_ID/ai.openclaw.clawnsole-updater" >/dev/null 2>&1 || true
launchctl disable "gui/$USER_ID/ai.openclaw.clawnsole-watchdog" >/dev/null 2>&1 || true
rm -f "$PLIST_AGENT" "$PLIST_UPDATER" "$PLIST_WATCHDOG"

if [ -f "$PLIST_DAEMON" ]; then
  if [ -r /dev/tty ]; then
    sudo -v || true
  fi
  sudo launchctl unload "$PLIST_DAEMON" >/dev/null 2>&1 || true
  sudo rm -f "$PLIST_DAEMON" || true
fi

CONFIG_PATH="$OPENCLAW_HOME/clawnsole.json"

if command -v node >/dev/null 2>&1; then
  if [ -f "$INSTALL_DIR/scripts/uninstall.mjs" ]; then
    CLAWNSOLE_CONFIG="$CONFIG_PATH" CLAWNSOLE_STATE_PATH="$STATE_PATH" \
      node "$INSTALL_DIR/scripts/uninstall.mjs" || true
  else
    node -e "const fs=require('fs');const p=process.argv[1];if(fs.existsSync(p)) fs.unlinkSync(p);" "$CONFIG_PATH" || true
  fi
fi

if [ -f "$STATE_PATH" ]; then
  PREV_LOCAL=$(node -e "const s=require(process.argv[1]);console.log(s.prevLocalHostName||'')" "$STATE_PATH" 2>/dev/null || true)
  PREV_HOST=$(node -e "const s=require(process.argv[1]);console.log(s.prevHostName||'')" "$STATE_PATH" 2>/dev/null || true)
  PREV_COMP=$(node -e "const s=require(process.argv[1]);console.log(s.prevComputerName||'')" "$STATE_PATH" 2>/dev/null || true)
  CADDY_INSTALLED=$(node -e "const s=require(process.argv[1]);console.log(s.caddyInstalledByScript===true)" "$STATE_PATH" 2>/dev/null || true)

  if [ -n "$PREV_LOCAL" ]; then
    if [ -r /dev/tty ]; then
      sudo -v || true
    fi
    sudo scutil --set LocalHostName "$PREV_LOCAL" || true
  fi
  if [ -n "$PREV_HOST" ]; then
    if [ -r /dev/tty ]; then
      sudo -v || true
    fi
    sudo scutil --set HostName "$PREV_HOST" || true
  fi
  if [ -n "$PREV_COMP" ]; then
    if [ -r /dev/tty ]; then
      sudo -v || true
    fi
    sudo scutil --set ComputerName "$PREV_COMP" || true
  fi

  if [ "$CADDY_INSTALLED" = "true" ]; then
    if prompt_yes_no "Uninstall Caddy (installed by Clawnsole)? [y/N]: " "N"; then
      brew uninstall caddy || true
    fi
  fi
fi

if [ -d "$INSTALL_DIR" ]; then
  rm -rf "$INSTALL_DIR" || true
  echo "Removed $INSTALL_DIR"
fi
rm -f "$STATE_PATH" || true

echo "Clawnsole uninstall complete."
