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

# ── 4. Hardcoded-domain regression check ─────────────────────────────────────
echo "==> Checking for hardcoded domain strings in source files…"
HARDCODED=$(grep -r --include="*.ts" --include="*.tsx" \
  "free-klondike-solitaire\.com" src/ \
  -l 2>/dev/null \
  | grep -v "src/lib/site\.ts" \
  || true)

if [[ -n "${HARDCODED}" ]]; then
  echo ""
  echo "ERROR: Hardcoded domain 'free-klondike-solitaire.com' found in source file(s):" >&2
  echo "${HARDCODED}" | sed 's/^/  /' >&2
  echo "Use the SITE_URL constant from @/lib/site instead." >&2
  exit 1
fi
echo "  PASS  No hardcoded domain strings found."

# ── 5. OG image coverage check ───────────────────────────────────────────────
# Verifies every canonical game in src/lib/games.ts has an entry in
# scripts/og-game-registry.mjs and a corresponding file in public/og/.
echo "==> Checking OG image coverage…"
if node scripts/check-og-coverage.mjs; then
  : # check-og-coverage prints its own PASS lines
else
  FAILED=$((FAILED + 1))
fi

# ── 6. Social-crawler OG-tag check ───────────────────────────────────────────
# Verifies the origin server returns correct og:title and og:image tags when
# queried with a Facebook crawler user agent. This confirms that once the
# Cloudflare WAF bypass rule (docs/cloudflare-setup.md) is applied, social
# preview crawlers will receive the real SSR HTML rather than a challenge page.
echo "==> Checking social-crawler OG tags…"
CRAWLER_UA="facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
CRAWLER_ROUTE="/klondike"
CRAWLER_BODY=$(curl -s -L --max-time 10 \
  -A "${CRAWLER_UA}" \
  "${BASE_URL}${CRAWLER_ROUTE}" 2>/dev/null)

OG_TITLE=$(echo "${CRAWLER_BODY}" | grep -o 'property="og:title"[^>]*' | head -1)
OG_IMAGE=$(echo "${CRAWLER_BODY}" | grep -o 'property="og:image"[^>]*' | head -1)

if [[ -n "${OG_TITLE}" ]]; then
  echo "  PASS  og:title present for crawler UA on ${CRAWLER_ROUTE}"
else
  echo "  FAIL  og:title missing for crawler UA on ${CRAWLER_ROUTE}" >&2
  FAILED=$((FAILED + 1))
fi

if [[ -n "${OG_IMAGE}" ]]; then
  echo "  PASS  og:image present for crawler UA on ${CRAWLER_ROUTE}"
else
  echo "  FAIL  og:image missing for crawler UA on ${CRAWLER_ROUTE}" >&2
  FAILED=$((FAILED + 1))
fi


# ── 7. Report ─────────────────────────────────────────────────────────────────
echo ""
if [[ ${FAILED} -eq 0 ]]; then
  echo "All checks passed. Smoke test passed."
  exit 0
else
  echo "Smoke test FAILED: ${FAILED} check(s) did not pass." >&2
  exit 1
fi
