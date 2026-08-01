import { createFileRoute } from "@tanstack/react-router";
import { Solitaire } from "@/components/Solitaire";
import { GamePageLayout } from "@/components/GamePageLayout";
import { SITE_URL } from "@/lib/site";

const TITLE = "Vegas Solitaire — Free Online Vegas Scoring Klondike";
const DESC = "Play Vegas Solitaire free online — the classic casino scoring variant. Start with a $52 wager, earn $5 per card on the foundation, and survive three passes through the stock. No download required.";
const OG_IMG = `${SITE_URL}/og/klondike.png`;

export const Route = createFileRoute("/vegas-solitaire")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Free-Klondike-Solitaire.com" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/vegas-solitaire` },
      { property: "og:image", content: OG_IMG },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMG },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/vegas-solitaire` },
      { rel: "icon", href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🃏</text></svg>" },
    ],
  }),
  component: VegasPage,
});

const LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Vegas Solitaire",
  url: `${SITE_URL}/vegas-solitaire`,
  description: DESC,
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  genre: ["Card Game", "Solitaire"],
  inLanguage: "en-US",
});

function VegasPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: LD }} />
      <GamePageLayout
        badge="Klondike · Vegas"
        title="Vegas Solitaire"
        tagline="The classic casino scoring variant — $52 wager, $5 per foundation card, three passes to beat the house."
        rulesIntro="Vegas Solitaire is Klondike with casino-style scoring. You start each hand down $52 (the wager) and earn $5 for every card moved to a foundation pile. The stock deals three cards at a time and you get a maximum of three passes through it — just like the casino version. A full win returns $208 gross ($156 net profit). Most hands end at a small loss, which is exactly the challenge."
        rules={[
          {
            title: "The wager",
            body: "Each hand costs a virtual $52 — $1 per card in the deck. Your NET score starts at -$52 and rises by $5 each time a card reaches a foundation pile. Break-even requires 11 foundation cards ($55 gross). A full win returns $156 net.",
          },
          {
            title: "Draw 3 stock",
            body: "Three cards are flipped from the stock at a time. Only the topmost card of the three is playable. Once played, the next card becomes available.",
          },
          {
            title: "Three-pass limit",
            body: "You may cycle through the stock at most three times total. When the stock is empty and you have used all three passes, no more draws are available — the remaining waste cards are inaccessible.",
          },
          {
            title: "Scoring display",
            body: "Your net score (gross minus $52 wager) is shown in the top bar. Negative values like -$42 mean you are down $42 for the hand. Positive values mean you are ahead. Breaking even is itself an achievement in Vegas mode.",
          },
          {
            title: "Strategy shift",
            body: "Unlike standard Klondike, Vegas rewards speed over flexibility. Move every card to the foundation as soon as it is legal — there is no benefit to holding a low card in the tableau when it could earn $5 on the foundation right now.",
          },
          {
            title: "The house edge",
            body: "Vegas scoring is deliberately hard. Average players lose on most individual hands. The goal is to minimise losses on unwinnable deals and maximise returns on the winnable ones — the same challenge professional card counters faced in real casino solitaire.",
          },
        ]}
      >
        <Solitaire initialMode="vegas" />
      </GamePageLayout>
    </>
  );
}
