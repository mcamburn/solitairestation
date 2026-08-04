---
name: Git main push — token shell command required
description: The gitPush() callback never updates origin/main; only a direct shell push with the token does.
---

# Git push to main

## Rule
Never rely on `gitPush({ branch: "...", targetBranch: "main" })` to update GitHub's `main` branch. Despite the `targetBranch` parameter, the callback only pushes to the source branch name on origin (e.g. `github-push1785559709`), leaving `origin/main` stale.

## Why
Confirmed by running `git fetch origin` and seeing `origin/main` still at the old commit after multiple `gitPush` calls that all reported success.

## How to apply
Always push to main using the token directly in the shell:

```bash
git push https://mcamburn:${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/mcamburn/solitairestation.git HEAD:main
```

Run this after every session where commits need to land on main. Verify with:

```bash
git fetch origin && git log --oneline origin/main | head -3
```
