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
  // decorative scattered suit symbols
  const scatterSeeds = [
    { x: 60,  y: 80,  sym: game.suits[0], op: 0.07, sz: 80 },
    { x: 200, y: 500, sym: game.suits[1], op: 0.06, sz: 65 },
    { x: 900, y: 50,  sym: game.suits[2], op: 0.07, sz: 90 },
    { x: 1050,y: 480, sym: game.suits[3], op: 0.06, sz: 70 },
    { x: 500, y: 560, sym: game.suits[0], op: 0.04, sz: 55 },
    { x: 700, y: 30,  sym: game.suits[1], op: 0.05, sz: 60 },
  ];

  const scatter = scatterSeeds
    .map(
      ({ x, y, sym, op, sz }) =>
        `<text x="${x}" y="${y}" font-family="Georgia,serif" font-size="${sz}"
          fill="${game.accent}" opacity="${op}" text-anchor="middle">${sym}</text>`
    )
    .join("\n    ");

  // subtle vignette
  const vignette = `
    <defs>
      <radialGradient id="vig" cx="50%" cy="50%" r="70%">
        <stop offset="0%"   stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.45"/>
      </radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="#2a5c38" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#2a5c38" stop-opacity="0"/>
      </radialGradient>
    </defs>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${vignette}

  <!-- Background: dark green felt -->
  <rect width="${W}" height="${H}" fill="#1a3d22"/>

  <!-- Subtle felt texture stripes -->
  ${Array.from({ length: 32 }, (_, i) =>
    `<rect x="0" y="${i * 20}" width="${W}" height="10" fill="#1e4226" opacity="0.4"/>`
  ).join("\n  ")}

  <!-- Center glow -->
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Decorative suit symbols -->
  ${scatter}

  <!-- Gold accent top bar -->
  <rect x="0" y="0" width="${W}" height="6" fill="${game.accent}" opacity="0.9"/>
  <!-- Gold accent bottom bar -->
  <rect x="0" y="${H - 6}" width="${W}" height="6" fill="${game.accent}" opacity="0.9"/>

  <!-- Vignette overlay -->
  <rect width="${W}" height="${H}" fill="url(#vig)"/>

  <!-- Card logo (centred left area) -->
  <g transform="translate(120, 210) scale(2.4)">
    ${CARD_SVG}
  </g>

  <!-- Divider line -->
  <line x1="420" y1="180" x2="420" y2="450" stroke="${game.accent}" stroke-width="1.5" stroke-opacity="0.4"/>

  <!-- Brand: "Solitaire Station" -->
  <text
    x="480" y="258"
    font-family="DejaVu Serif, serif"
    font-size="68"
    font-weight="700"
    fill="${game.accent}"
    letter-spacing="1"
  >Solitaire Station</text>

  <!-- Game name -->
  <text
    x="482" y="335"
    font-family="DejaVu Serif, serif"
    font-size="42"
    font-weight="400"
    fill="#e8dfc8"
    letter-spacing="0.5"
    opacity="0.92"
  >${game.label}</text>

  <!-- Tagline -->
  <text
    x="484" y="388"
    font-family="DejaVu Sans, sans-serif"
    font-size="24"
    font-weight="400"
    fill="#a0c0a8"
    letter-spacing="2"
    opacity="0.80"
  >FREE · NO ADS · NO DOWNLOAD</text>

  <!-- Bottom domain -->
  <text
    x="${W / 2}" y="${H - 28}"
    font-family="DejaVu Sans, sans-serif"
    font-size="20"
    fill="${game.accent}"
    text-anchor="middle"
    opacity="0.55"
    letter-spacing="3"
  >FREE-KLONDIKE-SOLITAIRE.COM</text>
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
