import { createFileRoute } from "@tanstack/react-router";
import { Scorpion } from "@/components/Scorpion";
import { GamePageLayout } from "@/components/GamePageLayout";
import { ScorpionGroupDemo } from "@/components/RuleDemo";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/scorpion")({
  head: () => ({
    meta: [
      { title: "Solitaire Station — Free Scorpion Solitaire" },
      { name: "description", content: "Play free Scorpion Solitaire at Solitaire Station — move any face-up group onto same-suit sequences and clear all four K-to-A runs. Hints, undo, and auto-save." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Solitaire Station — Free Scorpion Solitaire" },
      { property: "og:description", content: "Play free Scorpion Solitaire — move face-up groups onto same-suit sequences, complete four K-to-A runs to win. No sign-up needed." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/scorpion` },
      { property: "og:image", content: `${SITE_URL}/og/scorpion.png?v=6` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free Scorpion Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solitaire Station — Free Scorpion Solitaire" },
      { name: "twitter:description", content: "Play free Scorpion Solitaire — build four complete same-suit sequences from King to Ace. Hints, undo, auto-save." },
      { name: "twitter:image", content: `${SITE_URL}/og/scorpion.png?v=6` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/scorpion` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: ScorpionPage,
});

const SCORPION_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Solitaire Station — Free Scorpion Solitaire",
  "url": `${SITE_URL}/scorpion`,
  "description": "Play free Scorpion Solitaire at Solitaire Station — move face-up groups of same-suit cards and build four complete K-to-A sequences. Hints, undo, and auto-save.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function ScorpionPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCORPION_LD }} />
      <GamePageLayout
        gameKey="scorpion"
        badge="Scorpion · Same-suit sequences"
        title="Scorpion Solitaire"
        tagline="Stack same-suit sequences and clear four complete King-to-Ace runs from the tableau — with a three-card stock for tight spots."
        rulesIntro="Scorpion is a compelling solitaire variant that blends the group-moving freedom of Yukon with Spider's same-suit sequence objective. All sequences must be built in the same suit — so strategy and suit management are paramount. Most deals are winnable with careful play, and the tiny 3-card stock adds a single lifeline to escape tight positions."
        rules={[
          {
            title: "The setup",
            body: "Seven columns of 7 cards each. Columns 1–4 have 3 face-down cards followed by 4 face-up. Columns 5–7 have 7 face-up cards. The remaining 3 cards form the stock.",
          },
          {
            title: "Moving groups — Scorpion's rule",
            body: "Pick up any face-up card plus ALL cards on top of it (as a group, even if they're not in order or same suit) and place them on another column whose top card is exactly one rank higher AND the same suit as the bottom card of your moving group. For example, move a group starting with 8♥ onto a 9♥.",
            demo: <ScorpionGroupDemo />,
          },
          {
            title: "Empty columns",
            body: "Any card or group may be placed in an empty column — no restriction. Use this freedom to shuffle groups around.",
          },
          {
            title: "Flipping hidden cards",
            body: "When a face-down card becomes the top of a column, it is automatically flipped face-up, opening new moves.",
          },
          {
            title: "Completing a sequence",
            body: "Whenever a complete King-to-Ace run of the same suit appears anywhere in a column, it is automatically removed from the tableau. You need to remove all 4 such runs to win.",
          },
          {
            title: "The stock",
            body: "Click Deal to deal one card face-up to each of the first 3 columns. The stock can only be used once (it holds exactly 3 cards), so time it wisely.",
          },
          {
            title: "Winning",
            body: "Remove all four complete K-to-A same-suit sequences from the tableau to win. Most deals are solvable — think ahead and manage your suits carefully.",
          },
        ]}
      >
        <Scorpion />
      </GamePageLayout>
    </>
  );
}
