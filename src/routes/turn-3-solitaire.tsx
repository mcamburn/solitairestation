import { createFileRoute } from "@tanstack/react-router";
import { Solitaire } from "@/components/Solitaire";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "Turn 3 Solitaire — Solitaire Station";
const DESC = "Play Turn 3 (Draw 3) Klondike Solitaire free online at Solitaire Station — no download, no sign-up. Draw 3 cards at a time for a harder, more strategic challenge. Hints, undo, and auto-save included.";
const OG_IMG = `${SITE_URL}/og/klondike.png`;

export const Route = createFileRoute("/turn-3-solitaire")({
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
      { property: "og:url", content: `${SITE_URL}/turn-3-solitaire` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/turn-3-solitaire` },
      { rel: "icon", href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🃏</text></svg>" },
    ],
  }),
  component: Turn3Page,
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Turn 3 Solitaire — Solitaire Station",
  url: `${SITE_URL}/turn-3-solitaire`,
  description: DESC,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
});

function Turn3Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      <GamePageLayout
        badge="Klondike · Turn 3"
        title="Turn 3 Solitaire"
        tagline="Draw 3 cards at a time for a harder, more strategic Klondike experience."
        rulesIntro="Turn 3 Solitaire (also called Draw 3 Klondike) follows the same rules as classic Klondike — but instead of drawing one card at a time from the stock, you draw three. Only the top card of the three is playable, making card access harder and requiring more planning."
        rules={[
          {
            title: "Drawing from the stock",
            body: "Click the stock to flip three cards face-up onto the waste pile. Only the topmost card is available to play. Once it is moved, the next card beneath it becomes accessible.",
          },
          {
            title: "Cycling through the stock",
            body: "When the stock is exhausted, click it to recycle the entire waste pile back into the stock face-down. In standard Turn 3 mode there is no pass limit — you may cycle as many times as needed.",
          },
          {
            title: "Building the tableau",
            body: "Build columns in descending rank, alternating red and black. Move sequences of face-up cards from column to column. Only a King (or a sequence headed by a King) can fill an empty column.",
          },
          {
            title: "Foundations",
            body: "Move Aces to the four foundation piles as they appear. Build each foundation up by suit from Ace to King. The game is won when all 52 cards are on the foundations.",
          },
          {
            title: "Why Turn 3 is harder",
            body: "Because you skip over two cards with every draw, some cards may only surface on specific pass cycles. Careful tracking of which cards are in the stock — and in what groupings — is the key skill in Turn 3.",
          },
          {
            title: "Strategy tip",
            body: "In Turn 3 the stock cycling math means some cards appear at the top of the waste only on certain passes. Prioritize moves that reveal face-down tableau cards over lateral shuffling, since each revealed card expands your options for future stock passes.",
          },
        ]}
      >
        <Solitaire initialMode="draw3" />
      </GamePageLayout>
    </>
  );
}
