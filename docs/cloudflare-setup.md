# Cloudflare WAF Setup — Social Crawler Bypass

## Problem

The live site is protected by Cloudflare's bot-protection layer (Browser Integrity
Check / Bot Fight Mode). Social-media preview crawlers — iMessage, Facebook, Slack,
Discord, Twitter/X, WhatsApp, LinkedIn — cannot execute JavaScript, so they receive
the Cloudflare challenge page instead of the real HTML. This breaks link previews
entirely: no title, no image, no description.

This was confirmed by fetching the live URL without a browser:

```
curl -A "facebookexternalhit/1.1" https://www.solitairestation.com/klondike
# => <title>Checking your browser before accessing...</title>
```

---

## Step 1 (preferred): Enable Cloudflare's Verified-Bot allow-list

Cloudflare maintains an official list of verified bots — crawlers whose source IPs
are cryptographically validated against their claimed identity. Enabling this is
safer than a User-Agent-only rule because it cannot be spoofed by arbitrary clients.

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com) and select the
   `solitairestation.com` zone.
2. Go to **Security → Bots**.
3. Enable **Bot Fight Mode** (or Super Bot Fight Mode) and make sure
   **Allow verified bots** is checked.

This immediately allows Googlebot, Bingbot, Applebot, and most major search/social
crawlers to pass through without a JS challenge.

**Which crawlers are already covered by the verified-bot list?**
Googlebot, Bingbot, Applebot, Twitterbot, LinkedInBot, Pinterest, and most
large-platform crawlers are on Cloudflare's list. You can see the full list in the
Cloudflare dashboard under **Security → Bots → Known Bots**.

---

## Step 2 (supplemental): Custom WAF rule for crawlers not on the verified list

Some social crawlers — notably iMessage/Applebot (when fetching link previews),
Discordbot, Slackbot, and WhatsApp — may not be on Cloudflare's verified-bot list
for your plan tier, or may still be blocked by a custom WAF rule.

> **Security note:** User-Agent strings are trivially spoofable. The rule below
> only skips **Browser Integrity Check** — a JavaScript CAPTCHA challenge — not
> the WAF, managed rules, or DDoS protection. Minimising the skipped protections
> limits the attack surface of the bypass.

### Add a Custom Rule

1. Go to **Security → WAF → Custom Rules** and click **Create rule**.
2. Name it `Social preview crawlers — skip BIC`.
3. In **Edit expression**, paste:

```
(http.user_agent contains "facebookexternalhit") or
(http.user_agent contains "Twitterbot") or
(http.user_agent contains "Slackbot") or
(http.user_agent contains "LinkedInBot") or
(http.user_agent contains "Discordbot") or
(http.user_agent contains "WhatsApp") or
(http.user_agent contains "Applebot") or
(http.user_agent contains "iMessageBot") or
(http.user_agent contains "TelegramBot") or
(http.user_agent contains "Pinterest")
```

4. Set **Action** to `Skip` and tick **only**:
   - ☑ Browser Integrity Check
   - ☐ WAF rules ← **leave unchecked** to retain attack protection
   - ☐ Rate limiting ← **leave unchecked**
5. Click **Deploy**.

> For production hardening, consider cross-referencing the crawlers' published
> IP ranges (e.g. Facebook's [crawl IPs](https://developers.facebook.com/docs/sharing/webmasters/crawler/)) and adding `ip.src in {...}` to the
> expression so the bypass only fires for verified source addresses, not for any
> client that spoofs the UA string.

---

## Verification

After the steps above, verify from the command line:

```bash
# Facebook crawler
curl -s -A "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" \
  https://www.solitairestation.com/klondike \
  | grep -o '<title>[^<]*</title>'
# Expected: <title>Solitaire Station — Free Klondike Solitaire</title>

# Twitter/X card bot
curl -s -A "Twitterbot/1.0" \
  https://www.solitairestation.com/klondike \
  | grep 'og:image'
# Expected: a <meta property="og:image" ... /> line

# Slack unfurl bot
curl -s -A "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)" \
  https://www.solitairestation.com/klondike \
  | grep 'og:title'
# Expected: a <meta property="og:title" ... /> line
```

---

## How the origin server responds

The origin Nitro/Node.js server performs full SSR for every request. Each route
file declares its own `head()` function that emits the correct `og:title`,
`og:description`, `og:image`, `twitter:card`, and `canonical` tags. No additional
server changes are needed once Cloudflare passes the crawler request through.

The server also appends `User-Agent` to the `Vary` response header for known
social-crawler requests (`src/server.ts`), so Cloudflare caches a separate entry
for crawlers vs regular browsers without dropping existing `Vary` values such as
`Accept-Encoding`.

---

## Cache purging

Cache purging now happens **automatically** at the end of every successful push to
`main` via the `Purge Cloudflare cache` step in `.github/workflows/smoke.yml`.
Two repository secrets must be set for it to work:

| Secret name    | Where to find it |
|----------------|-----------------|
| `CF_ZONE_ID`   | Cloudflare dashboard → your zone → Overview → Zone ID (right sidebar) |
| `CF_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token (use the "Cache Purge" template) |

Add both under **Settings → Secrets and variables → Actions** in the GitHub
repository.

### Manual purge (one-off)

If you need to purge outside of a deploy, run:

```bash
# Replace ZONE_ID and CF_API_TOKEN with the values from GitHub secrets
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

Or use **Caching → Configuration → Purge Cache → Purge Everything** in the
Cloudflare dashboard.

---

## Testing link previews

Use these tools to confirm previews look correct after the rule is live:

- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
- **Slack (unfurl):** paste a link in any Slack channel
- **iMessage:** send the link from an iPhone — the preview renders inline
