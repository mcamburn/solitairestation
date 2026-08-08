import { createFileRoute } from "@tanstack/react-router";
import { Solitaire } from "@/components/Solitaire";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "Solitaire Station — Klondike Solitaire";
const DESC = "Play Klondike Solitaire free — the classic card game with no download needed. Choose Turn 1, Turn 3, Vegas, or Double mode. Hints, undo, and auto-save.";
const OG_IMG = `${SITE_URL}/og/klondike.png?v=6`;

export const Route = createFileRoute("/klondike-solitaire")({
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
      { property: "og:url", content: `${SITE_URL}/klondike-solitaire` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/klondike-solitaire` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: KlondikeSolitairePage,
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Solitaire Station — Klondike Solitaire",
  url: `${SITE_URL}/klondike-solitaire`,
  description: DESC,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
  publisher: { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
  isAccessibleForFree: true,
});

function KlondikeSolitairePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      <GamePageLayout
        gameKey="klondike"
        badge="Klondike · Classic"
        title="Klondike Solitaire"
        tagline="The world's most-played card game — free, instant, and endlessly replayable."
        rulesIntro="Klondike Solitaire is the classic game that shipped with Windows and introduced hundreds of millions of players to solitaire. Seven tableau columns, four foundation piles, one stock. Choose Turn 1 for the accessible version or Turn 3 for a harder challenge."
        rules={[
          {
            title: "The goal",
            body: "Move all 52 cards to the four foundation piles, one per suit, built up from Ace to King. The game is won when all foundations are complete.",
          },
          {
            title: "The tableau",
            body: "Seven columns are dealt at the start — column 1 has 1 card, column 7 has 7. Only the top card of each column is face-up. Build columns in descending rank, alternating red and black suits.",
          },
          {
            title: "Stock and waste",
            body: "The remaining 24 cards form the stock. Click it to draw — one card in Turn 1, three in Turn 3. Play the top waste card to the tableau or foundation whenever it fits.",
          },
          {
            title: "Foundations",
            body: "Aces start each foundation pile. Build each pile upward in the same suit: A–2–3–…–K. Cards on the foundation can be moved back to the tableau in emergency situations.",
          },
          {
            title: "Empty columns",
            body: "When a tableau column is cleared, only a King (or a sequence headed by a King) may fill it. Empty columns are the most powerful positional resource in the game — use them deliberately.",
          },
          {
            title: "Modes available",
            body: "Use the MODE selector on the game board to switch between Turn 1 (classic), Turn 3 (draw 3), Vegas Scoring (3 passes, $5/card), and Double Klondike (2 decks, 9 columns).",
          },
        ]}
      >
        <Solitaire />
      </GamePageLayout>
    </>
  );
}
