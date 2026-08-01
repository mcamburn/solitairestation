import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { GUIDES, GUIDE_GAMES, type GameTag } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/guides/$slug")({
  component: GuidePage,
  head: ({ params }) => {
    const guide = GUIDES.find((g) => g.slug === (params as { slug: string }).slug);
    if (!guide) return {};
    return {
      meta: [
        { title: `${guide.title} — Solitaire Station` },
        { name: "description", content: guide.description },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: `${guide.title} — Solitaire Station` },
        { property: "og:description", content: guide.description },
        { property: "og:url", content: `${SITE_URL}/guides/${guide.slug}` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/guides/${guide.slug}` }],
    };
  },
});

const TAG_COLOR: Record<GameTag, string> = {
  klondike: "#16a34a",
  spider:   "#7c3aed",
  freecell: "#0e7490",
  pyramid:  "#b45309",
  tripeaks: "#be185d",
  mahjong:  "#dc2626",
  general:  "#374151",
};

function GuidePage() {
  const { slug } = Route.useParams();
  const guide = GUIDES.find((g) => g.slug === slug);

  if (!guide) {
    return <Navigate to="/guides" />;
  }

  const gameInfo = GUIDE_GAMES.find((g) => g.tag === guide.game)!;
  const color = TAG_COLOR[guide.game];

  const related = GUIDES.filter(
    (g) => g.game === guide.game && g.slug !== guide.slug,
  ).slice(0, 3);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[900px] px-4 py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-xs text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link to="/" className="transition hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link to="/guides" className="transition hover:text-foreground">
          Guides
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{guide.title}</span>
      </nav>

      {/* Header */}
      <div className="mt-6">
        <Link
          to={gameInfo.path as "/"}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:opacity-80"
          style={{ background: `${color}22`, color }}
        >
          <span>{gameInfo.emoji}</span>
          {gameInfo.label}
        </Link>

        <h1
          className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {guide.title}
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {guide.intro}
        </p>
      </div>

      {/* Divider */}
      <div
        className="my-8 h-px w-full"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />

      {/* Body sections */}
      <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
        {guide.sections.map((section, i) => (
          <section key={i}>
            <h2
              className="mb-3 text-base font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {section.heading}
            </h2>
            <div className="space-y-3">
              {section.body.map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Play CTA */}
      <div
        className="glass mt-12 flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: `${color}44` }}
      >
        <div>
          <p className="text-sm font-semibold text-foreground">
            Ready to put these tips into practice?
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Play{" "}
            {gameInfo.label === "All Games"
              ? "free solitaire"
              : `free ${gameInfo.label} Solitaire`}{" "}
            instantly — no download, no sign-up.
          </p>
        </div>
        <Link
          to={gameInfo.path as "/"}
          className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          }}
        >
          Play {gameInfo.label === "All Games" ? "Now" : gameInfo.label} →
        </Link>
      </div>

      {/* Related guides */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2
            className="mb-4 text-base font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            More {gameInfo.label} guides
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((g) => (
              <Link
                key={g.slug}
                to="/guides/$slug"
                params={{ slug: g.slug }}
                className="glass group rounded-2xl p-4 transition-all hover:ring-1 hover:ring-[var(--neon)]"
              >
                <h3 className="text-sm font-semibold leading-snug text-foreground">
                  {g.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                  {g.description}
                </p>
                <span
                  className="mt-3 block text-xs font-medium"
                  style={{ color }}
                >
                  Read →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="mt-10 flex items-center justify-between">
        <Link
          to="/guides"
          className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
        >
          ← All guides
        </Link>
        <Link
          to="/guides"
          className="text-xs text-muted-foreground transition hover:text-foreground"
        >
          Browse all {GUIDES.length} guides →
        </Link>
      </div>

      <SiteFooter showBackLink />
    </main>
  );
}
