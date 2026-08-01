import { createFileRoute } from "@tanstack/react-router";
import { Spider } from "@/components/Spider";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "1 Suit Spider Solitaire — Solitaire Station";
const DESC = "Play 1 Suit Spider Solitaire free online at Solitaire Station — the easiest Spider variant, played entirely with spades. Build 8 complete K–A sequences across 10 columns. No download or sign-up.";
const OG_IMG = `${SITE_URL}/og/spider.png`;

export const Route = createFileRoute("/1-suit-spider-solitaire")({
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
      { property: "og:url", content: `${SITE_URL}/1-suit-spider-solitaire` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/1-suit-spider-solitaire` },
      { rel: "icon", href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>♠</text></svg>" },
    ],
  }),
  component: OneSuitSpiderPage,
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "1 Suit Spider Solitaire — Solitaire Station",
  url: `${SITE_URL}/1-suit-spider-solitaire`,
  description: DESC,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
});

function OneSuitSpiderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      <GamePageLayout
        badge="Spider · 1 Suit"
        title="1 Suit Spider Solitaire"
        tagline="All spades — the most accessible way to learn Spider Solitaire."
        rulesIntro="1 Suit Spider Solitaire uses two full decks shuffled together, but every card is re-suited as a spade. Because every card shares the same suit, any descending sequence you build is automatically a valid same-suit run that can be moved or removed. This makes it the friendliest entry point into Spider: you can focus entirely on sequencing strategy without worrying about mixed-suit locks."
        rules={[
          {
            title: "Why 1 suit is the easiest",
            body: "In standard Spider, a run of mixed suits gets locked — only the top card is movable. With 1 suit that restriction disappears entirely: every sequence you build is a valid run. You can reorder columns freely, which dramatically increases the number of legal moves available at any point.",
          },
          {
            title: "Building sequences",
            body: "Stack cards in descending order (K, Q, J, 10 … 2, A) within the 10 tableau columns. Any face-up card can be placed on any card that is exactly one rank higher. When a complete K–A sequence of 13 cards sits at the top of a column, it is automatically cleared from the board.",
          },
          {
            title: "Dealing from the stock",
            body: "Click Deal to place one new card on each of the 10 columns. You must have at least one card in every column before dealing. There are 5 deal groups of 10 cards each — use them only when you are stuck, since each deal adds chaos to the board.",
          },
          {
            title: "Empty columns",
            body: "Clearing a column creates an empty space. Empty columns are powerful: any single card or valid run can be moved there, giving you temporary storage to reorganise the board. Guard them carefully.",
          },
          {
            title: "Winning",
            body: "Clear all 8 complete K–A sequences from the board to win. With 104 cards split across 8 sequences of 13, every card has a place — your job is to find the right order of moves to put them all there.",
          },
          {
            title: "Strategy tip",
            body: "In 1 Suit, the primary challenge is managing empty columns rather than suit discipline. Prioritise uncovering face-down cards and building long sequences early. Each deal you skip is a deal you may not need — the fewer deals you use, the more control you retain.",
          },
        ]}
      >
        <Spider initialDifficulty={1} />
      </GamePageLayout>
    </>
  );
}
