/**
 * Canonical OG-image metadata for all Solitaire Station games.
 *
 * The game LIST is derived at runtime from src/lib/games.ts so new games are
 * automatically included.  Only the OG-image-specific fields (display label,
 * decorative suit symbols, and accent colour) live here.
 *
 * When you add a game to src/lib/games.ts, add a matching entry to OG_META
 * below (key = route slug without the leading "/").  If an entry is missing
 * this module throws immediately with a clear error message so the gap is
 * caught before any image is generated.
 *
 * Then regenerate and stage the new PNG:
 *   node scripts/generate-og-images.mjs
 *   git add public/og/<slug>.png
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// OG-image-specific metadata keyed by route slug (the `to:` value in
// src/lib/games.ts with the leading "/" stripped).
const OG_META = {
  "klondike":      { label: "Klondike Solitaire",      suits: ["♠", "♥", "♣", "♦"], accent: "#e8a020" },
  "spider":        { label: "Spider Solitaire",        suits: ["♠", "♠", "♠", "♠"], accent: "#20a0e8" },
  "freecell":      { label: "FreeCell",                suits: ["♣", "♦", "♥", "♠"], accent: "#5cb85c" },
  "pyramid":       { label: "Pyramid Solitaire",       suits: ["♦", "♥", "♣", "♠"], accent: "#d4a017" },
  "tripeaks":      { label: "TriPeaks Solitaire",      suits: ["♥", "♠", "♦", "♣"], accent: "#c0392b" },
  "mahjong":       { label: "Mahjong",                 suits: ["🀄", "🀄", "🀄", "🀄"], accent: "#c0392b" },
  "golf":          { label: "Golf Solitaire",          suits: ["♣", "♦", "♥", "♠"], accent: "#34d399" },
  "forty-thieves": { label: "Forty Thieves Solitaire", suits: ["♠", "♦", "♣", "♥"], accent: "#f97316" },
  "yukon":         { label: "Yukon Solitaire",         suits: ["♥", "♣", "♦", "♠"], accent: "#a78bfa" },
  "scorpion":      { label: "Scorpion Solitaire",      suits: ["♠", "♠", "♣", "♣"], accent: "#ef4444" },
  "eight-off":     { label: "Eight Off Solitaire",     suits: ["♣", "♠", "♦", "♥"], accent: "#06b6d4" },
  "canfield":      { label: "Canfield Solitaire",      suits: ["♦", "♣", "♥", "♠"], accent: "#f59e0b" },
  "addiction":     { label: "Addiction Solitaire",     suits: ["♥", "♦", "♠", "♣"], accent: "#ec4899" },
  "bakers-dozen":  { label: "Baker's Dozen Solitaire", suits: ["♣", "♥", "♦", "♠"], accent: "#84cc16" },
  "bakers-game":   { label: "Baker's Game Solitaire",  suits: ["♠", "♣", "♥", "♦"], accent: "#6366f1" },
  "clock":         { label: "Clock Solitaire",         suits: ["♦", "♠", "♣", "♥"], accent: "#e879f9" },
};

// ── Derive the game list from src/lib/games.ts ────────────────────────────────
// Extract every `to: "/slug"` value from the GAMES array.  This is the same
// regex used by check-og-coverage.mjs so both tools share the same parsing logic.
const gamesTs = readFileSync(join(root, "src", "lib", "games.ts"), "utf8");
const slugMatches = [...gamesTs.matchAll(/\bto:\s*["'`](\/[\w-]+)["'`]/g)];

if (slugMatches.length === 0) {
  throw new Error("Could not parse any game slugs from src/lib/games.ts — check the file format.");
}

export const OG_GAMES = slugMatches.map(([, to]) => {
  const id = to.slice(1); // "/forty-thieves" → "forty-thieves"
  const meta = OG_META[id];
  if (!meta) {
    throw new Error(
      `Missing OG metadata for game "${id}".\n` +
      `Add an entry to OG_META in scripts/og-game-registry.mjs, then regenerate:\n` +
      `  node scripts/generate-og-images.mjs && git add public/og/${id}.png`
    );
  }
  return { id, ...meta };
});
