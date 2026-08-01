---
name: SSR hydration fix
description: How to prevent the Replit devtools script injection from crashing React hydration.
---

## Rule
`<head>` in `src/routes/__root.tsx` must have `suppressHydrationWarning`.

**Why:** The Replit dev environment injects a `<script src="/__replco/static/devtools/injected.js">` tag into the server-rendered HTML. React sees a different script at that DOM position on the client, throws a hydration mismatch, and cascades into an "Invalid hook call" crash. `suppressHydrationWarning` on `<head>` stops React from treating the injected-script difference as fatal.

**How to apply:** This is already applied. If the `<head>` element in `__root.tsx` ever gets rewritten, ensure `suppressHydrationWarning` is re-added.
