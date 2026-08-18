import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { GUIDES, GUIDE_GAMES, type GameTag } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/guides/")({
  component: GuidesPage,
  head: () => ({
    meta: [
      { title: "Solitaire Station — Solitaire Strategy Guides" },
      {
        name: "description",
        content:
          "Free solitaire strategy guides — rules, win rates, tips, and history for all 16 games including Klondike, Spider, FreeCell, Pyramid, and more.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Solitaire Station — Solitaire Strategy Guides" },
      {
        property: "og:description",
        content:
          "Solitaire Station — strategy guides for 16 solitaire games: rules, win-rate breakdowns, strategy tips, history, and glossary.",
      },
      { property: "og:url", content: `${SITE_URL}/guides` },
      { property: "og:image", content: `${SITE_URL}/og/klondike.png?v=6` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/og/klondike.png?v=6` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/guides` }],
  }),
});

const TAG_COLOR: Record<GameTag, string> = {
  klondike:     "#16a34a",
  spider:       "#7c3aed",
  freecell:     "#0e7490",
  pyramid:      "#b45309",
  tripeaks:     "#be185d",
  mahjong:      "#dc2626",
  golf:         "#15803d",
  fortythieves: "#92400e",
  yukon:        "#1d4ed8",
  scorpion:     "#b91c1c",
  eightoff:     "#0f766e",
  canfield:     "#7e22ce",
  addiction:    "#c2410c",
  bakersdozen:  "#a16207",
  bakersgame:   "#1e3a5f",
  clock:        "#374151",
  general:      "#4b5563",
};

const GUIDES_INDEX_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Solitaire Strategy Guides — Solitaire Station",
  "description": "Strategy guides for 16 solitaire games: rules, win-rate breakdowns, tips, history, and glossary.",
  "url": `${SITE_URL}/guides`,
  "inLanguage": "en-US",
  "publisher": {
    "@type": "Organization",
    "name": "Solitaire Station",
    "url": `${SITE_URL}/`,
  },
});

function GuidesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: GUIDES_INDEX_LD }} />
    <main className="mx-auto min-h-screen w-full max-w-[900px] px-4 py-10 sm:py-16 xl:max-w-[1100px]">
      {/* Back link */}
      <Link
        to="/"
        className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
      >
        ← Back to game
      </Link>

      {/* Hero */}
      <div className="mt-6">
        <h1
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Solitaire Strategy Guides
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Rules, win-rate breakdowns, strategy tips, and history — for all 16 games.
        </p>
      </div>

      {/* Groups */}
      <div className="mt-10 space-y-12">
        {GUIDE_GAMES.map(({ tag, label, emoji, path }) => {
          const gameGuides = GUIDES.filter((g) => g.game === tag);
          if (gameGuides.length === 0) return null;
          const color = TAG_COLOR[tag];
          return (
            <section key={tag}>
              {/* Section header */}
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xl">{emoji}</span>
                <h2
                  className="text-lg font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {label}
                </h2>
                <Link
                  to={path as "/"}
                  className="ml-auto text-xs text-muted-foreground transition hover:text-foreground"
                >
                  Play {label === "All Games" ? "now" : label} →
                </Link>
              </div>

              {/* Guide cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gameGuides.map((guide) => (
                  <Link
                    key={guide.slug}
                    to="/guides/$slug"
                    params={{ slug: guide.slug }}
                    className="glass group flex flex-col rounded-2xl p-5 transition-all hover:ring-1"
                    style={{ "--ring-color": color } as React.CSSProperties}
                  >
                    {/* Tag pill */}
                    <span
                      className="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ background: `${color}22`, color }}
                    >
                      {label}
                    </span>

                    {/* Title */}
                    <h3 className="mt-3 text-sm font-semibold leading-snug tracking-tight text-foreground transition group-hover:text-foreground/90">
                      {guide.title}
                    </h3>

                    {/* Description preview */}
                    <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                      {guide.description}
                    </p>

                    <span
                      className="mt-4 text-xs font-medium transition"
                      style={{ color }}
                    >
                      Read guide →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <SiteFooter showBackLink />
    </main>
    </>
  );
}
