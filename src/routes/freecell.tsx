import { createFileRoute } from "@tanstack/react-router";
import { FreeCell } from "@/components/FreeCell";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/freecell")({
  head: () => ({
    meta: [
      { title: "Free FreeCell Solitaire — Solitaire Station" },
      { name: "description", content: "Play free FreeCell solitaire at Solitaire Station — almost every deal is solvable. Use 4 free cells to plan your moves. Hints, undo, and auto-save. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Free FreeCell Solitaire — Solitaire Station" },
      { property: "og:description", content: "Play free FreeCell solitaire at Solitaire Station — almost every deal is solvable. Use 4 free cells to plan your moves. Hints, undo, and auto-save." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/freecell` },
      { property: "og:image", content: `${SITE_URL}/og/freecell.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Free FreeCell Solitaire — Solitaire Station" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free FreeCell Solitaire — Solitaire Station" },
      { name: "twitter:description", content: "Play free FreeCell solitaire at Solitaire Station — almost every deal is solvable. 4 free cells, hints, undo. No download or sign-up." },
      { name: "twitter:image", content: `${SITE_URL}/og/freecell.png` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/freecell` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: FreeCellPage,
});

const FREECELL_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free FreeCell Solitaire — Solitaire Station",
  "url": `${SITE_URL}/freecell`,
  "description": "Play free FreeCell solitaire at Solitaire Station — almost every deal is solvable. Hints, undo, and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function FreeCellPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FREECELL_LD }} />
      <GamePageLayout
      gameKey="freecell"
      badge="FreeCell · 99.9% winnable"
      title="FreeCell Solitaire"
      tagline="Almost every deal is winnable — FreeCell is pure strategy with virtually no luck involved."
      rulesIntro="FreeCell is the rare solitaire game where skill almost always wins. Every card is dealt face-up from the start, and computer analysis of over 8 million deals confirms that 99.999% are solvable with correct play — only 8 deals out of the first million are provably unsolvable. There's no hidden card, no unlucky flip; just you, the board, and the solution waiting to be found."
      rules={[
        {
          title: "The setup",
          body: "Eight tableau columns hold all 52 cards face-up. Four free cells and four foundation piles sit in the top row.",
        },
        {
          title: "Moving to foundations",
          body: "Move cards to the foundations in suit order from Ace to King. Double-click a card to auto-send it to the correct foundation when a valid slot is open.",
        },
        {
          title: "Tableau sequences",
          body: "Stack cards in descending rank and alternating colors (a black 6 on a red 7). Click a card — or the start of a valid sequence — to select it, then click the destination.",
        },
        {
          title: "Free cells",
          body: "Each free cell holds exactly one card. Use them to temporarily park cards you can't place elsewhere. A free cell card can move to any valid tableau column or foundation.",
        },
        {
          title: "Supermove",
          body: "You can move a multi-card sequence in one click as long as you have enough free cells and empty columns. The limit is (freeCells + 1) × 2^(emptyColumns).",
        },
        {
          title: "~99.9% of deals are winnable",
          body: "Unlike Klondike or Spider, a stuck FreeCell game almost never means the deal was unwinnable — it means an earlier move had a better alternative. Use Undo to backtrack and find it. This guarantee is what makes FreeCell so compelling to strategy enthusiasts: every loss is a puzzle still waiting to be solved.",
        },
      ]}
    >
      <FreeCell />
    </GamePageLayout>
    </>
  );
}
