import { createFileRoute } from "@tanstack/react-router";
import { FreeCell } from "@/components/FreeCell";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "FreeCell Solitaire — Solitaire Station";
const DESC = "Play free FreeCell Solitaire online at Solitaire Station — all 52 cards are visible from the start. Nearly every deal is solvable with the right strategy. Hints, undo, and auto-save. No download required.";
const OG_IMG = `${SITE_URL}/og/freecell.png`;

export const Route = createFileRoute("/freecell-solitaire")({
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
      { property: "og:url", content: `${SITE_URL}/freecell-solitaire` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/freecell-solitaire` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: FreeCellSolitairePage,
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FreeCell Solitaire — Solitaire Station",
  url: `${SITE_URL}/freecell-solitaire`,
  description: DESC,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
});

function FreeCellSolitairePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      <GamePageLayout
        badge="FreeCell · All 52 visible"
        title="FreeCell Solitaire"
        tagline="All 52 cards face-up from move one — nearly every deal is solvable with the right plan."
        rulesIntro="FreeCell is a skill-based solitaire where all 52 cards are dealt face-up across 8 columns at the start. Four free cells act as temporary card parking spaces. Unlike Klondike, almost every FreeCell deal is solvable — losing means a strategic error, not bad luck."
        rules={[
          {
            title: "Free cells",
            body: "Four free cells at the top left act as single-card holding spaces. Any card can be moved to a free cell, but only one card per cell. Free cells are a critical resource — keep as many empty as possible.",
          },
          {
            title: "The tableau",
            body: "Eight columns of 6–7 cards, all face-up. Build columns in descending rank, alternating red and black suits. Any card or valid sequence can be moved to any column that accepts it.",
          },
          {
            title: "Moving sequences",
            body: "You can move a sequence of cards as a group only if you have enough free cells and empty columns to do so. The formula: max movable = (free cells + 1) × 2^(empty columns). More space means more power.",
          },
          {
            title: "Foundations",
            body: "Four foundation piles in the top right, one per suit. Build each from Ace to King. Cards sent to the foundation can be moved back to the tableau in theory, but rarely need to be.",
          },
          {
            title: "Empty columns",
            body: "When a tableau column is fully cleared, any card or sequence can fill it. Empty columns contribute exponentially to your ability to move large groups — they are more valuable than free cells.",
          },
          {
            title: "Unsolvable deals",
            body: "Only two deals in the standard 32,000-deal set are provably unsolvable. If you are stuck, the problem is almost certainly strategic. Use Hint and Undo liberally — FreeCell rewards analysis over reflexes.",
          },
        ]}
      >
        <FreeCell />
      </GamePageLayout>
    </>
  );
}
