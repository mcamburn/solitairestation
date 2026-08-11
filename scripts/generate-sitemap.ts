#!/usr/bin/env bun
/**
 * generate-sitemap.ts
 *
 * Regenerates public/sitemap.xml from:
 *   - GAMES in src/lib/games.ts  (core game pages)
 *   - src/routes/               (auto-discovered SEO variant pages)
 *   - GUIDES in src/lib/guides.ts (guide articles)
 *
 * Usage:
 *   bun run scripts/generate-sitemap.ts
 *   (also called automatically as part of `bun run build`)
 */

import { writeFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { GAMES } from "../src/lib/games";
import { GUIDES } from "../src/lib/guides";

// ── Config ───────────────────────────────────────────────────────────────────

const SITE = "https://www.solitairestation.com";

/** ISO date used as <lastmod> for game/SEO pages that change with deployments */
const TODAY = new Date().toISOString().slice(0, 10);

const ROOT = resolve(import.meta.dir, "..");

// ── Derive core game slugs from GAMES registry ───────────────────────────────

/**
 * Core game slugs derived from the canonical GAMES list in src/lib/games.ts.
 * Strip the leading "/" from each `to` field.
 */
const coreGameSlugs: string[] = GAMES.map((g) => g.to.replace(/^\//, ""));

/**
 * Extra game routes that exist in src/routes/ but are not (yet) in the GAMES
 * switcher list. Add slugs here when a route file is created before the game
 * is promoted to the switcher.
 */
const EXTRA_GAME_SLUGS: string[] = [
  "double-klondike",
];

const ALL_CORE_SLUGS = [...coreGameSlugs, ...EXTRA_GAME_SLUGS];

// ── Auto-discover SEO variant pages from routes directory ────────────────────

/**
 * Pages that are NOT SEO variant pages — excluded from the auto-discovery scan.
 * Includes core game slugs, utility pages, the guides folder, and special files.
 */
const NON_SEO_ROUTES = new Set([
  ...ALL_CORE_SLUGS,
  "about",
  "stats",
  "privacy",
  "terms",
  "index",
  "__root",
  "guides", // directory — handled separately
]);

/**
 * Scan src/routes/ for .tsx files that are SEO variant landing pages.
 * A file is considered an SEO variant if its slug is not in NON_SEO_ROUTES.
 */
function discoverSeoVariants(): string[] {
  const routesDir = resolve(ROOT, "src/routes");
  const entries = readdirSync(routesDir, { withFileTypes: true });
  const variants: string[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".tsx") && !entry.name.endsWith(".ts")) continue;

    // Convert filename to URL slug: strip extension, leave hyphens/digits intact
    const slug = entry.name.replace(/\.(tsx|ts)$/, "");
    if (!NON_SEO_ROUTES.has(slug)) {
      variants.push(slug);
    }
  }

  // Sort for stable output
  return variants.sort();
}

const SEO_VARIANTS = discoverSeoVariants();

// ── XML helpers ──────────────────────────────────────────────────────────────

function urlEntry(
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

// Homepage — real landing page with 16 game tiles
sections.push("\n  <!-- ── Homepage ────────────────────────────────────────────── -->");
sections.push(urlEntry(`${SITE}/`, TODAY, "weekly", "1.0"));

// Core game pages
sections.push("\n  <!-- ── Core game pages ─────────────────────────────────────── -->");
for (const slug of ALL_CORE_SLUGS) {
  sections.push(urlEntry(`${SITE}/${slug}`, TODAY, "weekly", "0.9"));
}

// SEO variant pages
sections.push("\n  <!-- ── SEO variant pages ────────────────────────────────────── -->");
for (const slug of SEO_VARIANTS) {
  sections.push(urlEntry(`${SITE}/${slug}`, TODAY, "weekly", "0.8"));
}

// Guides index
sections.push("\n  <!-- ── Guides index ─────────────────────────────────────────── -->");
sections.push(urlEntry(`${SITE}/guides`, TODAY, "weekly", "0.8"));

// Guide articles — sourced dynamically from GUIDES registry
sections.push("\n  <!-- ── Guide articles ───────────────────────────────────────── -->");
for (const guide of GUIDES) {
  const lastmod = guide.datePublished ?? "2025-06-01";
  sections.push(urlEntry(`${SITE}/guides/${guide.slug}`, lastmod, "monthly", "0.7"));
}

// Utility pages
sections.push("\n  <!-- ── Utility pages ────────────────────────────────────────── -->");
sections.push(urlEntry(`${SITE}/about`,   TODAY, "monthly", "0.7"));
sections.push(urlEntry(`${SITE}/stats`,   TODAY, "monthly", "0.5"));
sections.push(urlEntry(`${SITE}/privacy`, TODAY, "yearly",  "0.3"));
sections.push(urlEntry(`${SITE}/terms`,   TODAY, "yearly",  "0.3"));

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

const outPath = resolve(ROOT, "public/sitemap.xml");
writeFileSync(outPath, xml, "utf-8");

const total =
  ALL_CORE_SLUGS.length + SEO_VARIANTS.length + 1 + GUIDES.length + 4;
console.log(
  `✓ sitemap.xml written — ${total} URLs` +
  ` (${ALL_CORE_SLUGS.length} games, ${SEO_VARIANTS.length} SEO variants, ${GUIDES.length} guide articles)`,
);
