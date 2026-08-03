import { createFileRoute } from "@tanstack/react-router";
import { BakersGame } from "@/components/BakersGame";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/bakers-game")({
  head: () => ({
    meta: [
      { title: "Solitaire Station — Free Baker's Game Solitaire" },
      { name: "description", content: "Play free Baker's Game solitaire at Solitaire Station — FreeCell with same-suit tableau stacking. A harder strategic challenge than standard FreeCell. Hints, undo, and auto-save. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Solitaire Station — Free Baker's Game Solitaire" },
      { property: "og:description", content: "Play free Baker's Game solitaire at Solitaire Station — FreeCell with same-suit stacking for a tougher strategic challenge." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/bakers-game` },
      { property: "og:image", content: `${SITE_URL}/og/bakers-game.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free Baker's Game Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solitaire Station — Free Baker's Game Solitaire" },
      { name: "twitter:description", content: "Play free Baker's Game — FreeCell with same-suit stacking, hints, undo. No download or sign-up." },
      { name: "twitter:image", content: `${SITE_URL}/og/bakers-game.png` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/bakers-game` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: BakersGamePage,
});

const BAKERSGAME_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Solitaire Station — Free Baker's Game Solitaire",
  "url": `${SITE_URL}/bakers-game`,
  "description": "Play free Baker's Game solitaire at Solitaire Station — FreeCell with same-suit tableau building instead of alternating colors. Hints, undo, and auto-save.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function BakersGamePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: BAKERSGAME_LD }} />
      <GamePageLayout
        gameKey="bakersgame"
        badge="Baker's Game · FreeCell Variant"
        title="Baker's Game Solitaire"
        tagline="FreeCell's harder sibling — same rules, but you must stack cards in the same suit."
        rulesIntro="Baker's Game was invented by R. W. Baker and is the direct ancestor of FreeCell. The rules are identical to FreeCell with one critical change: tableau columns build down in the same suit rather than alternating colors. This seemingly small change dramatically increases difficulty — sequences that span multiple suits are impossible, making deep planning and efficient use of free cells essential."
        rules={[
          {
            title: "The setup",
            body: "Eight tableau columns hold all 52 cards face-up (4 columns get 7 cards, 4 get 6). Four free cells and four foundation piles sit in the top row.",
          },
          {
            title: "Moving to foundations",
            body: "Move aces to the foundations, then build each pile up in suit from Ace to King. Double-click a card to auto-send it to the correct foundation.",
          },
          {
            title: "Tableau sequences",
            body: "Stack cards in descending rank and same suit (a 6♥ on a 7♥). Unlike FreeCell, alternating colors are not allowed — only same-suit sequences are valid.",
          },
          {
            title: "Free cells",
            body: "Each free cell holds exactly one card. Use them to temporarily park cards you can't place elsewhere. A free cell card can move to any valid tableau column or foundation.",
          },
          {
            title: "Supermove",
            body: "Move a multi-card same-suit sequence in one action as long as you have enough free cells and empty columns. The limit is (freeCells + 1) × 2^(emptyColumns).",
          },
          {
            title: "Why it's harder than FreeCell",
            body: "In FreeCell, a red 7 accepts black 6s of either black suit. In Baker's Game, a 7♥ only accepts a 6♥. This cuts your tableau-building options in half, making it much harder to create long sequences and clear columns. Many deals are not solvable — use Undo liberally.",
          },
          {
            title: "Strategy tips",
            body: "Think twice before using a free cell — with same-suit restrictions, you'll need them more often than in FreeCell. Focus on one or two suits at a time rather than spreading attention across all four; a complete single-suit column sequence can be sent to the foundation in one uninterrupted chain. When two cards of the same suit are only one rank apart and within reach of each other, move them together immediately before anything else blocks them.",
          },
        ]}
      >
        <BakersGame />
      </GamePageLayout>
    </>
  );
}
