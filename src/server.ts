import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

// Kick off the import at module load time so the handler is warm before
// the first request arrives, reducing cold-start TTFB on the initial hit.
const serverEntryPromise: Promise<ServerEntry> = import(
  "@tanstack/react-start/server-entry"
).then((m) => (m.default ?? m) as ServerEntry);

async function getServerEntry(): Promise<ServerEntry> {
  return serverEntryPromise;
}

// ---------------------------------------------------------------------------
// Cache-Control helpers
// ---------------------------------------------------------------------------

/**
 * Paths whose SSR output is identical for every visitor — no user-specific data
 * is injected server-side, so it's safe to cache rendered HTML at the CDN edge.
 *
 * Game pages: all game state lives in localStorage (client only).
 * Guide/landing pages: fully static prose.
 * About/guides index: static.
 *
 * Terms and privacy get a long 24-hour TTL because the content almost never
 * changes. Everything else gets 5 min + 1 h stale-while-revalidate.
 */
const LONG_CACHE_PATHS = new Set(["/terms", "/privacy"]);

const GAME_AND_LANDING_PATHS = new Set([
  // 16 core game routes
  "/klondike", "/spider", "/freecell", "/pyramid", "/tripeaks", "/mahjong",
  "/golf", "/forty-thieves", "/yukon", "/scorpion", "/eight-off", "/canfield",
  "/addiction", "/bakers-dozen", "/bakers-game", "/clock",
  // SEO landing / variant pages
  "/klondike-solitaire", "/spider-solitaire", "/freecell-solitaire",
  "/turn-1-solitaire", "/turn-3-solitaire", "/vegas-solitaire",
  "/2-suit-spider-solitaire", "/4-suit-spider-solitaire", "/1-suit-spider-solitaire",
  "/double-klondike",
  // Info pages
  "/about", "/guides",
]);

function isCacheablePath(pathname: string): "long" | "short" | null {
  if (LONG_CACHE_PATHS.has(pathname)) return "long";
  if (GAME_AND_LANDING_PATHS.has(pathname)) return "short";
  if (pathname.startsWith("/guides/")) return "short"; // all 65 guide articles
  return null;
}

/**
 * Attach Cache-Control to HTML GET responses so Cloudflare (and browsers) can
 * cache the rendered page.  A Cloudflare Cache Rule that caches HTML must also
 * be enabled in the dashboard for edge caching to take effect.
 */
function withCacheHeaders(request: Request, response: Response): Response {
  if (request.method !== "GET") return response;
  if (response.status < 200 || response.status >= 300) return response;
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) return response;

  const { pathname } = new URL(request.url);
  const tier = isCacheablePath(pathname);
  if (!tier) return response;

  const cc =
    tier === "long"
      ? "public, max-age=86400, stale-while-revalidate=86400"   // 24 h / 24 h
      : "public, max-age=300, stale-while-revalidate=3600";      // 5 min / 1 h

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", cc);
  // Cloudflare uses CDN-Cache-Control when present; set both for safety
  headers.set("CDN-Cache-Control", cc);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return withCacheHeaders(request, normalized);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
