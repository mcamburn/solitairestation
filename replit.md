# Neon Solitaire

## Overview
A Klondike Solitaire game ("Neon Solitaire") — a minimal, neon-lit take on the
classic card game. No sign-up, no paywall, play instantly in the browser.

Imported from [Lovable](https://lovable.dev). Built with:
- **TanStack Start** (React 19, file-based routing via TanStack Router) for the app framework
- **Vite** as the dev/build tool, configured through `@lovable.dev/vite-tanstack-config`
- **Tailwind CSS v4** + shadcn/ui (Radix primitives) for styling/components
- **Nitro** for the production server build

## Running the project
- Package manager: **bun** (see `bunfig.toml`, `bun.lock`)
- Dev server: `bun run dev` (runs `vite dev`), bound to the "Start application" workflow on port 5000
- Build: `bun run build`

## Smoke test
`scripts/smoke-test.sh` builds the production bundle, starts the Nitro server on port 4173, and checks that every game route returns HTTP 200. It requires no browser or display server — only `bun` and `curl`.

**Run locally:**
```bash
bash scripts/smoke-test.sh
```

**Run in CI (GitHub Actions):**
The workflow at `.github/workflows/smoke.yml` triggers automatically on pushes and pull requests to `main`. It installs Bun via `oven-sh/setup-bun`, runs `bun install --frozen-lockfile`, then executes the same script. No display server or extra setup is needed.

### Replit-specific config
`vite.config.ts` overrides the Lovable config's default dev server binding
(`host: "::"`, port `8080`) with `host: "0.0.0.0"`, port `5000`, and
`allowedHosts: true`. This is required because:
- Replit's container doesn't support IPv6 bind (`::"`), which crashed the
  server with `EAFNOSUPPORT`.
- The Replit preview proxies the app through an iframe on a different host,
  so `allowedHosts: true` is needed for Vite to accept those requests.
- Replit's webview workflow requires port 5000.

Do not remove this override — the upstream Lovable defaults will not work
in this environment.

## Project structure
- `src/routes/` — TanStack Router file-based routes (`index.tsx`, `privacy.tsx`, `terms.tsx`, `__root.tsx`)
- `src/components/` — `Solitaire.tsx` (game logic UI), `PlayingCard.tsx`, plus `ui/` (shadcn components)
- `src/lib/solitaire.ts` — core game logic
- `src/server.ts` / `src/start.ts` — SSR server entry with error-capture wrapping

## Domain URL convention
The canonical site domain is defined **once** in `src/lib/site.ts` as the `SITE_URL` constant (Solitaire Station — defaults to `https://www.free-klondike-solitaire.com`, overridden via `VITE_SITE_URL`). All route files and components that need an absolute URL (e.g. `og:url`, `og:image`, canonical links) **must** import and use `SITE_URL` — never hardcode the domain string directly.

Two layers of enforcement exist:

1. **Pre-commit hook** (`.githooks/pre-commit`) — runs instantly at commit time, greping only the staged `.ts`/`.tsx` files for the hardcoded domain string. Installed automatically via the `prepare` npm/bun script (`git config core.hooksPath .githooks`), so it activates after the first `bun install`. No extra dependencies required.

2. **Smoke test** (`scripts/smoke-test.sh`) — greps the full `src/` tree as part of the production build verification. Any pull request that slips past the hook is caught here before merging.

## OG image coverage

Every game route must have a matching OG social-preview image in `public/og/<slug>.png`.

**Adding a new game requires three steps:**
1. Add the route file under `src/routes/<slug>.tsx` (set the `og:image` meta tag).
2. Add an entry to `scripts/og-game-registry.mjs` (same `id` as the route slug).
3. Regenerate images: `node scripts/generate-og-images.mjs`

**Two layers of enforcement exist:**

1. **Pre-commit hook** (`.githooks/pre-commit`) — when `src/lib/games.ts`, `scripts/og-game-registry.mjs`, or any route file is staged, `node scripts/check-og-coverage-staged.mjs` runs automatically. This staged-index variant reads all three sources (`games.ts`, the OG registry, PNG existence) from the **git index**, not the working tree, so a generated-but-not-`git add`-ed PNG correctly blocks the commit. No build step required.

2. **Smoke test** (`scripts/smoke-test.sh`, section 5) — calls `node scripts/check-og-coverage.mjs` (the working-tree variant) as part of the full production build check. Catches gaps in CI even if the hook was bypassed.

`src/lib/games.ts` is the authoritative game registry. A route file in `src/routes/` is not a "game" until its slug appears in the `GAMES` array there.

To run the staged check standalone at any time (requires a git repo, no build needed):
```bash
node scripts/check-og-coverage-staged.mjs
```

To run the working-tree check (used by smoke-test):
```bash
node scripts/check-og-coverage.mjs
```

## User preferences
None recorded yet.
