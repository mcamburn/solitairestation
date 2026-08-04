import { createFileRoute } from "@tanstack/react-router";
import { Solitaire } from "@/components/Solitaire";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "Solitaire Station — Double Klondike Solitaire";
const DESC = "Play Double Klondike Solitaire free online at Solitaire Station — two full decks, 9 columns, 8 foundation piles. A longer, more epic version of classic Klondike. No download, no sign-up.";
const OG_IMG = `${SITE_URL}/og/klondike.png?v=5`;

export const Route = createFileRoute("/double-klondike")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/double-klondike` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/double-klondike` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: DoubleKlondikePage,
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Solitaire Station — Double Klondike Solitaire",
  url: `${SITE_URL}/double-klondike`,
  description: DESC,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
});

function DoubleKlondikePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      <GamePageLayout
        gameKey="klondike"
        badge="Klondike · Double"
        title="Double Klondike Solitaire"
        tagline="Two full decks, 9 columns, and 8 foundation piles — a longer, deeper Klondike challenge."
        rulesIntro="Double Klondike uses two standard 52-card decks shuffled together (104 cards total). The tableau has 9 columns (column 1 starts with 1 card, column 9 with 9 cards), and there are 8 foundation piles — two for each suit. The goal is to build all 8 foundations from Ace to King."
        rules={[
          {
            title: "The setup",
            body: "Nine tableau columns are dealt with 1–9 cards respectively (45 total). Each column's top card is face-up. The remaining 59 cards form the stock. Eight foundation piles — two per suit — start empty.",
          },
          {
            title: "Building the tableau",
            body: "Same rules as standard Klondike: descending rank, alternating red and black. Move single cards or sequences of face-up alternating-color cards. Only a King starts a new empty column.",
          },
          {
            title: "The foundations",
            body: "There are two foundation piles per suit (two for spades, two for hearts, two for diamonds, two for clubs). Each pile must start with an Ace of its suit and build up to King. Both Aces of the same suit must eventually reach the foundations.",
          },
          {
            title: "Stock and waste",
            body: "Draw 1 card at a time from the stock. The waste recycles freely — no pass limit. With 59 stock cards, there is more material to work with than in standard Klondike.",
          },
          {
            title: "Why Double Klondike is different",
            body: "With two of every card, duplicate ranks appear frequently. Managing which copy goes to which foundation pile, and keeping tableau columns clear of traffic jams, requires more planning than single-deck Klondike.",
          },
          {
            title: "Winning",
            body: "All 8 foundation piles must reach King (13 cards each, 104 total) to win. Sessions typically run 20–40 minutes — Double Klondike rewards patience.",
          },
        ]}
      >
        <Solitaire initialMode="double" />
      </GamePageLayout>
    </>
  );
}
