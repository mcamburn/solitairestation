/**
 * Canonical list of games that receive OG social-preview images.
 * This is the single source of truth for generate-og-images.mjs.
 *
 * When you add a new game to src/lib/games.ts, add a matching entry here
 * (same `id` as the route slug, e.g. `/yukon` → id `"yukon"`).
 * Then re-run:  node scripts/generate-og-images.mjs
 *
 * The smoke test (`bash scripts/smoke-test.sh`) will fail if the registry
 * and the generated files fall out of sync.
 */

export const OG_GAMES = [
  { id: "klondike",      label: "Klondike Solitaire",      suits: ["♠", "♥", "♣", "♦"], accent: "#e8a020" },
  { id: "spider",        label: "Spider Solitaire",        suits: ["♠", "♠", "♠", "♠"], accent: "#20a0e8" },
  { id: "freecell",      label: "FreeCell",                suits: ["♣", "♦", "♥", "♠"], accent: "#5cb85c" },
  { id: "pyramid",       label: "Pyramid Solitaire",       suits: ["♦", "♥", "♣", "♠"], accent: "#d4a017" },
  { id: "tripeaks",      label: "TriPeaks Solitaire",      suits: ["♥", "♠", "♦", "♣"], accent: "#c0392b" },
  { id: "mahjong",       label: "Mahjong",                 suits: ["🀄", "🀄", "🀄", "🀄"], accent: "#c0392b" },
  { id: "golf",          label: "Golf Solitaire",          suits: ["♣", "♦", "♥", "♠"], accent: "#34d399" },
  { id: "forty-thieves", label: "Forty Thieves Solitaire", suits: ["♠", "♦", "♣", "♥"], accent: "#f97316" },
  { id: "yukon",         label: "Yukon Solitaire",         suits: ["♥", "♣", "♦", "♠"], accent: "#a78bfa" },
  { id: "scorpion",      label: "Scorpion Solitaire",      suits: ["♠", "♠", "♣", "♣"], accent: "#ef4444" },
  { id: "eight-off",     label: "Eight Off Solitaire",     suits: ["♣", "♠", "♦", "♥"], accent: "#06b6d4" },
  { id: "canfield",      label: "Canfield Solitaire",      suits: ["♦", "♣", "♥", "♠"], accent: "#f59e0b" },
  { id: "addiction",     label: "Addiction Solitaire",     suits: ["♥", "♦", "♠", "♣"], accent: "#ec4899" },
  { id: "bakers-dozen",  label: "Baker's Dozen Solitaire", suits: ["♣", "♥", "♦", "♠"], accent: "#84cc16" },
  { id: "bakers-game",   label: "Baker's Game Solitaire",  suits: ["♠", "♣", "♥", "♦"], accent: "#6366f1" },
  { id: "clock",         label: "Clock Solitaire",         suits: ["♦", "♠", "♣", "♥"], accent: "#e879f9" },
];
