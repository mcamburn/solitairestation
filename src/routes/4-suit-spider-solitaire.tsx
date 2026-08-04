import { createFileRoute } from "@tanstack/react-router";
import { Spider } from "@/components/Spider";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "Solitaire Station — 4 Suit Spider Solitaire";
const DESC = "Play 4 Suit Spider Solitaire free online at Solitaire Station — all four suits at expert difficulty. The hardest and most rewarding Spider variant. Full suit discipline required on every move. No download.";
const OG_IMG = `${SITE_URL}/og/spider.png?v=3`;

export const Route = createFileRoute("/4-suit-spider-solitaire")({
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
      { property: "og:url", content: `${SITE_URL}/4-suit-spider-solitaire` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/4-suit-spider-solitaire` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: FourSuitSpiderPage,
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Solitaire Station — 4 Suit Spider Solitaire",
  url: `${SITE_URL}/4-suit-spider-solitaire`,
  description: DESC,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
});

function FourSuitSpiderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      <GamePageLayout
        gameKey="spider"
        badge="Spider · 4 Suits"
        title="4 Suit Spider Solitaire"
        tagline="All four suits — the hardest and most rewarding Spider challenge."
        rulesIntro="4 Suit Spider Solitaire uses all four suits — spades, hearts, diamonds, and clubs — across 104 cards. Every suit must be sequenced independently from King to Ace. Mixed-suit stacks are possible but costly: they block group moves and make clearing sequences exponentially harder. This is the canonical, casino-style Spider that separates casual players from true experts."
        rules={[
          {
            title: "All four suits",
            body: "The 104-card double deck contains 26 cards of each suit. You must assemble all 8 complete K–A sequences — two spade, two heart, two diamond, two club — to win. Each suit is a distinct colour and symbol, making visual tracking essential.",
          },
          {
            title: "The mixed-suit penalty",
            body: "You may stack any card on any card that is one rank higher, regardless of suit. But only a run where every card shares the same suit can be moved as a group or cleared as a completed sequence. A king-high mixed stack of 13 cards is worthless — it cannot be removed until it is broken apart and re-sorted by suit.",
          },
          {
            title: "Planning several moves ahead",
            body: "At 4 suits, placements that look helpful now frequently create inescapable locks later. Before moving any card, trace the consequence two or three moves forward. If placing this card buries a needed card of a different suit, it is almost always the wrong move.",
          },
          {
            title: "Empty columns — your most powerful asset",
            body: "An empty column is temporary storage for any single card or same-suit run. In 4 Suit, creating and protecting empty columns is the central strategy. Use them to un-bury needed cards, break apart mixed stacks, and route same-suit cards together. Letting a deal fill your empty columns prematurely is often unrecoverable.",
          },
          {
            title: "When to deal",
            body: "Each of the five deal groups drops one card on every column (all 10 must be non-empty). A well-timed deal can resolve a stuck position; a poorly-timed one buries progress under new chaos. Count your empty columns and assess your same-suit run progress before dealing — if you have two or more empty columns and clear paths to complete at least one suit sequence, you are in a strong position.",
          },
          {
            title: "Win rate and expectations",
            body: "Expert sources estimate that roughly 1 in 3 random 4-suit Spider deals is solvable with perfect play. Most losses are not the result of a single bad move but of accumulated mixed-suit compromises. Winning a 4-suit game feels genuinely earned — it is one of the most satisfying achievements in solitaire.",
          },
        ]}
      >
        <Spider initialDifficulty={4} />
      </GamePageLayout>
    </>
  );
}
