---
name: styles.css revert risk
description: Running git checkout origin/main -- src/styles.css silently destroys mobile CSS rules that only exist in local commits, not on origin/main.
---

## Rule
Never revert `src/styles.css` via `git checkout origin/main -- src/styles.css`. The local commit history is 100+ commits ahead of `origin/main`, so the origin copy is missing many production rules.

**Why:** The local branch `github-push1785559709` tracks `origin/github-push1785559709`, but pushes go to `origin/main` via `HEAD:main`. The `origin/main` tracking ref therefore lags the real remote. A checkout from `origin/main` silently discards everything committed locally since the branch diverged.

**Known rules that live only in local commits (not origin/main):**
- `@media (max-width: 639px)` block making `.game-board-glass` full-bleed on mobile (removes side borders, padding, border-radius; sets `slot-empty` aspect-ratio to 2/3).
- Container query tiers for narrow cards (≤65px, ≤50px) with `card-rank`, `card-rank-suit`, `card-top-glyph`, and center body font overrides.

**How to apply:** If you must revert a specific change in `src/styles.css`, use `git diff` to identify the exact lines and revert only those with the Edit tool rather than checking out the entire file.
