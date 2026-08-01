import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "@/components/Clock";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/clock")({
  head: () => ({
    meta: [
      { title: "Free Clock Patience — Solitaire Station" },
      { name: "description", content: "Play free Clock Patience at Solitaire Station — watch the cards automatically reveal themselves around the clock face. A mesmerizing, luck-based solitaire with Auto Play mode. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Free Clock Patience — Solitaire Station" },
      { property: "og:description", content: "Play free Clock Patience at Solitaire Station — a self-playing solitaire where cards reveal themselves around a clock face. Auto Play included." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/clock` },
      { property: "og:image", content: `${SITE_URL}/og/clock.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Free Clock Patience — Solitaire Station" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free Clock Patience — Solitaire Station" },
      { name: "twitter:description", content: "Watch cards deal themselves around a clock face in this mesmerizing self-playing solitaire. Will all Kings be the last to fall?" },
      { name: "twitter:image", content: `${SITE_URL}/og/clock.png` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/clock` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: ClockPage,
});

const CLOCK_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free Clock Patience — Solitaire Station",
  "url": `${SITE_URL}/clock`,
  "description": "Play free Clock Patience at Solitaire Station — a fully automatic self-playing solitaire where cards reveal themselves around a clock face. Watch, or let Auto Play run it for you.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function ClockPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: CLOCK_LD }} />
      <GamePageLayout
        gameKey="clock"
        badge="Clock · Self-playing patience"
        title="Clock Patience"
        tagline="Watch the deck deal itself around the clock — can all the Kings wait till last?"
        rulesIntro="Clock Patience (also known as Clock Solitaire) is a fully automatic card game — no decisions to make, just deal and watch. The entire 52-card deck is laid out in 13 face-down piles arranged like a clock face, with Kings in the center. Cards flip one at a time and find their correct position on the clock. The outcome is entirely determined by the shuffle, making each game a suspenseful reveal. Winning is genuinely rare — only about 1 in 13 games can be won."
        rules={[
          {
            title: "The setup",
            body: "All 52 cards are dealt face-down into 13 piles of 4. Piles 1–12 form a clock face (Ace at 1 o'clock, 2 at 2 o'clock … Queen at 12 o'clock). The 13th pile — the Kings — sits at the center.",
          },
          {
            title: "How it works",
            body: "The game starts by flipping the top face-down card from the King pile (center). Each card is placed face-up at the bottom of the pile matching its rank. The top face-down card of that pile is then flipped and moved to its own pile — and so on, cascading around the clock.",
          },
          {
            title: "The only decision",
            body: "Click 'Deal Next Card' to advance one step, or toggle 'Auto Play' to let the game run itself automatically. There are no choices to make — the order is entirely determined by the shuffle.",
          },
          {
            title: "Losing",
            body: "If all four Kings are revealed face-up before every other card has been placed, the game is lost. This happens in roughly 12 out of 13 games.",
          },
          {
            title: "Winning",
            body: "The game is won if all 48 non-King cards are revealed face-up before the fourth and final King is turned over. This requires the four Kings to be the very last four cards dealt — an exceptional result.",
          },
          {
            title: "Strategy",
            body: "There is no strategy — Clock Patience is a game of pure chance. It's best enjoyed as a meditative shuffle-and-reveal, or as a quick test of luck between more demanding games.",
          },
        ]}
      >
        <Clock />
      </GamePageLayout>
    </>
  );
}
