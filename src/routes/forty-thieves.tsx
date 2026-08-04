import { createFileRoute } from "@tanstack/react-router";
import { FortyThieves } from "@/components/FortyThieves";
import { GamePageLayout } from "@/components/GamePageLayout";
import { FortyThievesSameSuitDemo } from "@/components/RuleDemo";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/forty-thieves")({
  head: () => ({
    meta: [
      { title: "Solitaire Station — Free Forty Thieves Solitaire" },
      { name: "description", content: "Play free Forty Thieves Solitaire at Solitaire Station — a challenging two-deck game with 10 tableau columns and 8 foundations. Hints, undo, and auto-save. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Solitaire Station — Free Forty Thieves Solitaire" },
      { property: "og:description", content: "Play free Forty Thieves solitaire — two decks, 10 columns, same-suit building. Hints, undo, and auto-save." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/forty-thieves` },
      { property: "og:image", content: `${SITE_URL}/og/forty-thieves.png?v=5` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free Forty Thieves Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solitaire Station — Free Forty Thieves Solitaire" },
      { name: "twitter:description", content: "Two-deck solitaire with same-suit tableau building. One card moves at a time. Can you beat all 40 thieves?" },
      { name: "twitter:image", content: `${SITE_URL}/og/forty-thieves.png?v=5` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/forty-thieves` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: FortyThievesPage,
});

const FORTY_THIEVES_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Solitaire Station — Free Forty Thieves Solitaire",
  "url": `${SITE_URL}/forty-thieves`,
  "description": "Play free Forty Thieves solitaire online — a challenging two-deck game with 10 tableau columns and 8 foundations. Hints, undo, and auto-save.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function FortyThievesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FORTY_THIEVES_LD }} />
      <GamePageLayout
        gameKey="fortythieves"
        badge="Forty Thieves · Two-deck challenge"
        title="Forty Thieves Solitaire"
        tagline="Two decks, 10 columns, same-suit building — only the very top card moves. Strategy every step of the way."
        rulesIntro="Forty Thieves is one of the most demanding solitaire games ever devised. Unlike Klondike or Spider, you can only move a single card at a time — no sequences, no shortcuts. With 104 cards spread across 10 tableau columns and a deep stock pile, every draw and every placement decision ripples through the rest of the game. Expect to win only about 10% of deals, making each victory genuinely satisfying."
        rules={[
          {
            title: "The setup",
            body: "Two standard 52-card decks (104 cards total) are used. Ten tableau columns each receive 4 face-up cards (40 cards total). The remaining 64 cards form the stock pile.",
          },
          {
            title: "Moving cards",
            body: "Only the top card of each tableau column is moveable at any time. No sequences can be moved as a group — always just one card.",
          },
          {
            title: "Tableau building",
            body: "Tableau columns build downward in the same suit. For example, 8♥ can be placed on 9♥. Any single card can be placed on an empty column.",
            demo: <FortyThievesSameSuitDemo />,
          },
          {
            title: "Stock and waste",
            body: "Click the stock to draw one card at a time to the waste pile. The top card of the waste pile can be played to any valid tableau column or foundation. There is no recycling — once the stock is exhausted, no more cards can be drawn.",
          },
          {
            title: "Foundations",
            body: "There are 8 foundation piles (two per suit). Build each up from Ace to King in the same suit. Both copies of each card must eventually be placed on separate foundation piles.",
          },
          {
            title: "Winning",
            body: "Move all 104 cards to the foundations. With only single-card moves and no recycling, careful management of the stock and empty columns is essential.",
          },
          {
            title: "Strategy tips",
            body: "Empty columns are your most powerful resource — create one early, then guard it carefully. Never fill an empty column unless doing so solves an immediate critical problem; an empty slot held in reserve is worth more than any card placed in it. Before drawing from the stock, scan every tableau column top — a card that has nowhere to go immediately blocks whatever was beneath it, potentially for the rest of the game. When you have a partial same-suit run (e.g. 8♦–7♦–6♦ spread across different columns), consolidating it onto one column is a high-priority goal even if it costs you an empty column temporarily.",
          },
        ]}
      >
        <FortyThieves />
      </GamePageLayout>
    </>
  );
}
