import { createFileRoute } from "@tanstack/react-router";
import { Canfield } from "@/components/Canfield";
import { GamePageLayout } from "@/components/GamePageLayout";
import { CanfieldWrapDemo } from "@/components/RuleDemo";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/canfield")({
  head: () => ({
    meta: [
      { title: "Solitaire Station — Free Canfield Solitaire" },
      {
        name: "description",
        content:
          "Play free Canfield solitaire at Solitaire Station — a challenging variant with a reserve pile, wrapping foundations, and draw-3 stock. Hints, undo, and auto-save. No download.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Solitaire Station — Free Canfield Solitaire" },
      {
        property: "og:description",
        content:
          "Play free Canfield solitaire — reserve pile, wrapping foundations, draw-3 stock. One of the most challenging solitaire variants. Hints and auto-save.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/canfield` },
      { property: "og:image", content: `${SITE_URL}/og/canfield.png?v=2` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free Canfield Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solitaire Station — Free Canfield Solitaire" },
      {
        name: "twitter:description",
        content:
          "Play free Canfield solitaire — reserve pile, wrapping foundations, draw-3. No download or sign-up.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og/canfield.png?v=2` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/canfield` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: CanfieldPage,
});

const CANFIELD_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Solitaire Station — Free Canfield Solitaire",
  url: `${SITE_URL}/canfield`,
  description:
    "Play free Canfield solitaire — a challenging variant with a reserve pile, wrapping foundations starting at a random rank, and draw-3 stock. Hints, undo, and auto-save. No download, no sign-up.",
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

function CanfieldPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: CANFIELD_LD }}
      />
      <GamePageLayout
        gameKey="canfield"
        badge="Canfield · Reserve & wrap"
        title="Canfield Solitaire"
        tagline="A reserve pile feeds your tableau, foundations start at a random rank and wrap — one of solitaire's great challenges."
        rulesIntro="Canfield is named after Richard A. Canfield, who ran a high-stakes gambling house in the 1890s where players would buy a deck for $50 and win $5 per card sent to the foundations. Only about 1 in 30 deals is winnable, making every victory a genuine achievement. The game's distinctive features — a reserve pile, foundations that start at a random rank and wrap around, and an empty-column restriction — combine to create a uniquely demanding puzzle."
        rules={[
          {
            title: "The setup",
            body: "13 cards are dealt to the reserve pile (only the top card is visible). One card is dealt to the first foundation — its rank becomes the base rank for all foundations. Four tableau columns receive one card each. The remaining 34 cards form the stock.",
          },
          {
            title: "Foundations",
            body: "All four foundations must start at the base rank (one per suit). Foundations build up in suit, wrapping around: for example, if the base rank is 7, build 7→8→9→10→J→Q→K→A→2→3→4→5→6. Win by filling all four foundations.",
            demo: <CanfieldWrapDemo />,
          },
          {
            title: "Tableau building",
            body: "Tableau columns build down in alternating colors, wrapping allowed (Ace can go on 2, King on Ace). You can move single cards or entire valid sequences. Empty columns may only be filled from the reserve (or any card if the reserve is empty).",
          },
          {
            title: "The reserve",
            body: "Only the top card of the reserve is visible and playable. It can go to any foundation or tableau column, including empty ones. The reserve is your main source of new cards — use it wisely.",
          },
          {
            title: "Stock and waste",
            body: "Click the stock to deal 3 cards to the waste. Only the top waste card is playable. When the stock is empty, click it to recycle the entire waste pile back — you can do this as many times as needed.",
          },
          {
            title: "Strategy tips",
            body: "Prioritise getting the reserve top card onto the tableau or foundation to uncover new reserve cards. Be cautious with empty columns — only the reserve can fill them until the reserve is exhausted. Think ahead about which suits need to catch up on the foundations.",
          },
        ]}
      >
        <Canfield />
      </GamePageLayout>
    </>
  );
}
