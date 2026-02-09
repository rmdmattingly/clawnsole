#!/usr/bin/env bash
set -euo pipefail

# Installs a macOS LaunchAgent that runs the Clawnsole QA instance:
# - http://127.0.0.1:5174
# - CLAWNSOLE_INSTANCE=qa (cookie namespace isolation)
#
# This is intentionally separate from Prod (5173). The LaunchAgent label is:
#   ai.openclaw.clawnsole-qa

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLIST_DST="$HOME/Library/LaunchAgents/ai.openclaw.clawnsole-qa.plist"
LABEL="ai.openclaw.clawnsole-qa"

PORT="${CLAWNSOLE_QA_PORT:-5174}"
PATH_VALUE="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

mkdir -p "$HOME/Library/LaunchAgents"
mkdir -p "$HOME/.openclaw/logs"

cat >"$PLIST_DST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>

  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/env</string>
    <string>bash</string>
    <string>-lc</string>
    <string>cd "${REPO_DIR}"; exec /usr/bin/env node server.js</string>
  </array>

  <key>EnvironmentVariables</key>
  <dict>
    <key>PORT</key>
    <string>${PORT}</string>
    <key>CLAWNSOLE_INSTANCE</key>
    <string>qa</string>
    <key>PATH</key>
    <string>${PATH_VALUE}</string>
  </dict>

  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>

  <key>StandardOutPath</key>
  <string>$HOME/.openclaw/logs/clawnsole.qa.out.log</string>
  <key>StandardErrorPath</key>
  <string>$HOME/.openclaw/logs/clawnsole.qa.err.log</string>
</dict>
</plist>
PLIST

if ! plutil -p "$PLIST_DST" >/dev/null 2>&1; then
  echo "LaunchAgent plist is invalid: $PLIST_DST"
  exit 1
fi

USER_ID="$(id -u)"
DOMAIN_GUI="gui/$USER_ID"
DOMAIN_USER="user/$USER_ID"

# Remove any prior registration (best-effort)
launchctl bootout "$DOMAIN_GUI" "$PLIST_DST" >/dev/null 2>&1 || true
launchctl bootout "$DOMAIN_USER" "$PLIST_DST" >/dev/null 2>&1 || true

TARGET_DOMAIN="$DOMAIN_GUI"
if ! launchctl print "$DOMAIN_GUI" >/dev/null 2>&1; then
  TARGET_DOMAIN="$DOMAIN_USER"
fi

if ! launchctl bootstrap "$TARGET_DOMAIN" "$PLIST_DST" >/dev/null 2>&1; then
  echo "LaunchAgent bootstrap failed for $TARGET_DOMAIN. Trying legacy load..."
  launchctl load "$PLIST_DST" >/dev/null 2>&1 || true
fi

if launchctl print "$DOMAIN_GUI/$LABEL" >/dev/null 2>&1; then
  launchctl enable "$DOMAIN_GUI/$LABEL" >/dev/null 2>&1 || true
  launchctl kickstart -k "$DOMAIN_GUI/$LABEL" >/dev/null 2>&1 || true
elif launchctl print "$DOMAIN_USER/$LABEL" >/dev/null 2>&1; then
  launchctl enable "$DOMAIN_USER/$LABEL" >/dev/null 2>&1 || true
  launchctl kickstart -k "$DOMAIN_USER/$LABEL" >/dev/null 2>&1 || true
else
  echo "LaunchAgent not registered (yet). It should appear after login or a manual load."
fi

echo "QA LaunchAgent installed: $PLIST_DST (port $PORT)"
