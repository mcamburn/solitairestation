import { createFileRoute } from "@tanstack/react-router";
import { Mahjong } from "@/components/Mahjong";
import { GamePageLayout } from "@/components/GamePageLayout";

export const Route = createFileRoute("/mahjong")({
  head: () => ({
    meta: [
      { title: "Free Mahjong Solitaire — Solitaire Station" },
      { name: "description", content: "Play free Mahjong solitaire at Solitaire Station — match identical free tiles to clear all 144 from the board. Flowers and seasons match within their group. Hints and auto-save. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Free Mahjong Solitaire — Solitaire Station" },
      { property: "og:description", content: "Play free Mahjong solitaire at Solitaire Station — match identical free tiles to clear all 144 from the board. Hints and auto-save. No download or sign-up." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.free-klondike-solitaire.com/mahjong" },
      { property: "og:image", content: "https://www.free-klondike-solitaire.com/og/mahjong.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Free Mahjong Solitaire — Solitaire Station" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free Mahjong Solitaire — Solitaire Station" },
      { name: "twitter:description", content: "Play free Mahjong solitaire at Solitaire Station — match identical free tiles to clear all 144. No download or sign-up." },
      { name: "twitter:image", content: "https://www.free-klondike-solitaire.com/og/mahjong.png" },
    ],
    links: [
      { rel: "canonical", href: "https://www.free-klondike-solitaire.com/mahjong" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: MahjongPage,
});

const MAHJONG_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Free Mahjong Solitaire — Solitaire Station",
  "url": "https://www.free-klondike-solitaire.com/mahjong",
  "description": "Play free Mahjong solitaire at Solitaire Station — match identical free tiles to clear all 144 from the board. Hints and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Mahjong Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": "https://www.free-klondike-solitaire.com/" },
});

function MahjongPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: MAHJONG_LD }} />
      <GamePageLayout
      badge="Mahjong · Pair matching"
      title="Mahjong Solitaire"
      tagline="Uncover the pyramid by matching identical tiles from the top down."
      rulesIntro="Mahjong Solitaire (Shanghai) uses 144 tiles stacked in layers. Match identical free tiles to remove them — clear all 144 to win."
      rules={[
        {
          title: "The layout",
          body: "144 tiles are arranged in a 5-layer step pyramid. The bottom layer has 72 tiles; each layer above is smaller, with the top layer holding just 4 tiles.",
        },
        {
          title: "Free tiles",
          body: "A tile is free (playable) when: (1) no tile sits directly on top of it, AND (2) at least one of its sides (left or right) has no adjacent tile in the same layer.",
        },
        {
          title: "Matching",
          body: "Click a free tile to select it, then click another free tile of the same type to remove the pair. Clicking a different free tile moves the selection to that tile.",
        },
        {
          title: "Suits",
          body: "Bamboo (1–9), Circles (1–9), and Characters (1–9) match only when rank and suit are identical. Wind tiles match East–East, South–South, etc. Dragons match only Red–Red, Green–Green, or White–White.",
        },
        {
          title: "Flowers & Seasons",
          body: "The four Flower tiles (梅蘭菊荷) match any other Flower tile. The four Season tiles (春夏秋冬) match any other Season tile. Only one of each exists.",
        },
        {
          title: "Strategy",
          body: "Start from the top of the pyramid and work outward to uncover blocked tiles. Avoid matching pairs that would bury identical tiles you'll need later.",
        },
      ]}
    >
      <Mahjong />
    </GamePageLayout>
    </>
  );
}
