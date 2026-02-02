#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${CLAWNSOLE_REPO:-git@github.com:rmdmattingly/clawnsole.git}"
OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"

if [[ "${1:-}" == "--uninstall" ]]; then
  if [ -x "$INSTALL_DIR/scripts/uninstall.sh" ]; then
    bash "$INSTALL_DIR/scripts/uninstall.sh"
    exit 0
  fi
  echo "Uninstall script not found. If Clawnsole isn't installed yet, nothing to do."
  exit 1
fi

mkdir -p "$(dirname "$INSTALL_DIR")"

if [ -d "$INSTALL_DIR/.git" ]; then
  echo "Clawnsole already exists. Updating..."
  git -C "$INSTALL_DIR" pull --ff-only
else
  echo "Cloning Clawnsole into $INSTALL_DIR"
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

read -r -p "Set admin password [admin]: " ADMIN_PASS
read -r -p "Set guest password [guest]: " GUEST_PASS
ADMIN_PASS="${ADMIN_PASS:-admin}"
GUEST_PASS="${GUEST_PASS:-guest}"

read -r -p "Port to run Clawnsole on [5173]: " PORT_INPUT
if [[ "$PORT_INPUT" =~ ^[0-9]+$ ]]; then
  PORT_VALUE="$PORT_INPUT"
else
  PORT_VALUE="5173"
fi

AUTH_VERSION="$(date +%s)"

if command -v node >/dev/null 2>&1; then
  CLAWNSOLE_ADMIN_PASSWORD="$ADMIN_PASS" CLAWNSOLE_GUEST_PASSWORD="$GUEST_PASS" \
  CLAWNSOLE_AUTH_VERSION="$AUTH_VERSION" \
    node "$INSTALL_DIR/scripts/patch-config.mjs"
else
  echo "Node.js is required. Please install Node 18+ and re-run."
  exit 1
fi

echo "Starting Clawnsole on login..."
CLAWNSOLE_PORT="$PORT_VALUE" bash "$INSTALL_DIR/scripts/install-launchagent.sh"

read -r -p "Enable automatic updates? [y/N]: " INSTALL_UPDATES
INSTALL_UPDATES="${INSTALL_UPDATES:-N}"
if [[ "$INSTALL_UPDATES" =~ ^[Yy]$ ]]; then
  read -r -p "Update interval in hours [6]: " UPDATE_HOURS
  UPDATE_HOURS="${UPDATE_HOURS:-6}"
  UPDATE_SECONDS=$((UPDATE_HOURS * 3600))
  CLAWNSOLE_UPDATE_INTERVAL_SECONDS="$UPDATE_SECONDS" \
    bash "$INSTALL_DIR/scripts/install-update-agent.sh"
  if command -v node >/dev/null 2>&1; then
    CLAWNSOLE_AUTO_UPDATE="true" CLAWNSOLE_UPDATE_INTERVAL_SECONDS="$UPDATE_SECONDS" \
      node "$INSTALL_DIR/scripts/patch-config.mjs"
  fi
fi

echo "Setting up http://clawnsole.local (requires sudo)..."
CLAWNSOLE_PORT="$PORT_VALUE" bash "$INSTALL_DIR/scripts/install-local-domain.sh"

printf "\nClawnsole installed.\n\nOpen:\n  http://clawnsole.local:%s\n" "$PORT_VALUE"
