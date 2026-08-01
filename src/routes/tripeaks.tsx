import { createFileRoute } from "@tanstack/react-router";
import { TriPeaks } from "@/components/TriPeaks";
import { GamePageLayout } from "@/components/GamePageLayout";

export const Route = createFileRoute("/tripeaks")({
  head: () => ({
    meta: [
      { title: "Free TriPeaks Solitaire — Solitaire Station" },
      { name: "description", content: "Play free TriPeaks solitaire at Solitaire Station — clear three peaks by chaining cards one rank apart. Build streaks for bonus points. Hints and auto-save. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Free TriPeaks Solitaire — Solitaire Station" },
      { property: "og:description", content: "Play free TriPeaks solitaire at Solitaire Station — clear three peaks by chaining cards one rank apart. Build streaks for bonus points. No download or sign-up." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.free-klondike-solitaire.com/tripeaks" },
      { property: "og:image", content: "https://www.free-klondike-solitaire.com/og/tripeaks.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Free TriPeaks Solitaire — Solitaire Station" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free TriPeaks Solitaire — Solitaire Station" },
      { name: "twitter:description", content: "Play free TriPeaks solitaire at Solitaire Station — chain cards one rank apart to clear three peaks. No download or sign-up." },
      { name: "twitter:image", content: "https://www.free-klondike-solitaire.com/og/tripeaks.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.free-klondike-solitaire.com/tripeaks" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: TriPeaksPage,
});

const TRIPEAKS_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free TriPeaks Solitaire — Solitaire Station",
  "url": "https://www.free-klondike-solitaire.com/tripeaks",
  "description": "Play free TriPeaks solitaire at Solitaire Station — chain cards one rank apart to clear three peaks. Hints, undo, and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": "https://www.free-klondike-solitaire.com/" },
});

function TriPeaksPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: TRIPEAKS_LD }} />
      <GamePageLayout
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
        },
        {
          title: "Stock",
          body: "When no available card can be played, click the stock to flip a new card to the waste. The stock has no recycle — use it wisely.",
        },
        {
          title: "Streaks",
          body: "Every consecutive card played without drawing from stock adds to your streak, shown in the top bar. Chains of 5+ feel very satisfying.",
        },
        {
          title: "Winning",
          body: "Clear all 28 pyramid cards to win. The stock doesn't need to be empty. Plan card removal order carefully to open up chained plays.",
        },
      ]}
    >
      <TriPeaks />
    </GamePageLayout>
    </>
  );
}
