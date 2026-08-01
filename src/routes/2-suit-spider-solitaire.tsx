import { createFileRoute } from "@tanstack/react-router";
import { Spider } from "@/components/Spider";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "2 Suit Spider Solitaire — Solitaire Station";
const DESC = "Play 2 Suit Spider Solitaire free online at Solitaire Station — spades and hearts across 10 tableau columns. The perfect middle ground between easy 1-suit and expert 4-suit Spider. No download required.";
const OG_IMG = `${SITE_URL}/og/spider.png`;

export const Route = createFileRoute("/2-suit-spider-solitaire")({
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
      { property: "og:url", content: `${SITE_URL}/2-suit-spider-solitaire` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/2-suit-spider-solitaire` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: TwoSuitSpiderPage,
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "2 Suit Spider Solitaire — Solitaire Station",
  url: `${SITE_URL}/2-suit-spider-solitaire`,
  description: DESC,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
});

function TwoSuitSpiderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      <GamePageLayout
        badge="Spider · 2 Suits"
        title="2 Suit Spider Solitaire"
        tagline="Two suits, twice the challenge — the sweet spot for Spider strategy."
        rulesIntro="2 Suit Spider Solitaire introduces spades and hearts as two distinct suits. The core rules are identical to standard Spider, but now mixed-suit builds carry a real cost: a sequence of alternating spades and hearts can be stacked in descending order, but it cannot be moved as a unit. Only a pure single-suit run qualifies for group moves or sequence removal. This single change makes every placement decision meaningful."
        rules={[
          {
            title: "The two suits",
            body: "Cards are recoloured so that half the deck is spades (black) and half is hearts (red). You can visually distinguish them at a glance. Both suits must be sequenced K–A separately — a spade K–A sequence and a heart K–A sequence each count as one of the 8 completions required to win.",
          },
          {
            title: "Mixed stacks versus single-suit runs",
            body: "You may stack a red heart on a black spade (or vice versa) in descending order, and the resulting mixed column looks like a valid sequence — but it cannot be moved as a group. Only a consecutive same-suit run from the selected card to the column top can be moved together. Mixed stacks effectively lock lower cards until the run above them is cleared.",
          },
          {
            title: "Group moves",
            body: "To move multiple cards at once, all cards in the run must share the same suit. Click the lowest card in the same-suit run you want to move, then click the destination. If the run is valid, the entire group moves. Planning same-suit runs is the core skill that separates strong 2-suit play from weak play.",
          },
          {
            title: "Dealing and empty columns",
            body: "Click Deal to place one new card on each column (all 10 must be occupied). Five deal groups are available. Empty columns are even more valuable in 2 Suit than 1 Suit — they let you break apart mixed stacks, temporarily park runs, and create same-suit sequences. Protect them.",
          },
          {
            title: "Winning",
            body: "Complete all 8 K–A sequences (4 spade, 4 heart) and clear them from the board to win. Each completed sequence disappears automatically when it is assembled at the top of a column.",
          },
          {
            title: "Strategy tip",
            body: "In 2 Suit, the biggest mistake is building mixed-suit stacks carelessly. Before placing any card, ask: does this create a pure run or a mixed one? Prefer placements that extend same-suit sequences. When you must mix, do it in a column where the lower cards aren't needed soon.",
          },
        ]}
      >
        <Spider initialDifficulty={2} />
      </GamePageLayout>
    </>
  );
}
