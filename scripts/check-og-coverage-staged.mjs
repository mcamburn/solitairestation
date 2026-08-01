/**
 * check-og-coverage-staged.mjs
 *
 * Pre-commit variant of check-og-coverage.mjs.
 *
 * Unlike check-og-coverage.mjs (which reads the working tree), this script
 * reads ONLY from the git staged index so it validates exactly what will be
 * committed — not what happens to be on disk.
 *
 *   • src/lib/games.ts          — read via `git show :src/lib/games.ts`
 *   • scripts/og-game-registry.mjs — read via `git show :scripts/og-game-registry.mjs`
 *   • public/og/<slug>.png      — existence checked via `git ls-files --cached`
 *
 * This prevents the false-pass scenario where a developer:
 *   1. Stages a new game entry in games.ts / og-game-registry.mjs
 *   2. Runs the generator (PNG appears in the working tree)
 *   3. Forgets to `git add` the PNG
 *   → the hook must block the commit because the PNG is not staged
 *
 * Authoritative game source: src/lib/games.ts (the GAMES array's `to:` slugs).
 * A route file in src/routes/ is NOT a "game" until registered in games.ts.
 *
 * Exit 0 = all checks pass.  Exit 1 = one or more checks fail.
 *
 * Called by .githooks/pre-commit; can also be run standalone (requires a git repo):
 *   node scripts/check-og-coverage-staged.mjs
 */

import { execSync } from "child_process";

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Read a file from the git staged index (the post-commit snapshot).
 * If the file hasn't been modified in this commit, git returns the HEAD version,
 * which is still correct — we want the state the file will be in after the commit.
 * Returns null if the path is not tracked at all.
 */
function readFromIndex(path) {
  try {
    return execSync(`git show ":${path}"`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
  } catch {
    return null;
  }
}

/**
 * Returns true if the path is tracked in the git index (i.e. will be part of
 * the next commit).  Checks the staged index only — a file that exists in the
 * working tree but has NOT been `git add`-ed returns false.
 */
function existsInIndex(path) {
  try {
    execSync(`git ls-files --error-unmatch --cached -- "${path}"`, {
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

// ── 1. Parse canonical game slugs from staged src/lib/games.ts ───────────────
const gamesTs = readFromIndex("src/lib/games.ts");
if (!gamesTs) {
  console.error("ERROR: src/lib/games.ts not found in the git index.");
  process.exit(1);
}
const slugMatches = [...gamesTs.matchAll(/\bto:\s*["'`](\/[\w-]+)["'`]/g)];
const registryIds = new Set(slugMatches.map(([, to]) => to.slice(1))); // strip leading /

// ── 2. Parse OG registry from staged scripts/og-game-registry.mjs ────────────
const ogRegistryText = readFromIndex("scripts/og-game-registry.mjs");
if (!ogRegistryText) {
  console.error("ERROR: scripts/og-game-registry.mjs not found in the git index.");
  process.exit(1);
}
// Extract every  id: "slug"  value from the OG_GAMES array literal
const ogIdMatches = [...ogRegistryText.matchAll(/\bid:\s*["'`]([\w-]+)["'`]/g)];
const ogIds = new Set(ogIdMatches.map(([, id]) => id));

let failures = 0;

// ── 3. Every canonical game should be in the staged OG registry ──────────────
console.log("\n-- Games registry vs OG registry (staged index) --");
for (const id of registryIds) {
  if (ogIds.has(id)) {
    console.log(`  PASS  ${id}  in OG registry`);
  } else {
    console.error(`  FAIL  ${id}  missing from scripts/og-game-registry.mjs`);
    failures++;
  }
}

// ── 4. Every OG registry entry should have a PNG in the staged index ─────────
console.log("\n-- OG registry vs staged public/og/ files --");
for (const id of ogIds) {
  const path = `public/og/${id}.png`;
  if (existsInIndex(path)) {
    console.log(`  PASS  ${path}`);
  } else {
    console.error(
      `  FAIL  ${path}  — file not staged` +
      `\n         Run: node scripts/generate-og-images.mjs && git add ${path}`
    );
    failures++;
  }
}

// ── 5. Summary ────────────────────────────────────────────────────────────────
if (failures > 0) {
  console.error(
    `\nERROR: ${failures} OG coverage check(s) failed.\n` +
      "  1. Add missing games to scripts/og-game-registry.mjs\n" +
      "  2. Regenerate images:  node scripts/generate-og-images.mjs\n" +
      "  3. Stage the PNGs:     git add public/og/<slug>.png"
  );
  process.exit(1);
} else {
  console.log(
    `\nAll ${registryIds.size} games covered — staged OG registry and files are in sync.`
  );
  process.exit(0);
}
