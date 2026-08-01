import { createFileRoute } from "@tanstack/react-router";
import { Spider } from "@/components/Spider";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "Spider Solitaire — Solitaire Station";
const DESC = "Play free Spider Solitaire at Solitaire Station — choose 1 suit, 2 suits, or 4 suits across 10 tableau columns. No download or sign-up. Hints, undo, and auto-save progress.";
const OG_IMG = `${SITE_URL}/og/spider.png`;

export const Route = createFileRoute("/spider-solitaire")({
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
      { property: "og:url", content: `${SITE_URL}/spider-solitaire` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/spider-solitaire` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: SpiderSolitairePage,
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Spider Solitaire — Solitaire Station",
  url: `${SITE_URL}/spider-solitaire`,
  description: DESC,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
});

function SpiderSolitairePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      <GamePageLayout
        badge="Spider · 10 columns"
        title="Spider Solitaire"
        tagline="Build complete K–A sequences in your chosen suit count across 10 columns. Clear all eight to win."
        rulesIntro="Spider Solitaire is played with two 52-card decks (104 cards) across 10 tableau columns. Build complete same-suit sequences from King down to Ace to remove them from the board. Choose 1 suit for an accessible challenge, 2 suits for intermediate play, or 4 suits for an expert test."
        rules={[
          {
            title: "The setup",
            body: "Columns 0–3 start with 6 cards each, columns 4–9 with 5 cards each. The remaining 50 cards are split into five deal groups of ten.",
          },
          {
            title: "Moving cards",
            body: "Click a card to select its movable run — a consecutive same-suit descending sequence from that card to the column top. A single face-up card can always be moved. Click the destination to place it.",
          },
          {
            title: "Any-suit stacking",
            body: "Cards of any suit can be stacked in descending order, but only same-suit runs can be moved as a unit. Mixed stacks lock the lower cards until they are freed.",
          },
          {
            title: "Dealing from stock",
            body: "Click Deal to place one card on each of the ten columns. All columns must be occupied before you deal. Five deal groups are available — use them wisely.",
          },
          {
            title: "Completing a sequence",
            body: "When a complete K–A sequence of the same suit is assembled on the top of a column, it is automatically removed. Clear all 8 sequences to win.",
          },
          {
            title: "Difficulty levels",
            body: "1 Suit (spades only) is the easiest variant — all moves are valid as single-suit runs. 2 Suits adds hearts. 4 Suits is the hardest: careful suit discipline is required on every single move.",
          },
        ]}
      >
        <Spider />
      </GamePageLayout>
    </>
  );
}
