import { createFileRoute, Link } from "@tanstack/react-router";
import { Solitaire } from "@/components/Solitaire";
import { GamePageLayout } from "@/components/GamePageLayout";
import { AltColorDemo } from "@/components/RuleDemo";
import { GAMES } from "../lib/games";
import { SITE_URL } from "@/lib/site";

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
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
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
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
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

const FAQ_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this Klondike Solitaire game completely free to play?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Solitaire Station is 100% free to play directly in your web browser with no download, subscription, or account creation required.",
      },
    },
    {
      "@type": "Question",
      "name": "What is the difference between Solitaire Turn 1 and Turn 3?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In Turn 1 Solitaire, one card is drawn from the stockpile at a time, making games easier to win. In Turn 3 Solitaire, three cards are drawn at a time, increasing difficulty and requiring deeper strategic planning.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I play Klondike Solitaire on mobile devices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our game is fully optimized for touch controls on smartphones and tablets, compatible with both iOS and Android browsers.",
      },
    },
  ],
});

const KLONDIKE_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Solitaire Station — Free Klondike Solitaire",
  "url": `${SITE_URL}/`,
  "description":
    "Play free Klondike solitaire online at Solitaire Station — Draw 1 or Draw 3, hints, undo, and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": {
    "@type": "Organization",
    "name": "Solitaire Station",
    "url": `${SITE_URL}/`,
  },
});

function KlondikePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: KLONDIKE_LD }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: FAQ_LD }}
      />
      <GamePageLayout
        gameKey="klondike"
        badge="Klondike · Play instantly"
        title="Klondike Solitaire"
        tagline="The classic you know and love — free, minimal, and endlessly replayable."
        rulesIntro="Klondike Solitaire is played with a standard 52-card deck. The goal is to move every card into the four foundation piles, sorted by suit from Ace to King."
        rules={[
          {
            title: "The setup",
            body: "Seven tableau columns hold the play area. The first has one card, the second has two, and so on — only the top card of each column starts face-up. The remaining cards form the stock.",
          },
          {
            title: "Building the tableau",
            body: "Stack face-up cards in descending order and alternating colors (a red 7 goes on a black 8). You can move a single card or a properly-stacked run between columns. Empty columns accept only Kings.",
            demo: <AltColorDemo />,
          },
          {
            title: "The foundations",
            body: "Build the four foundation piles up by suit, starting with the Ace. Double-click any card to send it to a foundation automatically.",
          },
          {
            title: "Stock and waste",
            body: "Click the stock pile to flip a card (or three, in Turn 3 mode) to the waste. Only the top waste card is playable. When the stock is empty, click it to recycle the entire waste pile.",
          },
          {
            title: "Turn 1 vs Turn 3",
            body: "Turn 1 flips one card at a time — every stock card is always reachable, making the game more forgiving and roughly 80% of deals solvable. Turn 3 flips three cards at once and only the top of those three is playable; cards deeper in the group stay buried until the top cards are played, making it significantly harder.",
          },
          {
            title: "Strategy tips",
            body: "Prioritise uncovering face-down tableau cards over sending cards to foundations early — more face-up cards means more moves. Try to advance all four suits at roughly the same pace on the foundations; racing one suit far ahead can strand cards of the others. Save empty columns for a King with a long, useful sequence underneath — an empty column filled by a lone King with no run gains you almost nothing.",
          },
          {
            title: "Winning",
            body: "You win when all 52 cards are on the foundations. Not every deal is solvable — use Hint for a suggested move or Undo to backtrack when you get stuck.",
          },
        ]}
      >
        <Solitaire />
      </GamePageLayout>
    </>
  );
}

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
