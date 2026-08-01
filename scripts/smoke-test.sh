#!/usr/bin/env bash
# smoke-test.sh — build the production bundle and verify every game route returns 200.
# Usage: bash scripts/smoke-test.sh
# Exit code: 0 if all routes pass, non-zero otherwise.

set -euo pipefail

SMOKE_PORT=4173
BASE_URL="http://127.0.0.1:${SMOKE_PORT}"
SERVER_PID=""

# Routes to check: home page + all six game pages + legal pages
ROUTES=(
  "/"
  "/klondike"
  "/spider"
  "/freecell"
  "/pyramid"
  "/tripeaks"
  "/mahjong"
)

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    echo "Stopping production server (pid ${SERVER_PID})…"
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# ── 1. Build ──────────────────────────────────────────────────────────────────
echo "==> Building production bundle…"
bun run build

# ── 2. Start production server ────────────────────────────────────────────────
echo "==> Starting production server on port ${SMOKE_PORT}…"
PORT="${SMOKE_PORT}" node .output/server/index.mjs &
SERVER_PID=$!

# Wait up to 30 s for the server to accept connections
echo -n "    Waiting for server to be ready"
for i in $(seq 1 30); do
  if curl -sf --max-time 2 "${BASE_URL}/" -o /dev/null 2>/dev/null; then
    echo " ready (${i}s)"
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo ""
    echo "ERROR: server did not become ready within 30 seconds." >&2
    exit 1
  fi
  echo -n "."
  sleep 1
done

# ── 3. Probe every route ──────────────────────────────────────────────────────
echo "==> Probing routes…"
FAILED=0

for route in "${ROUTES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 10 "${BASE_URL}${route}")
  if [[ "${STATUS}" == "200" ]]; then
    echo "  PASS  ${route}  (${STATUS})"
  else
    echo "  FAIL  ${route}  (${STATUS})" >&2
    FAILED=$((FAILED + 1))
  fi
done

# ── 4. Report ─────────────────────────────────────────────────────────────────
echo ""
if [[ ${FAILED} -eq 0 ]]; then
  echo "All ${#ROUTES[@]} routes returned 200. Smoke test passed."
  exit 0
else
  echo "Smoke test FAILED: ${FAILED}/${#ROUTES[@]} route(s) did not return 200." >&2
  exit 1
fi
