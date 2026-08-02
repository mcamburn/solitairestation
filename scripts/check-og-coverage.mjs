/**
 * check-og-coverage.mjs
 *
 * Verifies OG image coverage is complete and in sync across two sources:
 *   1. src/lib/games.ts  — authoritative game registry (route slugs)
 *   2. public/og/        — generated PNG files on disk
 *
 * The OG game list is now derived from src/lib/games.ts inside
 * og-game-registry.mjs, so the registry/games.ts sync check is implicit:
 * importing OG_GAMES throws immediately if any game lacks OG metadata.
 *
 * Exit 0 = all checks pass.  Exit 1 = one or more checks fail.
 *
 * Called by smoke-test.sh and can also be run standalone:
 *   node scripts/check-og-coverage.mjs
 */

import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { OG_GAMES } from "./og-game-registry.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let failures = 0;

// ── Every OG registry entry should have a PNG on disk ──────────────────────
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

// ── Summary ──────────────────────────────────────────────────────────────────
if (failures > 0) {
  console.error(
    `\nERROR: ${failures} OG coverage check(s) failed.\n` +
      "  • Regenerate missing images: node scripts/generate-og-images.mjs\n" +
      "  • If a new game is missing from the registry, add an entry to\n" +
      "    OG_META in scripts/og-game-registry.mjs first."
  );
  process.exit(1);
} else {
  console.log(
    `\nAll ${OG_GAMES.length} games covered — OG registry and files are in sync.`
  );
  process.exit(0);
}
