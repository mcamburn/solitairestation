/**
 * Generates 1200×630 PNG Open Graph images for each game.
 * Run with:  bun scripts/gen-og-images.ts
 */
import { Resvg } from "@resvg/resvg-js";
import { mkdir } from "node:fs/promises";

const GAMES = [
  {
    key: "klondike",
    route: "/",
    title: "Klondike Solitaire",
    subtitle: "The classic you know and love",
    emojiCode: "1f0cf",
    color: "#00ff87",
  },
  {
    key: "spider",
    route: "/spider",
    title: "Spider Solitaire",
    subtitle: "Build eight suit sequences to win",
    emojiCode: "1f577",
    color: "#a855f7",
  },
  {
    key: "freecell",
    route: "/freecell",
    title: "FreeCell Solitaire",
    subtitle: "Nearly every deal is solvable",
    emojiCode: "1f532",
    color: "#3b82f6",
  },
  {
    key: "pyramid",
    route: "/pyramid",
    title: "Pyramid Solitaire",
    subtitle: "Pair cards that sum to 13",
    emojiCode: "1f53a",
    color: "#f59e0b",
  },
  {
    key: "tripeaks",
    route: "/tripeaks",
    title: "TriPeaks Solitaire",
    subtitle: "Chain plays for a streak bonus",
    emojiCode: "26f0",
    color: "#ef4444",
  },
  {
    key: "mahjong",
    route: "/mahjong",
    title: "Mahjong Solitaire",
    subtitle: "Match free tiles to clear the board",
    emojiCode: "1f004",
    color: "#ec4899",
  },
  {
    key: "golf",
    route: "/golf",
    title: "Golf Solitaire",
    subtitle: "Chain cards ±1 to beat par",
    emojiCode: "26f3",
    color: "#22c55e",
  },
  {
    key: "forty-thieves",
    route: "/forty-thieves",
    title: "Forty Thieves",
    subtitle: "Two decks, same-suit builds",
    emojiCode: "1f3b4",
    color: "#f97316",
  },
  {
    key: "yukon",
    route: "/yukon",
    title: "Yukon Solitaire",
    subtitle: "All cards face-up from the start",
    emojiCode: "1f43b",
    color: "#84cc16",
  },
  {
    key: "scorpion",
    route: "/scorpion",
    title: "Scorpion Solitaire",
    subtitle: "Same-suit sequences, 7 columns",
    emojiCode: "1f982",
    color: "#eab308",
  },
  {
    key: "eight-off",
    route: "/eight-off",
    title: "Eight Off",
    subtitle: "Eight free cells, suit-only build",
    emojiCode: "1f3af",
    color: "#06b6d4",
  },
  {
    key: "canfield",
    route: "/canfield",
    title: "Canfield Solitaire",
    subtitle: "Draw 3, tough from the first card",
    emojiCode: "1f3b0",
    color: "#f43f5e",
  },
  {
    key: "addiction",
    route: "/addiction",
    title: "Addiction Solitaire",
    subtitle: "Slide cards left to sort by suit",
    emojiCode: "1f504",
    color: "#8b5cf6",
  },
  {
    key: "bakers-dozen",
    route: "/bakers-dozen",
    title: "Baker's Dozen",
    subtitle: "Only the top card of each pile moves",
    emojiCode: "1f0cf",
    color: "#0ea5e9",
  },
  {
    key: "bakers-game",
    route: "/bakers-game",
    title: "Baker's Game",
    subtitle: "FreeCell but suit-only builds",
    emojiCode: "1f3ae",
    color: "#10b981",
  },
  {
    key: "clock",
    route: "/clock",
    title: "Clock Solitaire",
    subtitle: "Flip cards to fill the clock face",
    emojiCode: "1f550",
    color: "#64748b",
  },
];

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
