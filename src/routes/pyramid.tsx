import { createFileRoute } from "@tanstack/react-router";
import { Pyramid } from "@/components/Pyramid";
import { GamePageLayout } from "@/components/GamePageLayout";

export const Route = createFileRoute("/pyramid")({
  head: () => ({
    meta: [
      { title: "Free Pyramid Solitaire — Solitaire Station" },
      { name: "description", content: "Play free Pyramid solitaire at Solitaire Station — pair cards that sum to 13 to clear all 28 cards. Kings remove alone. Hints, undo, and auto-save. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Free Pyramid Solitaire — Solitaire Station" },
      { property: "og:description", content: "Play free Pyramid solitaire at Solitaire Station — pair cards that sum to 13 to clear all 28 cards. Kings remove alone. Hints and auto-save." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.free-klondike-solitaire.com/pyramid" },
      { property: "og:image", content: "https://www.free-klondike-solitaire.com/og/pyramid.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Free Pyramid Solitaire — Solitaire Station" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free Pyramid Solitaire — Solitaire Station" },
      { name: "twitter:description", content: "Play free Pyramid solitaire at Solitaire Station — pair cards that sum to 13 to clear the pyramid. No download or sign-up." },
      { name: "twitter:image", content: "https://www.free-klondike-solitaire.com/og/pyramid.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.free-klondike-solitaire.com/pyramid" },
      { rel: "icon", href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔺</text></svg>" },
    ],
  }),
  component: PyramidPage,
});

const PYRAMID_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free Pyramid Solitaire — Solitaire Station",
  "url": "https://www.free-klondike-solitaire.com/pyramid",
  "description": "Play free Pyramid solitaire at Solitaire Station — pair cards that add to 13. Hints, undo, and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": "https://www.free-klondike-solitaire.com/" },
});

function PyramidPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PYRAMID_LD }} />
      <GamePageLayout
      badge="Pyramid · Fast pair-matching"
      title="Pyramid Solitaire"
      tagline="Spot pairs that add to 13, clear them instantly — every match removes a card for good."
      rulesIntro="Pyramid Solitaire is one of the fastest and most satisfying solitaire games you can play. There's no column-building or reshuffling — every move instantly removes cards from the board. The entire game is a single question asked over and over: which two cards add up to 13? That instant feedback loop makes Pyramid perfect for a quick, engaging session of 5–10 minutes."
      rules={[
        {
          title: "The setup",
          body: "28 cards are arranged in a 7-row pyramid — 1 card at the apex, 7 at the base. The remaining 24 cards form the stock pile at the bottom.",
        },
        {
          title: "Available cards",
          body: "A card is available (face-up and selectable) when both cards directly below it have been removed. All seven base-row cards are available from the start.",
        },
        {
          title: "Pair to 13 — the core mechanic",
          body: "Click any two available cards whose ranks sum to exactly 13 to remove both instantly. Card values: Ace=1, 2–10 face value, Jack=11, Queen=12, King=13. The valid pairs are: A+Q, 2+J, 3+10, 4+9, 5+8, 6+7. Kings stand alone.",
        },
        {
          title: "Kings remove themselves",
          body: "A King has rank 13 on its own, so a single click removes it immediately — no pairing needed. Clearing Kings early opens up the pyramid and unlocks buried cards.",
        },
        {
          title: "Stock and waste",
          body: "Click the stock to flip the top card to the waste. The waste top card can pair with any available pyramid card. When the stock is empty, click it to recycle the waste once.",
        },
        {
          title: "Winning",
          body: "Clear every card from the pyramid — the stock and waste may still contain cards when you win. Not every deal is beatable, but careful sequencing (saving the right pairs for the right moment) dramatically improves your odds.",
        },
      ]}
    >
      <Pyramid />
    </GamePageLayout>
    </>
  );
}
