#!/usr/bin/env bash
set -euo pipefail

VERSION="2026-02-02.2"

REPO_URL="${CLAWNSOLE_REPO:-git@github.com:rmdmattingly/clawnsole.git}"
OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"

echo "Clawnsole installer ${VERSION}"

prompt_value() {
  local message="$1"
  local default="$2"
  local reply=""
  if [ -r /dev/tty ]; then
    read -r -p "$message" reply < /dev/tty || true
  fi
  if [ -z "$reply" ]; then
    printf '%s' "$default"
  else
    printf '%s' "$reply"
  fi
}

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

if [ "${1:-}" = "--uninstall" ]; then
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

ADMIN_PASS="$(prompt_value "Set admin password [admin]: " "admin")"
GUEST_PASS="$(prompt_value "Set guest password [guest]: " "guest")"

PORT_INPUT="$(prompt_value "Port to run Clawnsole on [5173]: " "5173")"
case "$PORT_INPUT" in
  ''|*[!0-9]*) PORT_VALUE="5173" ;;
  *) PORT_VALUE="$PORT_INPUT" ;;
esac

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

# Start immediately
CLAWNSOLE_PORT="$PORT_VALUE" bash "$INSTALL_DIR/scripts/ensure-running.sh" || true

# Install watchdog to keep it running after gateway restarts
CLAWNSOLE_PORT="$PORT_VALUE" bash "$INSTALL_DIR/scripts/install-watchdog.sh"

if prompt_yes_no "Enable automatic updates? [y/N]: " "N"; then
  UPDATE_HOURS="$(prompt_value "Update interval in hours [6]: " "6")"
  case "$UPDATE_HOURS" in
    ''|*[!0-9]*) UPDATE_HOURS="6" ;;
  esac
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
