import { createFileRoute } from "@tanstack/react-router";
import { Solitaire } from "@/components/Solitaire";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "Solitaire Station — Turn 1 Solitaire";
const DESC = "Play Turn 1 (Draw 1) Klondike Solitaire free online at Solitaire Station — no download, no sign-up. Draw one card at a time for the most accessible version of classic Klondike. Hints, undo, and auto-save included.";
const OG_IMG = `${SITE_URL}/og/klondike.png?v=6`;

export const Route = createFileRoute("/turn-1-solitaire")({
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
      { property: "og:url", content: `${SITE_URL}/turn-1-solitaire` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/turn-1-solitaire` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: Turn1Page,
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Solitaire Station — Turn 1 Solitaire",
  url: `${SITE_URL}/turn-1-solitaire`,
  description: DESC,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
});

function Turn1Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      <GamePageLayout
        gameKey="klondike"
        badge="Klondike · Turn 1"
        title="Turn 1 Solitaire"
        tagline="Draw one card at a time — the most accessible and beginner-friendly version of classic Klondike."
        rulesIntro="Turn 1 Solitaire (also called Draw 1 Klondike) is the classic version of the game where you draw a single card from the stock pile each time you click. Every card is immediately available to play, making this the most approachable and winnable form of Klondike solitaire."
        rules={[
          {
            title: "Drawing from the stock",
            body: "Click the stock to flip one card face-up onto the waste pile. That card is immediately available to play to the tableau or foundations. Once played, the next card in the stock becomes the top of the waste.",
          },
          {
            title: "Cycling through the stock",
            body: "When the stock is exhausted, click it to recycle the entire waste pile back into the stock face-down. In standard Turn 1 mode there is no pass limit — you may cycle as many times as needed.",
          },
          {
            title: "Building the tableau",
            body: "Build columns in descending rank, alternating red and black. Move sequences of face-up cards from column to column. Only a King (or a sequence headed by a King) can fill an empty column.",
          },
          {
            title: "Foundations",
            body: "Move Aces to the four foundation piles as they appear. Build each foundation up by suit from Ace to King. The game is won when all 52 cards are on the foundations.",
          },
          {
            title: "Why Turn 1 is more winnable",
            body: "Because every stock card is immediately available, you have far more options per pass than in Turn 3. Statistically, roughly 80% of Turn 1 deals are winnable with optimal play — compared to around 10% for Turn 3.",
          },
          {
            title: "Strategy tip",
            body: "Prioritise uncovering face-down tableau cards over playing cards straight to foundations. The more face-down cards you reveal, the more moves become available later. Empty columns are powerful — save them for Kings that unblock critical cards.",
          },
        ]}
      >
        <Solitaire initialMode="draw1" />
      </GamePageLayout>
    </>
  );
}
