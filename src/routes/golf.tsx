import { createFileRoute } from "@tanstack/react-router";
import { Golf } from "@/components/Golf";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/golf")({
  head: () => ({
    meta: [
      { title: "Free Golf Solitaire — Solitaire Station" },
      { name: "description", content: "Play free Golf solitaire at Solitaire Station — clear all 35 tableau cards by building on the waste pile ±1. Hints, undo, and auto-save. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Free Golf Solitaire — Solitaire Station" },
      { property: "og:description", content: "Play free Golf solitaire at Solitaire Station — clear all 35 tableau cards by building on the waste pile ±1. Hints and auto-save." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/golf` },
      { property: "og:image", content: `${SITE_URL}/og/golf.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Free Golf Solitaire — Solitaire Station" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free Golf Solitaire — Solitaire Station" },
      { name: "twitter:description", content: "Play free Golf solitaire at Solitaire Station — clear all tableau cards by playing ±1 onto the waste pile. No download or sign-up." },
      { name: "twitter:image", content: `${SITE_URL}/og/golf.png` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/golf` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: GolfPage,
});

const GOLF_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free Golf Solitaire — Solitaire Station",
  "url": `${SITE_URL}/golf`,
  "description": "Play free Golf solitaire at Solitaire Station — clear all 35 tableau cards by playing ±1 onto the waste pile. Hints, undo, and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function GolfPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: GOLF_LD }} />
      <GamePageLayout
        gameKey="golf"
        badge="Golf · Chain-building solitaire"
        title="Golf Solitaire"
        tagline="Chain cards up or down to clear the fairway — keep the run going and finish under par."
        rulesIntro="Golf Solitaire is a fast-paced, chain-building card game where the goal is to clear all seven columns of five cards each. Every card you play must be exactly one rank higher or lower than the current waste-pile top — and those chains can run for a long time if the cards fall right. The stock gives you a safety valve when you get stuck, but use it wisely: once the stock is gone, there's no second chance."
        rules={[
          {
            title: "The setup",
            body: "Seven tableau columns of five face-up cards (35 cards total) are dealt. One card is turned face-up to start the waste pile. The remaining 16 cards form the stock (face-down).",
          },
          {
            title: "Playing cards onto the waste",
            body: "Click the top card of any tableau column to play it onto the waste pile. The card must be exactly 1 rank higher or lower than the current waste-top. For example, a 7 can be played on a 6 or an 8. No wrapping: Ace (1) cannot be played on a King, and King cannot be played on an Ace.",
          },
          {
            title: "Chain runs",
            body: "Once you start a run — say 5, 6, 7, 8 — you can keep going as long as each next card is ±1. Long chains clear columns quickly and are the key to scoring well.",
          },
          {
            title: "Drawing from stock",
            body: "When no tableau top card is ±1 from the waste top, click the stock to flip its top card onto the waste. This new card becomes the new waste top. The stock can only be used once — there is no recycling.",
          },
          {
            title: "Winning",
            body: "Empty all seven tableau columns to win. The stock may still have cards remaining — it doesn't matter. Only the tableau needs to be cleared.",
          },
          {
            title: "Scoring",
            body: "Your penalty score is the number of cards remaining in the tableau when the game ends. Aim for zero (a win). Lower is better — like golf!",
          },
        ]}
      >
        <Golf />
      </GamePageLayout>
    </>
  );
}
