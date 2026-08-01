import { createFileRoute, Link } from "@tanstack/react-router";
import { GAMES } from "@/lib/games";
import { SITE_URL } from "@/lib/site";

const TITLE = "Solitaire Station — Play 16 Free Online Solitaire Games";
const DESC =
  "Play 16 free solitaire games online — Klondike, Spider, FreeCell, Pyramid, Mahjong, TriPeaks, Golf, Forty Thieves, Yukon, and more. No download, no sign-up.";

export const Route = createFileRoute("/")({
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
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6"
        style={{
          height: "var(--sticky-nav-height)",
          background: "color-mix(in oklab, var(--background) 90%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          className="font-display text-xl font-bold tracking-tight"
          style={{ color: "var(--neon)" }}
        >
          Solitaire Station
        </span>

        <Link
          to="/klondike"
          className="rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
          style={{
            background: "color-mix(in oklab, var(--neon) 15%, transparent)",
            color: "var(--neon)",
            border: "1px solid color-mix(in oklab, var(--neon) 35%, transparent)",
          }}
        >
          Play now
        </Link>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 pb-8 pt-12 text-center sm:px-6 sm:pt-16">
        <p
          className="mb-3 text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: "color-mix(in oklab, var(--neon) 70%, white)" }}
        >
          16 free card games
        </p>
        <h1
          className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
          style={{ color: "var(--foreground)" }}
        >
          Solitaire Station
        </h1>
        <p
          className="mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg"
          style={{ color: "var(--muted-foreground)" }}
        >
          Classic card games — no download, no sign-up. Pick a game and play instantly.
        </p>
      </section>

      {/* ── Game grid ────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {GAMES.map((game) => (
            <Link
              key={game.to}
              to={game.to}
              preload="intent"
              className="group flex flex-col items-center rounded-2xl px-3 py-5 text-center outline-none transition-all duration-150 focus-visible:ring-2"
              style={{
                background: "color-mix(in oklab, var(--neon) 6%, oklch(0.18 0.03 155))",
                border: "1px solid color-mix(in oklab, var(--neon) 16%, transparent)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "color-mix(in oklab, var(--neon) 14%, oklch(0.18 0.03 155))";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "color-mix(in oklab, var(--neon) 40%, transparent)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 24px -8px var(--neon)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "color-mix(in oklab, var(--neon) 6%, oklch(0.18 0.03 155))";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "color-mix(in oklab, var(--neon) 16%, transparent)";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              {/* Emoji */}
              <span className="text-4xl leading-none">{game.emoji}</span>

              {/* Title */}
              <span
                className="mt-3 text-sm font-bold leading-tight tracking-tight"
                style={{ color: "var(--foreground)" }}
              >
                {game.title}
              </span>

              {/* Subtitle */}
              <span
                className="mt-1 text-xs leading-tight"
                style={{ color: "var(--muted-foreground)" }}
              >
                {game.subtitle}
              </span>

              {/* Play arrow */}
              <span
                className="mt-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                style={{
                  background: "color-mix(in oklab, var(--neon) 20%, transparent)",
                  color: "var(--neon)",
                  border: "1px solid color-mix(in oklab, var(--neon) 40%, transparent)",
                }}
              >
                Play
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M2 1.5l4 2.5-4 2.5V1.5z" fill="currentColor" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        className="border-t px-4 py-6 text-center text-xs sm:px-6"
        style={{ color: "var(--muted-foreground)" }}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} Solitaire Station</p>
      </footer>
    </div>
  );
}
