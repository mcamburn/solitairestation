#!/usr/bin/env bun
/**
 * ping-indexnow.ts
 *
 * Submits all URLs from public/sitemap.xml to IndexNow (Bing endpoint).
 * Safe to run after every successful deploy — IndexNow deduplicates on its end.
 *
 * Usage:
 *   bun run scripts/ping-indexnow.ts          # uses hardcoded key
 *   INDEXNOW_KEY=<key> bun run scripts/ping-indexnow.ts
 *
 * IndexNow spec: https://www.indexnow.org/documentation
 */

import { readFileSync } from "fs";
import { join } from "path";

const KEY =
  process.env.INDEXNOW_KEY ?? "905a663e-75b7-4f29-94ca-16346a932293";
const HOST = "www.solitairestation.com";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_PATH = join(import.meta.dir, "../public/sitemap.xml");

// ── Parse URLs from sitemap ───────────────────────────────────────────────────
const xml = readFileSync(SITEMAP_PATH, "utf-8");
const urls: string[] = [];
for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  urls.push(match[1].trim());
}

if (urls.length === 0) {
  console.error("ERROR: no URLs found in sitemap.xml");
  process.exit(1);
}

console.log(`Found ${urls.length} URLs in sitemap.xml`);

// ── Submit to IndexNow ────────────────────────────────────────────────────────
// Bing's endpoint propagates to Yandex and other IndexNow participants.
const ENDPOINT = "https://www.bing.com/indexnow";

const body = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
});

console.log(`Pinging IndexNow (${ENDPOINT})…`);

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body,
});

if (res.ok || res.status === 202) {
  console.log(`  OK  ${res.status} — ${urls.length} URL(s) submitted`);
} else {
  const text = await res.text().catch(() => "");
  console.error(`  FAIL  ${res.status} — ${text}`);
  process.exit(1);
}
