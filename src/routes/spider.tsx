import { createFileRoute } from "@tanstack/react-router";
import { Spider } from "@/components/Spider";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "Free Spider Solitaire — Play Free Online, No Download";
const DESC = "Play free Spider Solitaire online — no download, no sign-up. Choose 1, 2, or 4 suits across 10 columns. Free online solitaire with hints, undo, and auto-save progress.";
const OG_IMG = `${SITE_URL}/og/spider.png`;

export const Route = createFileRoute("/spider")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Free-Klondike-Solitaire.com" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/spider` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Free Spider Solitaire — Free-Klondike-Solitaire.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/spider` },
      { rel: "icon", href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕷️</text></svg>" },
    ],
  }),
  component: SpiderPage,
});

const SPIDER_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free Spider Solitaire",
  "url": "https://www.free-klondike-solitaire.com/spider",
  "description": "Play free Spider Solitaire online — choose 1, 2, or 4 suits. Hints, undo, and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Publish Port", "url": "https://www.free-klondike-solitaire.com/" },
});

function SpiderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SPIDER_LD }} />
      <GamePageLayout
      badge="Spider · 10 columns"
      title="Spider Solitaire"
      tagline="Build complete K–A sequences in your chosen suit count. Clear all eight to win."
      rulesIntro="Spider Solitaire is played with two 52-card decks (104 cards) across 10 tableau columns. Build complete same-suit sequences from King down to Ace to remove them from the board."
      rules={[
        {
          title: "The setup",
          body: "Columns 0–3 start with 6 cards each, columns 4–9 with 5 cards each (54 tableau cards). The remaining 50 cards are split into five deal groups of ten.",
        },
        {
          title: "Moving cards",
          body: "Click a card to select its movable run — a consecutive same-suit descending sequence from that card to the column's top. A single face-up card can always be moved. Click the destination column to place it.",
        },
        {
          title: "Any-suit stacking",
          body: "Cards of any suit can be stacked in descending order, but only same-suit runs are movable as a unit. Mixed stacks lock the lower cards until they're freed.",
        },
        {
          title: "Dealing from stock",
          body: "Click Deal to place one card on each of the ten columns. All columns must be non-empty before you deal. There are five deal groups — use them wisely.",
        },
        {
          title: "Completing a sequence",
          body: "When a complete K–A sequence of the same suit is assembled on top of a column, it is automatically removed. Clear all 8 sequences to win.",
        },
        {
          title: "Difficulty",
          body: "1 Suit uses only spades — the easiest. 2 Suits uses spades and hearts. 4 Suits uses all four suits and requires careful planning.",
        },
      ]}
    >
      <Spider />
    </GamePageLayout>
    </>
  );
}
