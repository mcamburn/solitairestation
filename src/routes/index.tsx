import { createFileRoute, Link } from "@tanstack/react-router";
import { GAMES } from "../lib/games";
import { SITE_URL } from "../lib/site";

const TITLE = "Solitaire Station — 16 Free Online Solitaire Games";
const DESC =
  "Play 16 free solitaire games instantly in your browser — Klondike, Spider, FreeCell, Pyramid, Mahjong, and more. Customizable cards, hints, undo, and auto-save. No download or sign-up.";
const OG_IMG = `${SITE_URL}/og/klondike.png?v=6`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Solitaire Station — 16 Free Online Solitaire Games",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: HomePage,
});

const ITEM_LIST_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      "url": `${SITE_URL}/`,
      "name": TITLE,
      "description": DESC,
      "isPartOf": { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#gamelist`,
      "name": "Free Online Solitaire Games",
      "url": `${SITE_URL}/`,
      "numberOfItems": GAMES.length,
      "itemListElement": GAMES.map((game, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": game.title,
        "url": `${SITE_URL}${game.to}`,
      })),
    },
  ],
});

function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ITEM_LIST_LD }}
      />
      <div className="min-h-screen bg-background text-foreground">
        {/* Nav */}
        <nav className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <span className="font-semibold text-foreground">
              Solitaire Station
            </span>
            <Link
              to="/klondike"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Play now →
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <header className="mx-auto max-w-3xl px-4 pb-10 pt-14 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Free Online Solitaire — 16 Games, No Download
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Play Klondike, Spider, FreeCell, Pyramid, Mahjong, and 11 more
            classic card games right in your browser. Customizable cards, hints,
            undo, and auto-save — no account needed.
          </p>
          <Link
            to="/klondike"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Play Klondike Now
          </Link>
        </header>

        {/* Game grid */}
        <main className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            Choose a Game
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {GAMES.map((game) => (
              <li key={game.to}>
                <Link
                  to={game.to}
                  className="group flex h-full flex-col gap-1.5 rounded-lg border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="text-2xl leading-none">{game.emoji}</div>
                  <div>
                    <p className="line-clamp-2 text-sm font-semibold leading-tight text-card-foreground">
                      {game.title}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-primary">
                      {game.subtitle}
                    </p>
                  </div>
                  <p className="text-xs leading-snug text-muted-foreground">
                    {game.desc}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Solitaire Station · Free to play · No
            download required
          </p>
        </footer>
      </div>
    </>
  );
}
