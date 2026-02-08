#!/usr/bin/env bash
set -euo pipefail

# Run the deploy E2E test against a live Clawnsole instance (QA or Prod).
#
# Required env:
#   BASE_URL           e.g. https://clawnsole-qa.example.com
# Optional env:
#   ADMIN_PASSWORD     defaults to "admin"

if [ -z "${BASE_URL:-}" ]; then
  echo "Missing BASE_URL. Example: BASE_URL=https://clawnsole.local" >&2
  exit 2
fi

export ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"

# Keep output readable in CI.
exec npx playwright test tests/deploy.e2e.spec.js --reporter=line
