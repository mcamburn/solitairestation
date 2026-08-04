/**
 * Generates centered 1200×630 OG images for all 16 games.
 * Strategy:
 *   1. Sharp renders the card SVG icon (shapes/gradients only — resvg handles these fine).
 *   2. ImageMagick composites the background, card, and all text layers.
 *
 * Run: bun scripts/generate-og.mjs
 */
import sharp from "sharp";
import { execSync } from "child_process";
import { existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT   = resolve(__dir, "../public/og");
const CARD_TMP = "/tmp/og-card-icon.png";

const W = 1200, H = 630;
// Card: 168 × 205 px, centered horizontally, near top
const CARD_W = 168, CARD_H = 205;
const CARD_X = Math.round((W - CARD_W) / 2); // 516
const CARD_Y = 48;

/* ── Card icon (no text — purely shapes + gradients) ──────────────────── */
const CARD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0d060"/>
      <stop offset="100%" stop-color="#a87820"/>
    </linearGradient>
    <filter id="sh" x="-30%" y="-20%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="10"
        flood-color="#000" flood-opacity="0.55"/>
    </filter>
  </defs>
  <!-- Card body -->
  <rect x="2" y="2" width="${CARD_W-4}" height="${CARD_H-4}"
    rx="${Math.round(CARD_W*0.11)}" fill="url(#g)" filter="url(#sh)"/>
  <!-- Inset border -->
  <rect x="5" y="5" width="${CARD_W-10}" height="${CARD_H-10}"
    rx="${Math.round(CARD_W*0.08)}" fill="none"
    stroke="#f5e080" stroke-width="1.2" stroke-opacity="0.4"/>
  <!-- Spade suit, scaled from 36×44 viewBox -->
  <g transform="scale(${(CARD_W/36).toFixed(4)})">
    <circle cx="13" cy="22" r="7.2" fill="#1a3020"/>
    <circle cx="23" cy="22" r="7.2" fill="#1a3020"/>
    <polygon points="18,10 11,24 25,24" fill="#1a3020"/>
    <rect x="15.5" y="28" width="5" height="5" rx="1" fill="#1a3020"/>
    <ellipse cx="18" cy="35" rx="5.5" ry="2" fill="#1a3020"/>
  </g>
</svg>`;

/* ── Game list ─────────────────────────────────────────────────────────── */
const GAMES = [
  { slug: "klondike",      name: "Klondike Solitaire",       accent: "#d4a820" },
  { slug: "golf",          name: "Golf Solitaire",            accent: "#2ecc8a" },
  { slug: "yukon",         name: "Yukon Solitaire",           accent: "#d4a820" },
  { slug: "spider",        name: "Spider Solitaire",          accent: "#2ecc8a" },
  { slug: "freecell",      name: "FreeCell Solitaire",        accent: "#d4a820" },
  { slug: "pyramid",       name: "Pyramid Solitaire",         accent: "#e05555" },
  { slug: "mahjong",       name: "Mahjong Solitaire",         accent: "#e05555" },
  { slug: "tripeaks",      name: "TriPeaks Solitaire",        accent: "#2ecc8a" },
  { slug: "forty-thieves", name: "Forty Thieves Solitaire",   accent: "#d4a820" },
  { slug: "scorpion",      name: "Scorpion Solitaire",        accent: "#2ecc8a" },
  { slug: "eight-off",     name: "Eight Off Solitaire",       accent: "#d4a820" },
  { slug: "canfield",      name: "Canfield Solitaire",        accent: "#e05555" },
  { slug: "bakers-dozen",  name: "Baker's Dozen Solitaire",   accent: "#d4a820" },
  { slug: "bakers-game",   name: "Baker's Game Solitaire",    accent: "#2ecc8a" },
  { slug: "clock",         name: "Clock Solitaire",           accent: "#cc77ee" },
  { slug: "addiction",     name: "Addiction Solitaire",       accent: "#cc77ee" },
];

/* ── Helpers ───────────────────────────────────────────────────────────── */
/** Escape a string for ImageMagick -annotate (wrap in quotes is handled in execSync) */
function imEscape(s) {
  return s.replace(/'/g, "'\\''");
}

function buildCmd(slug, name, accent) {
  // Vertical positions for text baselines (gravity North = offset from top-center)
  const brandY   = CARD_Y + CARD_H + 70;   // ~323
  const nameY    = brandY + 60;             // ~383
  const taglineY = nameY  + 52;             // ~435
  const domainY  = H - 24;                  // ~606 (switch to gravity South offset later)

  // Gradient background via -sparse-color Barycentric
  // Simpler: two-color top-left → bottom-right with -fx (slow) or just solid + radial vignette
  // We'll use: solid base + a darker radial overlay for depth
  const bg = "#152e1a";

  // Accent line at top: a 1200×4 rectangle composited at 0,0
  // We use `( ... )` grouping to layer operations
  const cmd = [
    "magick",
    // 1. Create base background
    `-size ${W}x${H}`, `xc:'${bg}'`,
    // 2. Subtle vignette overlay (radial gradient dark → transparent at edges)
    `\\( -size ${W}x${H} radial-gradient:'#00000000-#00000066' \\)`,
    "-composite",
    // 3. Thin accent line at very top
    `\\( -size ${W}x5 xc:'${accent}' \\)`,
    "-geometry +0+0", "-composite",
    // 4. Card icon PNG
    `${CARD_TMP}`,
    `-geometry +${CARD_X}+${CARD_Y}`, "-composite",
    // 5. Brand name — DejaVu Serif Bold, accent color
    "-font", "DejaVu-Serif-Bold",
    "-pointsize", "64",
    "-fill", `'${accent}'`,
    "-gravity", "North",
    "-annotate", `+0+${brandY}`, `'Solitaire Station'`,
    // 6. Separator — thin line between brand and game name
    `\\( -size 280x2 xc:'${accent}44' \\)`,
    `-geometry +${Math.round((W-280)/2)}+${brandY + 74}`, "-composite",
    // 7. Game name — DejaVu Sans Bold, off-white
    "-font", "DejaVu-Sans-Bold",
    "-pointsize", "36",
    "-fill", "'#f0ede4'",
    "-gravity", "North",
    "-annotate", `+0+${nameY}`, `'${imEscape(name)}'`,
    // 8. Tagline — DejaVu Sans, muted green, letter-spaced via word-spacing trick
    "-font", "DejaVu-Sans",
    "-pointsize", "19",
    "-fill", "'#6aaa7a'",
    "-gravity", "North",
    "-annotate", `+0+${taglineY}`, "'FREE  ·  NO ADS  ·  NO DOWNLOAD'",
    // 9. Domain — bottom center, very muted
    "-font", "DejaVu-Sans",
    "-pointsize", "15",
    "-fill", "'#4a7a5a'",
    "-gravity", "South",
    "-annotate", `+0+24`, "'SOLITAIRESTATION.COM'",
    // Output
    `'${OUT}/${slug}.png'`,
  ].join(" ");

  return cmd;
}

/* ── Main ──────────────────────────────────────────────────────────────── */
console.log("Generating card icon PNG via Sharp…");
await sharp(Buffer.from(CARD_SVG))
  .resize(CARD_W, CARD_H)
  .png()
  .toFile(CARD_TMP);
console.log(`  Card saved to ${CARD_TMP}`);

console.log("Generating OG images via ImageMagick…");
for (const { slug, name, accent } of GAMES) {
  const cmd = buildCmd(slug, name, accent);
  execSync(cmd, { stdio: "pipe" });
  console.log(`  ✓ ${slug}.png`);
}
console.log("Done.");
