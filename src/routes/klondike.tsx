import { createFileRoute } from "@tanstack/react-router";
import { Solitaire } from "@/components/Solitaire";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "Free Klondike Solitaire — Solitaire Station";
const DESC = "Play free Klondike solitaire online at Solitaire Station — no download, no sign-up. Draw 1 or Draw 3, hints, undo, and auto-save. One of sixteen free card games.";
const OG_IMG = `${SITE_URL}/og/klondike.png`;

export const Route = createFileRoute("/klondike")({
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
      { property: "og:url", content: `${SITE_URL}/klondike` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Free Klondike Solitaire — Solitaire Station" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/klondike` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: KlondikePage,
});

const KLONDIKE_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free Klondike Solitaire — Solitaire Station",
  "url": `${SITE_URL}/klondike`,
  "description": "Play free Klondike solitaire online at Solitaire Station — Draw 1 or Draw 3, hints, undo, and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function KlondikePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: KLONDIKE_LD }} />
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
          },
          {
            title: "The foundations",
            body: "Build the four foundation piles up by suit, starting with the Ace. Double-click any card to send it to a foundation automatically.",
          },
          {
            title: "Stock and waste",
            body: "Click the stock pile to flip a card to the waste. The top waste card is always playable. When the stock is empty, click it to recycle the waste.",
          },
          {
            title: "Winning",
            body: "You win when all 52 cards are on the foundations. Fewer moves and less time mean a better game.",
          },
          {
            title: "Stuck?",
            body: "Tap Hint for a suggested move, Undo to take back the last action, or New Game to shuffle a fresh deal. Not every deal is solvable — that's part of the fun.",
          },
        ]}
      >
        <Solitaire />
      </GamePageLayout>
    </>
  );
}
