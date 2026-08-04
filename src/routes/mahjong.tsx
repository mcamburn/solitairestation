import { createFileRoute } from "@tanstack/react-router";
import { Mahjong } from "@/components/Mahjong";
import { GamePageLayout } from "@/components/GamePageLayout";
import { MahjongFreeDemo } from "@/components/RuleDemo";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/mahjong")({
  head: () => ({
    meta: [
      { title: "Solitaire Station — Free Mahjong Solitaire" },
      { name: "description", content: "Play free Mahjong solitaire at Solitaire Station — match identical free tiles to clear all 144 from the board. Flowers and seasons match within their group. Hints and auto-save. No download or sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "Solitaire Station — Free Mahjong Solitaire" },
      { property: "og:description", content: "Play free Mahjong solitaire at Solitaire Station — match identical free tiles to clear all 144 from the board. Hints and auto-save. No download or sign-up." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/mahjong` },
      { property: "og:image", content: `${SITE_URL}/og/mahjong.png?v=2` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Free Mahjong Solitaire" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Solitaire Station — Free Mahjong Solitaire" },
      { name: "twitter:description", content: "Play free Mahjong solitaire at Solitaire Station — match identical free tiles to clear all 144. No download or sign-up." },
      { name: "twitter:image", content: `${SITE_URL}/og/mahjong.png?v=2` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/mahjong` },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
    ],
  }),
  component: MahjongPage,
});

const MAHJONG_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Solitaire Station — Free Mahjong Solitaire",
  "url": `${SITE_URL}/mahjong`,
  "description": "Play free Mahjong solitaire at Solitaire Station — match identical free tiles to clear all 144 from the board. Hints and auto-save. No download, no sign-up.",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "genre": ["Card Game", "Mahjong Solitaire"],
  "inLanguage": "en-US",
  "publisher": { "@type": "Organization", "name": "Solitaire Station", "url": `${SITE_URL}/` },
});

function MahjongPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: MAHJONG_LD }} />
      <GamePageLayout
      gameKey="mahjong"
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
          demo: <MahjongFreeDemo />,
        },
        {
          title: "Matching",
          body: "Click a free tile to select it, then click another free tile of the same type to remove the pair. Clicking a different free tile moves the selection to that tile.",
        },
        {
          title: "Tile types and matching",
          body: "Bamboo (1–9), Circles (1–9), and Characters (1–9) match only an identical tile — same suit, same number. Wind tiles match East–East, South–South, West–West, North–North. Dragons match Red–Red, Green–Green, or White–White only.",
        },
        {
          title: "Flowers & Seasons",
          body: "The four Flower tiles (梅蘭菊荷) each match any other Flower — you don't need the same flower, just any two from the group. The four Season tiles (春夏秋冬) work the same way. Match them the moment two are free; they're easy points.",
        },
        {
          title: "Strategy — think before you match",
          body: "Before matching a pair, check whether both remaining copies of that tile are still accessible. Matching the only two reachable copies of a tile while two more copies are buried beneath them can make the layout unwinnable. When you can see four of the same tile and two are free, match those two immediately — it protects your access to the other two.",
        },
        {
          title: "Strategy — prioritise top layers",
          body: "Clearing tiles from the top of the stack and the exposed ends of rows unlocks the most tiles underneath. A tile buried under three others might block an entire section of the board. If you have a choice between two valid pairs, pick the one that frees more tiles in the upper layers or breaks a logjam on a congested row.",
        },
      ]}
    >
      <Mahjong />
    </GamePageLayout>
    </>
  );
}
