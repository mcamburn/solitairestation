import { createFileRoute } from "@tanstack/react-router";
import { Yukon } from "@/components/Yukon";
import { GamePageLayout } from "@/components/GamePageLayout";
import { YukonGroupMoveDemo } from "@/components/RuleDemo";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/yukon")({
  head: () => ({
    meta: [
      { title: "Solitaire Station — Free Yukon Solitaire" },
      { name: "description", content: "Play free Yukon Solitaire at Solitaire Station — move any face-up group of cards in this challenging no-stock variant. Hints, undo, and auto-save. No download required." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Solitaire Station — Free Yukon Solitaire" },
      { property: "og:description", content: "Play free Yukon Solitaire at Solitaire Station — move any face-up group to build foundations. No stock pile, maximum strategy." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/yukon` },
      { property: "og:image", content: `${SITE_URL}/og/yukon.png?v=5` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free Yukon Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solitaire Station — Free Yukon Solitaire" },
      { name: "twitter:description", content: "Play free Yukon Solitaire — move any face-up group to build four foundations. No stock pile, pure strategy." },
      { name: "twitter:image", content: `${SITE_URL}/og/yukon.png?v=5` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/yukon` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: YukonPage,
});

const YUKON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Solitaire Station — Free Yukon Solitaire",
  "url": `${SITE_URL}/yukon`,
  "description": "Play free Yukon Solitaire at Solitaire Station — move any face-up group of cards to build four suit foundations. No stock pile. Hints, undo, and auto-save.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function YukonPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: YUKON_LD }} />
      <GamePageLayout
        gameKey="yukon"
        badge="Yukon · Strategy solitaire"
        title="Yukon Solitaire"
        tagline="Move any face-up card — and every card on top of it — to unbury hidden cards and build four foundations."
        rulesIntro="Yukon is a popular solitaire variant that gives you far more freedom than Klondike. There's no stock pile — all 52 cards are dealt face-up across seven columns from the start. The key innovation: you can move any face-up card, plus everything sitting on top of it, as a single group — even if those cards don't form a proper sequence. This freedom makes Yukon feel wide-open, but building four suit foundations from Ace to King still demands careful planning."
        rules={[
          {
            title: "The setup",
            body: "Seven columns are dealt in the standard Klondike diagonal (column 1 has 1 card, column 2 has 2, etc., all face-down except the top). The remaining 24 cards are then distributed 4 each to columns 2–7, all face-up.",
          },
          {
            title: "Moving groups — Yukon's key rule",
            body: "You can pick up any face-up card together with ALL cards on top of it (regardless of order or suit) and move the group to another column. The only constraint: the bottom card of the moving group must be one rank lower and opposite color from the top card of the destination column.",
            demo: <YukonGroupMoveDemo />,
          },
          {
            title: "Empty columns",
            body: "Only a King (or a group whose bottom card is a King) may be placed in an empty column. Use empty columns strategically to reorganize your tableau.",
          },
          {
            title: "Foundations",
            body: "Build four foundation piles up in suit from Ace to King. You can send any eligible top card directly to a foundation pile.",
          },
          {
            title: "Flipping face-down cards",
            body: "When you move a group off a column, the top face-down card that is revealed is automatically flipped face-up, opening new possibilities.",
          },
          {
            title: "Winning",
            body: "Move all 52 cards onto the four foundations (Ace through King per suit) to win. Unlike Klondike, there is no stock — every card is visible from the start, making Yukon highly strategic.",
          },
          {
            title: "Strategy tips",
            body: "Because you can move any face-up card plus everything on top of it regardless of order, focus first on uncovering face-down cards — each flip opens new possibilities. When moving a disorganised group, ask whether the bottom card of the group actually extends anything useful at the destination; moving chaos onto chaos just shuffles the problem. Prioritise building alternating-color tableau sequences rather than long same-suit ones — Yukon's freedom comes from flexible group moves, not same-suit discipline. Empty columns are extremely powerful: use them as swap space to reorganise groups before sending cards to foundations.",
          },
        ]}
      >
        <Yukon />
      </GamePageLayout>
    </>
  );
}
