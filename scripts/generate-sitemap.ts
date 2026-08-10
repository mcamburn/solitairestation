#!/usr/bin/env bun
/**
 * generate-sitemap.ts
 *
 * Regenerates public/sitemap.xml from the live GUIDES registry in
 * src/lib/guides.ts so the sitemap never drifts when articles are added.
 *
 * Usage:
 *   bun run scripts/generate-sitemap.ts
 *   (also called automatically as part of `bun run build`)
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import { GUIDES } from "../src/lib/guides";

// ── Config ───────────────────────────────────────────────────────────────────

const SITE = "https://www.solitairestation.com";

/** ISO date used as <lastmod> for game/SEO pages that change with deployments */
const TODAY = new Date().toISOString().slice(0, 10);

// ── Static route tables ──────────────────────────────────────────────────────

/** Core game pages — one per playable game */
const CORE_GAMES = [
  "klondike", "spider", "freecell", "pyramid", "tripeaks",
  "mahjong", "golf", "forty-thieves", "yukon", "scorpion",
  "eight-off", "canfield", "addiction", "bakers-dozen",
  "bakers-game", "clock", "double-klondike",
];

/** SEO landing/variant pages */
const SEO_VARIANTS = [
  "klondike-solitaire",
  "spider-solitaire",
  "freecell-solitaire",
  "turn-1-solitaire",
  "turn-3-solitaire",
  "vegas-solitaire",
  "1-suit-spider-solitaire",
  "2-suit-spider-solitaire",
  "4-suit-spider-solitaire",
];

// ── XML helpers ──────────────────────────────────────────────────────────────

function url(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string,
): string {
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

// ── Build URL list ───────────────────────────────────────────────────────────

const sections: string[] = [];

// Homepage is currently a 302 redirect to /klondike — excluded from sitemap
// until the route serves its own content (task: homepage SEO content).

// Core game pages
sections.push("\n  <!-- ── Core game pages ─────────────────────────────────────── -->");
for (const slug of CORE_GAMES) {
  sections.push(url(`${SITE}/${slug}`, TODAY, "weekly", "0.9"));
}

// SEO variant pages
sections.push("\n  <!-- ── SEO variant pages ────────────────────────────────────── -->");
for (const slug of SEO_VARIANTS) {
  sections.push(url(`${SITE}/${slug}`, TODAY, "weekly", "0.8"));
}

// Guides index
sections.push("\n  <!-- ── Guides index ─────────────────────────────────────────── -->");
sections.push(url(`${SITE}/guides`, TODAY, "weekly", "0.8"));

// Guide articles — sourced dynamically from GUIDES registry
sections.push("\n  <!-- ── Guide articles ───────────────────────────────────────── -->");
for (const guide of GUIDES) {
  const lastmod = guide.datePublished ?? "2025-06-01";
  sections.push(url(`${SITE}/guides/${guide.slug}`, lastmod, "monthly", "0.7"));
}

// Utility pages
sections.push("\n  <!-- ── Utility pages ────────────────────────────────────────── -->");
sections.push(url(`${SITE}/about`,   TODAY, "monthly", "0.7"));
sections.push(url(`${SITE}/privacy`, TODAY, "yearly",  "0.3"));
sections.push(url(`${SITE}/terms`,   TODAY, "yearly",  "0.3"));

// ── Write file ───────────────────────────────────────────────────────────────

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  "",
  ...sections,
  "",
  "</urlset>",
  "", // trailing newline
].join("\n");

const outPath = resolve(import.meta.dir, "../public/sitemap.xml");
writeFileSync(outPath, xml, "utf-8");

const total = CORE_GAMES.length + SEO_VARIANTS.length + 1 + GUIDES.length + 3;
console.log(`✓ sitemap.xml written — ${total} URLs (${GUIDES.length} guide articles)`);
