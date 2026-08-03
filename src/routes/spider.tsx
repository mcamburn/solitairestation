import { createFileRoute } from "@tanstack/react-router";
import { Spider } from "@/components/Spider";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "Solitaire Station — Free Spider Solitaire";
const DESC = "Play free Spider Solitaire at Solitaire Station — choose 1, 2, or 4 suits across 10 columns. No download, no sign-up. Hints, undo, and auto-save progress.";
const OG_IMG = `${SITE_URL}/og/spider.png`;

export const Route = createFileRoute("/spider")({
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
      { property: "og:url", content: `${SITE_URL}/spider` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free Spider Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/spider` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: SpiderPage,
});

const SPIDER_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Solitaire Station — Free Spider Solitaire",
  "url": `${SITE_URL}/spider`,
  "description": "Play free Spider Solitaire at Solitaire Station — choose 1, 2, or 4 suits. Hints, undo, and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function SpiderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SPIDER_LD }} />
      <GamePageLayout
      gameKey="spider"
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
          body: "1 Suit uses only spades — the easiest, since every descending stack is automatically same-suit and movable. 2 Suits uses spades and hearts — mixed stacks are now a real liability. 4 Suits adds diamonds and clubs — the canonical expert challenge where every mixed move can cost you the game.",
        },
        {
          title: "Empty columns",
          body: "An empty tableau column is extremely valuable — it's the only place you can temporarily hold a card or sequence without any suit restriction. Create empty columns intentionally and resist the urge to immediately fill them; a free column held in reserve gives you a critical pivot point when sequences get tangled.",
        },
        {
          title: "Strategy tips",
          body: "On 2- and 4-suit games, always prefer a same-suit move over a mixed-suit move even when the mixed move looks immediately useful — mixed stacks become invisible walls that block progress for many turns. Aim to concentrate cards of the same suit onto as few columns as possible. In 4-suit games, it helps to mentally assign columns to specific suits from the first few moves and resist letting them mix.",
        },
      ]}
    >
      <Spider />
    </GamePageLayout>
    </>
  );
}
