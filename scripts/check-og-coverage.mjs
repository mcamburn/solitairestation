/**
 * check-og-coverage.mjs
 *
 * Verifies OG image coverage is complete and in sync across three sources:
 *   1. src/lib/games.ts  — authoritative game registry (route slugs)
 *   2. scripts/og-game-registry.mjs — OG generation metadata
 *   3. public/og/        — generated PNG files on disk
 *
 * Exit 0 = all checks pass.  Exit 1 = one or more checks fail.
 *
 * Called by smoke-test.sh and can also be run standalone:
 *   node scripts/check-og-coverage.mjs
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { OG_GAMES } from "./og-game-registry.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ── 1. Parse canonical game slugs from src/lib/games.ts ────────────────────
// Extract every `to: "/slug"` value from the GAMES array.
const gamesTs = readFileSync(join(root, "src", "lib", "games.ts"), "utf8");
const slugMatches = [...gamesTs.matchAll(/\bto:\s*["'`](\/[\w-]+)["'`]/g)];
const registryIds = new Set(slugMatches.map(([, to]) => to.slice(1))); // strip leading /

// ── 2. Build sets from OG registry ─────────────────────────────────────────
const ogIds = new Set(OG_GAMES.map((g) => g.id));

let failures = 0;

// ── 3. Every canonical game should be in the OG registry ───────────────────
console.log("\n-- Games registry vs OG registry --");
for (const id of registryIds) {
  if (ogIds.has(id)) {
    console.log(`  PASS  ${id}  in OG registry`);
  } else {
    console.error(`  FAIL  ${id}  missing from scripts/og-game-registry.mjs`);
    failures++;
  }
}

// ── 4. Every OG registry entry should have a PNG on disk ───────────────────
console.log("\n-- OG registry vs public/og/ files --");
for (const game of OG_GAMES) {
  const file = join(root, "public", "og", `${game.id}.png`);
  if (existsSync(file)) {
    console.log(`  PASS  public/og/${game.id}.png`);
  } else {
    console.error(`  FAIL  public/og/${game.id}.png  — file missing`);
    failures++;
  }
}

// ── 5. Summary ──────────────────────────────────────────────────────────────
if (failures > 0) {
  console.error(
    `\nERROR: ${failures} OG coverage check(s) failed.\n` +
      "  • Add missing games to scripts/og-game-registry.mjs\n" +
      "  • Then regenerate: node scripts/generate-og-images.mjs"
  );
  process.exit(1);
} else {
  console.log(
    `\nAll ${registryIds.size} games covered — OG registry and files are in sync.`
  );
  process.exit(0);
}
