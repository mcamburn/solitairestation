---
name: SSR hydration fix
description: How to prevent the Replit devtools script injection from crashing React hydration.
---

## Rule
Two-part fix required for Replit's devtools script injection:

1. `<head>` in `src/routes/__root.tsx` must have `suppressHydrationWarning`.
2. **All `<script>` tags must live in `<body>`, not `<head>`.**

**Why:** `suppressHydrationWarning` on `<head>` only shields that element's own attribute mismatches — it does NOT suppress child-node-order mismatches. Replit injects a `<script src="/__replco/static/devtools/injected.js">` into `<head>` at SSR time. This shifts child positions, so React sees a different script element at each position on the client and throws a hydration mismatch that cascades into an "Invalid hook call" crash. Moving JSON-LD and gtag scripts to `<body>` keeps them out of the injection zone entirely.

**How to apply:** `<head>` should contain only `<HeadContent />` (managed by TanStack Start). Any `<script>` tags (JSON-LD structured data, analytics, etc.) belong in `<body>` after `<Scripts />`. JSON-LD is valid in `<body>` per the spec; gtag works fine there too. If `__root.tsx` is ever rewritten, enforce both rules.
