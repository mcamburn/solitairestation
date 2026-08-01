---
name: Git remote configuration
description: Which GitHub remote is the real one, and how to push correctly.
---

## Rule
Always push using the direct token command — the `gitPush` skill callback returns `null` for provider on this repo and does not actually push.

**Why:** The repo remote is `https://github.com/mcamburn/solitairestation.git`. The `gitPush` tool cannot detect the GitHub provider from this URL (returns `null`) and silently no-ops. Direct shell push with the token works reliably.

**How to apply:** For every push, run:
```
git push "https://$GITHUB_PERSONAL_ACCESS_TOKEN@github.com/mcamburn/solitairestation.git" HEAD:main
```
Do NOT use `gitPush({})` or `gitPush({ branch: "main" })` — they will appear to succeed but push nothing.
