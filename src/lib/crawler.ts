/**
 * Social-media preview crawler detection.
 *
 * Patterns covering the user agents sent by the major link-preview services.
 * Used in the smoke test to verify the origin server returns correct OG tags
 * for crawler requests (see scripts/smoke-test.sh step 6).
 *
 * The WAF bypass expression in docs/cloudflare-setup.md intentionally uses a
 * narrower set of patterns — it only lists crawlers that are confirmed NOT on
 * Cloudflare's built-in verified-bot allow-list. This file is broader: it
 * covers all known social-preview UAs for origin-level detection purposes.
 */

export const SOCIAL_CRAWLER_UA_PATTERNS: readonly string[] = [
  "facebookexternalhit",
  "Twitterbot",
  "Slackbot",
  "LinkedInBot",
  "Discordbot",
  "WhatsApp",
  "Applebot",
  "iMessageBot",
  "Googlebot",
  "bingbot",
  "TelegramBot",
  "Pinterest",
  "Embedly",
  "vkShare",
  "Iframely",
];

/**
 * Returns true when the given User-Agent string belongs to a known
 * social-media preview crawler.
 */
export function isSocialCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return SOCIAL_CRAWLER_UA_PATTERNS.some((pattern) =>
    ua.includes(pattern.toLowerCase()),
  );
}
