import { createFileRoute } from "@tanstack/react-router";
import { TriPeaks } from "@/components/TriPeaks";
import { GamePageLayout } from "@/components/GamePageLayout";
import { TriPeaksWrapDemo } from "@/components/RuleDemo";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/tripeaks")({
  head: () => ({
    meta: [
      { title: "Solitaire Station — Free TriPeaks Solitaire" },
      { name: "description", content: "Play free TriPeaks solitaire — clear three peaks by chaining cards one rank apart. Build streaks for bonus points. Hints and auto-save. No download needed." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Solitaire Station — Free TriPeaks Solitaire" },
      { property: "og:description", content: "Play free TriPeaks solitaire at Solitaire Station — clear three peaks by chaining cards one rank apart. Build streaks for bonus points. No download or sign-up." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/tripeaks` },
      { property: "og:image", content: `${SITE_URL}/og/tripeaks.png?v=6` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free TriPeaks Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solitaire Station — Free TriPeaks Solitaire" },
      { name: "twitter:description", content: "Play free TriPeaks solitaire at Solitaire Station — chain cards one rank apart to clear three peaks. No download or sign-up." },
      { name: "twitter:image", content: `${SITE_URL}/og/tripeaks.png?v=6` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/tripeaks` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: TriPeaksPage,
});

const TRIPEAKS_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Solitaire Station — Free TriPeaks Solitaire",
  "url": `${SITE_URL}/tripeaks`,
  "description": "Play free TriPeaks solitaire at Solitaire Station — chain cards one rank apart to clear three peaks. Hints, undo, and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function TriPeaksPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: TRIPEAKS_LD }} />
      <GamePageLayout
      gameKey="tripeaks"
      badge="TriPeaks · Chain plays"
      title="TriPeaks Solitaire"
      tagline="Clear three peaks by chaining cards one rank apart. Build streaks for the high score."
      rulesIntro="TriPeaks Solitaire features three overlapping pyramids. Play cards onto the waste pile by matching ranks one above or below the current top card — Ace and King wrap around."
      rules={[
        {
          title: "The setup",
          body: "28 cards form three overlapping peaks across four rows. The remaining 24 cards form the stock. Only the base-row and uncovered cards are playable at first.",
        },
        {
          title: "Available cards",
          body: "A card is available when both cards covering it from the row above have been removed. All 10 base-row cards start available.",
        },
        {
          title: "Playing cards",
          body: "Click any available card that is one rank above or below the current waste top. Ace and King wrap — a King can be played on an Ace and vice versa.",
          demo: <TriPeaksWrapDemo />,
        },
        {
          title: "Stock",
          body: "When no available card can be played, click the stock to flip a new card to the waste. The stock has no recycle — use it wisely.",
        },
        {
          title: "Building streaks",
          body: "Every consecutive card played without drawing from stock extends your streak. A long streak means you're chaining cards efficiently — 6, 7, 8, 7, 6, 7, 8, 9, 10 is a valid run since each step is ±1. Look ahead: an available 5 is more valuable right now if your waste top is a 4 or 6 than if it's a 10.",
        },
        {
          title: "Winning",
          body: "Clear all 28 pyramid cards to win — the stock doesn't need to be empty. Because the stock has no recycle, plan which tableau cards to play first: prioritise moves that open up two or more cards in the rows above. Drawing from stock too early wastes the flexibility of having a varied waste-top.",
        },
        {
          title: "Strategy tips",
          body: "Scan all three peaks before each move to find the chain with the longest potential run from the current waste top. When two available cards are both valid plays, pick the one that uncovers a card you'll need sooner. Middle-column cards in each peak tend to unblock the most cards — clear them early. Save stock draws for when you're genuinely stuck, not just when the obvious play isn't immediately visible.",
        },
      ]}
    >
      <TriPeaks />
    </GamePageLayout>
    </>
  );
}
