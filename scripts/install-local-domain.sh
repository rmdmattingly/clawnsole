#!/usr/bin/env bash
set -euo pipefail

OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"
HOSTNAME="${CLAWNSOLE_LOCAL_HOSTNAME:-clawnsole}"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required to install Caddy. Please install Homebrew first."
  exit 1
fi

if ! brew list caddy >/dev/null 2>&1; then
  echo "Installing Caddy..."
  brew install caddy
fi

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
