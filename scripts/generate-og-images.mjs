/**
 * Generates OG social-preview images for all Solitaire Station games.
 * Uses SVG templates rendered to PNG via @resvg/resvg-js.
 * Output: public/og/{game}.png  (1200 × 630 px)
 *
 * Game list is imported from scripts/og-game-registry.mjs — the single
 * source of truth.  To add a new game, update that file and re-run this script.
 */

import { Resvg } from "@resvg/resvg-js";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { OG_GAMES } from "./og-game-registry.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "og");
mkdirSync(outDir, { recursive: true });

const games = OG_GAMES;

// Card SVG path data (matches favicon.svg design — gold card with spade)
const CARD_SVG = `
  <defs>
    <filter id="cs" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0d060"/>
      <stop offset="100%" stop-color="#a87820"/>
    </linearGradient>
  </defs>
  <!-- Card body -->
  <rect x="0" y="0" width="110" height="138" rx="14" fill="url(#cg)" filter="url(#cs)"/>
  <!-- Inset border -->
  <rect x="5" y="5" width="100" height="128" rx="10" fill="none" stroke="#f5e080" stroke-width="2" stroke-opacity="0.5"/>
  <!-- Spade center -->
  <circle cx="40" cy="70" r="23" fill="#1a3020"/>
  <circle cx="70" cy="70" r="23" fill="#1a3020"/>
  <polygon points="55,30 35,76 75,76" fill="#1a3020"/>
  <rect x="46" y="88" width="18" height="16" rx="3" fill="#1a3020"/>
  <ellipse cx="55" cy="110" rx="18" ry="7" fill="#1a3020"/>
  <!-- Corner labels -->
  <text x="10" y="30" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#1a3020">♠</text>
  <text x="70" y="130" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#1a3020" transform="rotate(180 82 123)">♠</text>
`;

function makeSvg(game) {
  const W = 1200, H = 630;

  // Card icon: scale to ~120×150 px, centered horizontally.
  // Slightly smaller than before so text can be larger while still fitting
  // within the top ~300 px that iMessage crops to.
  const CARD_SCALE = 1.09; // 110 * 1.09 ≈ 120 px wide
  const CARD_W = Math.round(110 * CARD_SCALE); // 120
  const CARD_X = Math.round((W - CARD_W) / 2); // centered
  const CARD_Y = 18;
  const CARD_H = Math.round(138 * CARD_SCALE); // ~150

  // Text baseline positions — tight spacing so iMessage crop shows all content
  const brandY   = CARD_Y + CARD_H + 36;  // ~204
  const nameY    = brandY + 62;            // ~266
  const taglineY = nameY  + 44;            // ~310

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="vig" cx="50%" cy="50%" r="70%">
      <stop offset="0%"   stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.4"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="#152e1a"/>

  <!-- Subtle felt texture stripes -->
  ${Array.from({ length: 32 }, (_, i) =>
    `<rect x="0" y="${i * 20}" width="${W}" height="10" fill="#1a3520" opacity="0.35"/>`
  ).join("\n  ")}

  <!-- Vignette -->
  <rect width="${W}" height="${H}" fill="url(#vig)"/>

  <!-- Thin accent line at top -->
  <rect x="0" y="0" width="${W}" height="5" fill="${game.accent}" opacity="0.85"/>

  <!-- Card icon — top-center -->
  <g transform="translate(${CARD_X}, ${CARD_Y}) scale(${CARD_SCALE})">
    ${CARD_SVG}
  </g>

  <!-- Brand: "Solitaire Station" — centered -->
  <text
    x="${W / 2}" y="${brandY}"
    font-family="DejaVu Serif, serif"
    font-size="58"
    font-weight="700"
    fill="${game.accent}"
    text-anchor="middle"
  >Solitaire Station</text>

  <!-- Game name — centered, large and bright for easy reading -->
  <text
    x="${W / 2}" y="${nameY}"
    font-family="DejaVu Serif, serif"
    font-size="64"
    font-weight="700"
    fill="#ffffff"
    text-anchor="middle"
  >${game.label}</text>

  <!-- Tagline — centered -->
  <text
    x="${W / 2}" y="${taglineY}"
    font-family="DejaVu Sans, sans-serif"
    font-size="26"
    font-weight="400"
    fill="#a0c0a8"
    text-anchor="middle"
    opacity="0.90"
  >FREE  ·  NO ADS  ·  NO DOWNLOAD</text>

  <!-- Bottom domain — centered -->
  <text
    x="${W / 2}" y="${H - 26}"
    font-family="DejaVu Sans, sans-serif"
    font-size="17"
    fill="${game.accent}"
    text-anchor="middle"
    opacity="0.50"
    letter-spacing="2"
  >SOLITAIRESTATION.COM</text>
</svg>`;
}

for (const game of games) {
  const svg = makeSvg(game);
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      loadSystemFonts: false,
      fontDirs: ["/usr/share/fonts/truetype/dejavu"],
      defaultFontFamily: "DejaVu Serif",
    },
  });
  const pngData = resvg.render();
  const png = pngData.asPng();
  const outPath = join(outDir, `${game.id}.png`);
  writeFileSync(outPath, png);
  console.log(`✓  ${outPath}  (${(png.length / 1024).toFixed(0)} KB)`);
}

console.log("\nDone — all OG images generated.");
