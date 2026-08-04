import { createFileRoute } from "@tanstack/react-router";
import { Solitaire } from "@/components/Solitaire";
import { GamePageLayout } from "@/components/GamePageLayout";
import { AltColorDemo } from "@/components/RuleDemo";
import { SITE_URL } from "@/lib/site";

const TITLE = "Solitaire Station — Free Klondike Solitaire";
const DESC = "Play free Klondike solitaire online at Solitaire Station — no download, no sign-up. Draw 1 or Draw 3, hints, undo, and auto-save. One of sixteen free card games.";
const OG_IMG = `${SITE_URL}/og/klondike.png?v=5`;

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
      { property: "og:image:alt", content: "Solitaire Station — Free Klondike Solitaire" },
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
  "name": "Solitaire Station — Free Klondike Solitaire",
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
