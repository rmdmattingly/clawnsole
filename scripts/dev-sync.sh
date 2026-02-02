#!/usr/bin/env bash
set -euo pipefail

DEV_DIR="${CLAWNSOLE_DEV_DIR:-$HOME/src/clawnsole}"
OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INSTALL_DIR="${CLAWNSOLE_DIR:-$OPENCLAW_HOME/apps/clawnsole}"

if [ ! -d "$DEV_DIR" ]; then
  echo "Dev repo not found at $DEV_DIR"
  exit 1
fi

mkdir -p "$(dirname "$INSTALL_DIR")"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude ".git" --exclude "node_modules" "$DEV_DIR/" "$INSTALL_DIR/"
else
  rm -rf "$INSTALL_DIR"
  cp -R "$DEV_DIR" "$INSTALL_DIR"
  rm -rf "$INSTALL_DIR/.git" "$INSTALL_DIR/node_modules"
fi

(cd "$INSTALL_DIR" && npm install --silent)

echo "Synced dev repo to $INSTALL_DIR"
