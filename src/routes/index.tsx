import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { GAMES } from "@/lib/games";
import { SITE_URL } from "@/lib/site";

const TITLE = "Solitaire Station — 16 Free Online Solitaire Games";
const DESC =
  "Play 16 free solitaire games online — Klondike, Spider, FreeCell, Pyramid, TriPeaks, Mahjong, and more. No download, no sign-up. Play instantly in your browser.";
const OG_IMG = `${SITE_URL}/og/klondike.png?v=6`;

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Solitaire Station",
  url: SITE_URL,
  description: DESC,
  inLanguage: "en-US",
  publisher: {
    "@type": "Organization",
    name: "Solitaire Station",
    url: SITE_URL,
  },
});

function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />

      <main className="mx-auto min-h-screen w-full max-w-[900px] xl:max-w-[1200px] px-4 py-10 sm:py-16">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="mb-12 sm:mb-16 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Free · No download · No sign-up
          </p>
          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Play Free Solitaire Online
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Sixteen of the world's best solitaire games in one place — Klondike,
            Spider, FreeCell, Pyramid, TriPeaks, Mahjong, and ten more. Instant
            play in any browser.
          </p>
          <Link
            to="/klondike"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
          >
            Play Klondike Solitaire →
          </Link>
        </div>

        {/* ── All 16 games ────────────────────────────────────────────────── */}
        <section aria-labelledby="games-heading">
          <h2
            id="games-heading"
            className="mb-6 text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            All 16 games
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {GAMES.map((game) => (
              <Link
                key={game.to}
                to={game.to}
                className="group flex flex-col gap-1.5 rounded-xl border border-border/40 bg-surface/40 p-4 transition hover:border-border hover:bg-surface/70"
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {game.emoji}
                </span>
                <span className="mt-1 text-sm font-semibold leading-snug text-foreground group-hover:underline">
                  {game.title}
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {game.desc}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── SEO body content ────────────────────────────────────────────── */}
        <section className="mt-14 sm:mt-20 max-w-[760px] space-y-8 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="mb-3 text-base font-bold tracking-tight text-foreground">
              Free solitaire — no download, no sign-up
            </h2>
            <p>
              Solitaire Station is a free online solitaire platform built for players
              who want a clean, distraction-free card game right in their browser.
              Every game auto-saves your progress, supports unlimited undo, and
              includes hints — so you can focus on the cards, not the interface.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold tracking-tight text-foreground">
              Classic games and challenging variants
            </h2>
            <p>
              Whether you prefer the straightforward draw-and-build of Klondike, the
              tactical depth of FreeCell, the chain-building speed of TriPeaks, or the
              tile-matching puzzle of Mahjong, you'll find it here. Spider Solitaire
              comes in three difficulty variants — 1 suit, 2 suits, and 4 suits — so
              you can match the challenge to your skill level.
            </p>
          </div>
          <div>
            <h2 className="mb-3 text-base font-bold tracking-tight text-foreground">
              Strategy guides for every game
            </h2>
            <p>
              Looking to improve? Our{" "}
              <Link
                to="/guides"
                className="text-foreground underline underline-offset-2 hover:no-underline"
              >
                strategy guide library
              </Link>{" "}
              covers rules, win rates, tips, and history for all 16 games. From
              Klondike's Draw 1 vs Draw 3 decision to Spider's in-suit building
              discipline, every guide is written to help you win more often.
            </p>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="mt-14">
          <SiteFooter />
        </div>

      </main>
    </>
  );
}
