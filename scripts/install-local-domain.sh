#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"
HOSTNAME="${CLAWNSOLE_LOCAL_HOSTNAME:-clawnsole}"
STATE_PATH="${CLAWNSOLE_STATE_PATH:-$OPENCLAW_HOME/clawnsole-install.json}"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required to install Caddy. Please install Homebrew first."
  exit 1
fi

CADDY_ALREADY_INSTALLED="false"
if brew list caddy >/dev/null 2>&1; then
  CADDY_ALREADY_INSTALLED="true"
else
  echo "Installing Caddy..."
  brew install caddy
fi

PREV_LOCAL=$(scutil --get LocalHostName 2>/dev/null || true)
PREV_HOST=$(scutil --get HostName 2>/dev/null || true)
PREV_COMP=$(scutil --get ComputerName 2>/dev/null || true)

CLAWNSOLE_PREV_LOCALHOSTNAME="$PREV_LOCAL" \
CLAWNSOLE_PREV_HOSTNAME="$PREV_HOST" \
CLAWNSOLE_PREV_COMPUTERNAME="$PREV_COMP" \
CLAWNSOLE_CADDY_WAS_INSTALLED="$CADDY_ALREADY_INSTALLED" \
CLAWNSOLE_CADDY_INSTALLED_BY_SCRIPT="$([ "$CADDY_ALREADY_INSTALLED" = "true" ] && echo false || echo true)" \
CLAWNSOLE_INSTALLED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
CLAWNSOLE_STATE_PATH="$STATE_PATH" \
node "$INSTALL_DIR/scripts/record-state.mjs"

mkdir -p "$OPENCLAW_HOME/logs"

cp "$INSTALL_DIR/scripts/Caddyfile" "$INSTALL_DIR/Caddyfile"

sudo scutil --set LocalHostName "$HOSTNAME"
sudo scutil --set HostName "$HOSTNAME"
sudo scutil --set ComputerName "$HOSTNAME"

echo "Set local hostname to ${HOSTNAME}.local"

PLIST_DST="/Library/LaunchDaemons/ai.openclaw.clawnsole-caddy.plist"

sudo sed "s|\$HOME|$HOME|g" "$INSTALL_DIR/scripts/clawnsole-caddy.plist" > "$PLIST_DST"

sudo launchctl unload "$PLIST_DST" >/dev/null 2>&1 || true
sudo launchctl load "$PLIST_DST"

sudo launchctl kickstart -k system/ai.openclaw.clawnsole-caddy || true

echo "Caddy reverse proxy running: http://${HOSTNAME}.local"
