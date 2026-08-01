# Threat Model

## Project Overview

Neon Solitaire is a browser-based Klondike/Spider/FreeCell/Pyramid/TriPeaks/Mahjong card game with zero backend persistence, no user accounts, and no payment processing. It is built with TanStack Start (React 19), Vite, Tailwind CSS v4, and served by a Nitro SSR server. Deployed publicly on Replit Autoscale.

The application has an extremely limited server-side attack surface: the Nitro server only performs SSR (renders static React pages) and serves no authenticated or user-scoped data. All game state is stored in `localStorage` on the client.

## Assets

- **Static HTML/JS/CSS bundle** — the only meaningful asset. Tampering would require supply-chain compromise or build pipeline access.
- **localStorage game state** — stored client-side only. Contains no PII, credentials, or sensitive data. Compromise is scoped to the attacking user's own browser.
- **No secrets or API keys** — the application makes no outbound API calls and has no credentials to protect.
- **No user accounts or credentials** — there is no login system, no password store, and no session tokens.

## Trust Boundaries

- **Browser to Nitro server** — only boundary that matters. The server renders React pages and returns HTML. No request parameters influence database queries or privileged operations.
- **Client localStorage** — game state is read/written only in the user's own browser context. No cross-origin sharing.

## Scan Anchors

- Production entry points: `src/server.ts`, `src/start.ts`, `src/routes/__root.tsx`
- Highest-risk code area: the SSR error-handling path in `src/server.ts` (publicly reachable, handles 500s)
- All routes are public, unauthenticated, and read-only (no mutations to any backend state)
- `src/lib/persist.ts` manages localStorage serialization — relevant only to client-side tampering
- Dev-only: `scripts/smoke-test.sh`, `.github/workflows/smoke.yml`

## Threat Categories

### Information Disclosure

The SSR server catches all 500 errors and renders a generic error page (`src/lib/error-page.ts`) rather than exposing stack traces. Logs go to `console.error` (server-side only). No PII or secrets are present in the codebase to disclose.

**Guarantee required:** Error responses MUST NOT expose internal stack traces or server implementation details to the client. Currently satisfied.

### Denial of Service

The Nitro server renders SSR pages synchronously. No user-controlled computations are run server-side; game logic executes entirely in the browser. There is no file upload surface and no resource-intensive authenticated endpoint. Rate limiting is not implemented but the attack surface (static page rendering) is minimal.

**Guarantee required:** The server MUST NOT execute expensive user-controlled operations. Currently satisfied — all game logic is client-side.

### Tampering / Elevation of Privilege

No server-side state is mutable by clients. No admin endpoints exist. No authorization decisions are made. Client-side `localStorage` manipulation only affects the manipulating user's own game state.

### Spoofing / Repudiation

No authentication system exists; spoofing is not applicable. No audit logs are required because no sensitive operations occur.

### Dependency Vulnerabilities

The application uses Bun as package manager with a lockfile (`bun.lock`). Dependencies include React 19, TanStack Router/Start, Vite, Tailwind, Radix UI, and shadcn/ui components. No server-side processing of user-supplied data occurs through these dependencies.

**Guarantee required:** Dependencies SHOULD be kept up to date. Run `bun audit` periodically to check for CVEs.
