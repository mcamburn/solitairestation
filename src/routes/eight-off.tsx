import { createFileRoute } from "@tanstack/react-router";
import { EightOff } from "@/components/EightOff";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/eight-off")({
  head: () => ({
    meta: [
      { title: "Solitaire Station — Free Eight Off Solitaire" },
      { name: "description", content: "Play free Eight Off solitaire at Solitaire Station — a classic FreeCell variant with 8 free cells and same-suit tableau stacking. Hints, undo, and auto-save. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Solitaire Station — Free Eight Off Solitaire" },
      { property: "og:description", content: "Play free Eight Off solitaire at Solitaire Station — 8 free cells and same-suit stacking make this a unique strategic challenge." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/eight-off` },
      { property: "og:image", content: `${SITE_URL}/og/eight-off.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free Eight Off Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solitaire Station — Free Eight Off Solitaire" },
      { name: "twitter:description", content: "Play free Eight Off solitaire — 8 free cells, same-suit stacking, hints, undo. No download or sign-up." },
      { name: "twitter:image", content: `${SITE_URL}/og/eight-off.png` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/eight-off` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: EightOffPage,
});

const EIGHTOFF_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Solitaire Station — Free Eight Off Solitaire",
  "url": `${SITE_URL}/eight-off`,
  "description": "Play free Eight Off solitaire at Solitaire Station — a FreeCell variant with 8 free cells and same-suit tableau building. Hints, undo, and auto-save.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function EightOffPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: EIGHTOFF_LD }} />
      <GamePageLayout
        gameKey="eightoff"
        badge="Eight Off · FreeCell Variant"
        title="Eight Off Solitaire"
        tagline="Eight free cells give you maximum flexibility — but same-suit stacking demands careful planning."
        rulesIntro="Eight Off is a close relative of FreeCell invented in the 1960s. The key twist: instead of 4 free cells you get 8, and tableau stacking must follow suit rather than alternate color. The extra free cells open up many more possibilities, but the same-suit restriction makes deep sequences harder to form. Four cards are pre-dealt to 4 of the free cells, leaving 8 tableau columns of 6 cards each."
        rules={[
          {
            title: "The setup",
            body: "Eight tableau columns of 6 cards each (48 cards), all face-up. Four of the eight free cells start pre-loaded with one card each (the remaining 4 cards of the deck).",
          },
          {
            title: "Moving to foundations",
            body: "Move aces to the foundations first, then build each pile up in suit from Ace to King. Double-click a card to auto-send it to the correct foundation.",
          },
          {
            title: "Tableau sequences",
            body: "Stack cards in descending rank and same suit (a 6♠ on a 7♠). Click a card or the start of a valid same-suit sequence to select it, then click the destination.",
          },
          {
            title: "Free cells",
            body: "Each of the 8 free cells holds exactly one card. Use them to temporarily park cards. Cards in free cells can move to any valid tableau column or foundation.",
          },
          {
            title: "Supermove",
            body: "Move a multi-card sequence in one action as long as you have enough free cells and empty columns available. The limit is (freeCells + 1) × 2^(emptyColumns).",
          },
          {
            title: "Strategy tips",
            body: "Build same-suit sequences as long as possible on the tableau — a run like 9♠→8♠→7♠→6♠ clears four foundation cards in a smooth chain with no repositioning. With 8 free cells you have a generous buffer, but they fill surprisingly fast on complex boards; try to keep at least 3 open at all times. When stuck, look first at cards sitting in free cells that could form same-suit stacks on the tableau — clearing free cells often unlocks a cascade of new moves. Avoid parking a King in a free cell unless you have no other option; it will sit there all game.",
          },
        ]}
      >
        <EightOff />
      </GamePageLayout>
    </>
  );
}
