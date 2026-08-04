import { createFileRoute } from "@tanstack/react-router";
import { BakersDozn } from "@/components/BakersDozn";
import { GamePageLayout } from "@/components/GamePageLayout";
import { BakersDozAnySuitDemo } from "@/components/RuleDemo";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/bakers-dozen")({
  head: () => ({
    meta: [
      { title: "Solitaire Station — Free Baker's Dozen Solitaire" },
      {
        name: "description",
        content:
          "Play free Baker's Dozen solitaire at Solitaire Station — build 13 face-up columns by rank, no suit. Kings start at the bottom. Hints, undo, and auto-save. No download or sign-up.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Solitaire Station — Free Baker's Dozen Solitaire" },
      {
        property: "og:description",
        content:
          "Play free Baker's Dozen solitaire at Solitaire Station — 13 face-up columns, rank-only moves. Kings pinned to the bottom. Hints and auto-save.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/bakers-dozen` },
      { property: "og:image", content: `${SITE_URL}/og/bakers-dozen.png?v=4` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free Baker's Dozen Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solitaire Station — Free Baker's Dozen Solitaire" },
      {
        name: "twitter:description",
        content:
          "Play free Baker's Dozen solitaire — 13 face-up columns, rank-only moves, Kings pinned. No download or sign-up.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og/bakers-dozen.png?v=4` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/bakers-dozen` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: BakersDozenPage,
});

const BAKERS_DOZEN_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Solitaire Station — Free Baker's Dozen Solitaire",
  url: `${SITE_URL}/bakers-dozen`,
  description:
    "Play free Baker's Dozen solitaire — 13 face-up columns, rank-only moves, Kings pinned to the bottom. Hints, undo, and auto-save. No download, no sign-up.",
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
  publisher: {
    "@type": "Organization",
    name: "Solitaire Station",
    url: `${SITE_URL}/`,
  },
});

function BakersDozenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: BAKERS_DOZEN_LD }}
      />
      <GamePageLayout
        gameKey="bakersdozen"
        badge="Baker's Dozen · Rank-only moves"
        title="Baker's Dozen Solitaire"
        tagline="All 52 cards dealt face-up — move cards by rank alone and build four foundations from Ace to King."
        rulesIntro="Baker's Dozen is a uniquely open solitaire variant where all 52 cards are dealt face-up from the start, giving you complete information at every moment. The challenge lies entirely in sequencing: only the top card of each column is moveable, moves are based solely on rank (suit is irrelevant), and empty columns cannot be refilled. Kings are automatically placed at the bottom of each column on the deal, preventing them from blocking play — but with 13 narrow columns and rigid movement rules, Baker's Dozen still demands careful planning."
        rules={[
          {
            title: "The setup",
            body: "52 cards are dealt face-up into 13 columns of 4 cards. Kings are automatically moved to the bottom of each column so they never block moves. Deals with two or more Kings in the same column are reshuffled for a fairer start.",
          },
          {
            title: "Moving cards",
            body: "Only the top card of each column can be moved. A card may be placed on any other column whose top card has a rank exactly one higher — suit does not matter. For example, a 7 of any suit can go on an 8 of any suit.",
            demo: <BakersDozAnySuitDemo />,
          },
          {
            title: "Empty columns",
            body: "If a column becomes empty it stays that way — no card can be moved to an empty column. Every empty column is a lost slot, so plan carefully to avoid stranding yourself.",
          },
          {
            title: "Foundations",
            body: "Build four foundation piles up in suit from Ace (A→2→3…→K). Any top card that matches the next required rank and suit can go to a foundation. Double-click a top card to auto-send it to the foundation.",
          },
          {
            title: "Winning",
            body: "Move all 52 cards to the four foundation piles to win. Baker's Dozen has a high solvability rate — most deals are winnable with careful sequencing.",
          },
          {
            title: "Strategy tips",
            body: "Prioritise freeing Aces and 2s early so foundations can grow. Try to unblock lower-ranked cards buried under higher ones. Avoid filling columns with Kings since empty columns can't be used — and Kings can only move to the foundation.",
          },
        ]}
      >
        <BakersDozn />
      </GamePageLayout>
    </>
  );
}
