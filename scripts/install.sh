#!/usr/bin/env bash
set -euo pipefail

VERSION="2026-02-02.4"

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

prompt_password() {
  local label="$1"
  local default="$2"
  local pass1=""
  local pass2=""
  while true; do
    if [ -r /dev/tty ]; then
      printf "%s" "$label [$default]: " > /dev/tty
      read -r -s pass1 < /dev/tty || true
      printf "\n" > /dev/tty
      if [ -z "$pass1" ]; then
        pass1="$default"
      fi
      printf "%s" "Confirm $label: " > /dev/tty
      read -r -s pass2 < /dev/tty || true
      printf "\n" > /dev/tty
      if [ -z "$pass2" ]; then
        pass2="$default"
      fi
      if [ "$pass1" = "$pass2" ]; then
        printf '%s' "$pass1"
        return 0
      fi
      echo "Passwords did not match. Please try again."
    else
      printf '%s' "$default"
      return 0
    fi
  done
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

if command -v node >/dev/null 2>&1; then
  if command -v npm >/dev/null 2>&1; then
    (cd "$INSTALL_DIR" && npm install --silent)
    if [ ! -f "$INSTALL_DIR/node_modules/ws/package.json" ]; then
      echo "Dependencies incomplete. Retrying npm install..."
      (cd "$INSTALL_DIR" && npm install)
    fi
    if [ ! -f "$INSTALL_DIR/node_modules/ws/package.json" ]; then
      echo "Failed to install dependencies (ws missing)."
      exit 1
    fi
    (cd "$INSTALL_DIR" && node scripts/preflight.js)
  else
    echo "npm is required. Please install Node.js (includes npm) and re-run."
    exit 1
  fi
else
  echo "Node.js is required. Please install Node 18+ and re-run."
  exit 1
fi

ADMIN_PASS="$(prompt_password "Admin password" "admin")"
GUEST_PASS="$(prompt_password "Guest password" "guest")"

PORT_INPUT="$(prompt_value "Port to run Clawnsole on [5173]: " "5173")"
case "$PORT_INPUT" in
  ''|*[!0-9]*) PORT_VALUE="5173" ;;
  *) PORT_VALUE="$PORT_INPUT" ;;
esac

AUTH_VERSION="$(date +%s)"

CLAWNSOLE_ADMIN_PASSWORD="$ADMIN_PASS" CLAWNSOLE_GUEST_PASSWORD="$GUEST_PASS" \
CLAWNSOLE_AUTH_VERSION="$AUTH_VERSION" \
  node "$INSTALL_DIR/scripts/patch-config.mjs"

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
