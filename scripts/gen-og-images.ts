/**
 * Generates 1200×630 PNG Open Graph images for each game.
 * Run with:  bun scripts/gen-og-images.ts
 *
 * The game list is derived from src/lib/games.ts so new games are covered
 * automatically. Add an OG_META entry for each new saveKey or the script
 * will throw an explicit error rather than silently skipping the game.
 */
import { Resvg } from "@resvg/resvg-js";
import { mkdir } from "node:fs/promises";
import { GAMES as APP_GAMES } from "../src/lib/games.ts";

// OG-image-specific metadata keyed by saveKey from src/lib/games.ts.
// These fields (marketing tagline, accent color, emoji code point) live here
// because they are OG-image concerns, not app-navigation concerns.
const OG_META: Record<string, { color: string; emojiCode: string; subtitle: string }> = {
  klondike:     { color: "#00ff87", emojiCode: "1f0cf", subtitle: "The classic you know and love" },
  spider:       { color: "#a855f7", emojiCode: "1f577", subtitle: "Build eight suit sequences to win" },
  freecell:     { color: "#3b82f6", emojiCode: "1f532", subtitle: "Nearly every deal is solvable" },
  pyramid:      { color: "#f59e0b", emojiCode: "1f53a", subtitle: "Pair cards that sum to 13" },
  tripeaks:     { color: "#ef4444", emojiCode: "26f0",  subtitle: "Chain plays for a streak bonus" },
  mahjong:      { color: "#ec4899", emojiCode: "1f004", subtitle: "Match free tiles to clear the board" },
  golf:         { color: "#22c55e", emojiCode: "26f3",  subtitle: "Chain cards ±1 to beat par" },
  fortythieves: { color: "#f97316", emojiCode: "1f3b4", subtitle: "Two decks, same-suit builds" },
  yukon:        { color: "#84cc16", emojiCode: "1f43b", subtitle: "All cards face-up from the start" },
  scorpion:     { color: "#eab308", emojiCode: "1f982", subtitle: "Same-suit sequences, 7 columns" },
  eightoff:     { color: "#06b6d4", emojiCode: "1f3af", subtitle: "Eight free cells, suit-only build" },
  canfield:     { color: "#f43f5e", emojiCode: "1f3b0", subtitle: "Draw 3, tough from the first card" },
  addiction:    { color: "#8b5cf6", emojiCode: "1f504", subtitle: "Slide cards left to sort by suit" },
  bakersdozen:  { color: "#0ea5e9", emojiCode: "1f0cf", subtitle: "Only the top card of each pile moves" },
  bakersgame:   { color: "#10b981", emojiCode: "1f3ae", subtitle: "FreeCell but suit-only builds" },
  clock:        { color: "#64748b", emojiCode: "1f550", subtitle: "Flip cards to fill the clock face" },
};

// Derive the runtime list from the canonical app registry.
// Throws if a game is missing OG metadata so the gap is immediately visible.
const GAMES = APP_GAMES.map((g) => {
  const meta = OG_META[g.saveKey];
  if (!meta) {
    throw new Error(
      `Missing OG metadata for game "${g.title}" (saveKey: "${g.saveKey}"). ` +
      `Add an entry to OG_META in scripts/gen-og-images.ts.`
    );
  }
  return {
    key: g.to.slice(1), // "/forty-thieves" → "forty-thieves" (used as filename)
    route: g.to,
    title: g.title,
    subtitle: meta.subtitle,
    emojiCode: meta.emojiCode,
    color: meta.color,
  };
});

async function fetchEmojiBase64(code: string): Promise<string> {
  // Try with and without variation selector suffix
  const urls = [
    `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}.png`,
    `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${code}-fe0f.png`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return Buffer.from(buf).toString("base64");
      }
    } catch {
      continue;
    }
  }
  throw new Error(`Could not fetch emoji PNG for code: ${code}`);
}

function buildSvg(game: (typeof GAMES)[0], emojiB64: string): string {
  const W = 1200, H = 630;
  // Escape game title for SVG text
  const safeTitle = game.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeSub = game.subtitle.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#0d1b2a"/>
      <stop offset="100%" stop-color="#060d14"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="35%">
      <stop offset="0%" stop-color="${game.color}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${game.color}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <!-- Neon accent bar at top -->
  <rect x="0" y="0" width="${W}" height="5" fill="${game.color}"/>
  <!-- Emoji -->
  <image x="${W / 2 - 110}" y="${H / 2 - 190}" width="220" height="220"
         href="data:image/png;base64,${emojiB64}"/>
  <!-- Game title -->
  <text x="${W / 2}" y="${H / 2 + 72}"
        font-family="system-ui, -apple-system, sans-serif"
        font-weight="700" font-size="58"
        fill="white" text-anchor="middle" dominant-baseline="middle">${safeTitle}</text>
  <!-- Subtitle / tagline -->
  <text x="${W / 2}" y="${H / 2 + 148}"
        font-family="system-ui, -apple-system, sans-serif"
        font-weight="400" font-size="30"
        fill="${game.color}" text-anchor="middle" dominant-baseline="middle">${safeSub}</text>
  <!-- Wordmark bottom-right -->
  <text x="${W - 36}" y="${H - 30}"
        font-family="system-ui, -apple-system, sans-serif"
        font-weight="500" font-size="22"
        fill="rgba(255,255,255,0.35)" text-anchor="end" dominant-baseline="middle">
    solitairestation.com
  </text>
</svg>`;
}

await mkdir("public/og", { recursive: true });

for (const game of GAMES) {
  process.stdout.write(`  ${game.key} ... `);
  const emojiB64 = await fetchEmojiBase64(game.emojiCode);
  const svg = buildSvg(game, emojiB64);
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const png = resvg.render().asPng();
  await Bun.write(`public/og/${game.key}.png`, png);
  console.log(`${png.length.toLocaleString()} bytes`);
}

console.log("\n✓ All OG images written to public/og/");
