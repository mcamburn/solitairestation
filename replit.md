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

## User preferences
None recorded yet.
