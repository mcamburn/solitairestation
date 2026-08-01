---
name: Git remote configuration
description: Which GitHub remote is the real one, and how to push correctly.
---

## Rule
Always push to `origin`, which now correctly points to `https://github.com/mcamburn/solitairestation.git`.

**Why:** The repo had two GitHub remotes — `origin` (old `free-klondike-solitaire` repo) and `solitairestation` (correct repo). `origin` was reset to `solitairestation` so the `gitPush` tool works correctly. The old `solitairestation` remote alias still exists as a redundant alias.

**How to apply:** Use `gitPush({ branch: "main" })` for all pushes. If authentication fails via shell, use `git push "https://$GITHUB_PERSONAL_ACCESS_TOKEN@github.com/mcamburn/solitairestation.git" HEAD:main`.
