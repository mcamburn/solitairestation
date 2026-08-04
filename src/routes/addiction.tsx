import { createFileRoute } from "@tanstack/react-router";
import { Addiction } from "@/components/Addiction";
import { GamePageLayout } from "@/components/GamePageLayout";
import { AddictionGapDemo } from "@/components/RuleDemo";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/addiction")({
  head: () => ({
    meta: [
      { title: "Solitaire Station — Free Addiction Solitaire" },
      { name: "description", content: "Play free Addiction Solitaire at Solitaire Station — arrange cards in same-suit rows from 2 to King by sliding into gaps. Up to 3 reshuffles allowed. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Solitaire Station — Free Addiction Solitaire" },
      { property: "og:description", content: "Arrange cards in 4 rows from 2 to King in the same suit using gaps as spaces. Up to 3 reshuffles. Hints, undo, and auto-save." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/addiction` },
      { property: "og:image", content: `${SITE_URL}/og/addiction.png?v=4` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free Addiction Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solitaire Station — Free Addiction Solitaire" },
      { name: "twitter:description", content: "Slide cards into gaps to build same-suit rows from 2 to King. Highly addictive puzzle solitaire with up to 3 reshuffles." },
      { name: "twitter:image", content: `${SITE_URL}/og/addiction.png?v=4` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/addiction` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: AddictionPage,
});

const ADDICTION_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Solitaire Station — Free Addiction Solitaire",
  "url": `${SITE_URL}/addiction`,
  "description": "Play free Addiction solitaire online — arrange cards in same-suit rows from 2 to King using gaps. Up to 3 reshuffles allowed.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire", "Puzzle"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function AddictionPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ADDICTION_LD }} />
      <GamePageLayout
        gameKey="addiction"
        badge="Addiction · Gap-sliding puzzle"
        title="Addiction Solitaire"
        tagline="Slide cards into gaps to sort four rows from 2 to King, each in the same suit — surprisingly addictive."
        rulesIntro="Addiction Solitaire is a deceptively simple yet deeply strategic puzzle. All 52 cards are spread across a 4×13 grid, and the 4 Aces are removed to create gaps. Your goal is to slide cards into those gaps to sort each row into a single suit running from 2 through King. It sounds straightforward — until the gaps get blocked by Kings and the layout ties itself in knots. Up to three reshuffles give you a second (and third) chance."
        rules={[
          {
            title: "The setup",
            body: "All 52 cards are dealt into 4 rows of 13 positions. The four Aces are then removed, leaving 4 gaps spread across the grid.",
          },
          {
            title: "Moving a card into a gap",
            body: "A card can slide into a gap only if the card immediately to the left of that gap is the same suit and exactly one rank lower. For example, 6♥ can slide into a gap that has 5♥ to its left.",
            demo: <AddictionGapDemo />,
          },
          {
            title: "Column 1 (leftmost)",
            body: "A gap in the very first column of any row can only accept a 2. This anchors the start of a suit sequence.",
          },
          {
            title: "Kings block gaps",
            body: "A gap immediately to the right of a King cannot accept any card — the sequence cannot extend beyond a King, so that gap is effectively dead.",
          },
          {
            title: "Locked cards",
            body: "A card is locked and cannot be moved if it is correctly placed in sequence and all cards to its left in the same row are also correctly placed, chaining back to a 2 in column 1.",
          },
          {
            title: "Reshuffle",
            body: "When you run out of moves, click Shuffle to pick up all non-locked cards and re-deal them randomly into the available positions. Aces are removed again to restore the gaps. You get up to 3 reshuffles per game.",
          },
          {
            title: "Winning",
            body: "Each of the 4 rows must show cards 2 through King in the same suit (positions 1–12), with position 13 left as a gap.",
          },
        ]}
      >
        <Addiction />
      </GamePageLayout>
    </>
  );
}
