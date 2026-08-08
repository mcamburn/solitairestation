import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GameSwitcher } from "./GameSwitcher";
import { SiteFooter } from "./SiteFooter";
import { SolitaireStationLogo } from "./SolitaireStationLogo";
import { GameStatsBar } from "./GameStatsBar";
import { DailyChallengeProvider } from "@/contexts/DailyChallengeContext";
import { GUIDES, type GameTag } from "@/lib/guides";

// Some game route keys differ from the guide GameTag values
const GAME_KEY_TO_TAG: Record<string, GameTag> = {
  "forty-thieves":  "fortythieves",
  "eight-off":      "eightoff",
  "bakers-dozen":   "bakersdozen",
  "bakers-game":    "bakersgame",
  "double-klondike": "klondike",
};

// ── Variant pages that should receive internal links from each game ──────────
const GAME_VARIANTS: Record<string, Array<{ href: string; label: string; tagline: string }>> = {
  klondike: [
    { href: "/klondike-solitaire", label: "Klondike Solitaire", tagline: "Classic rules guide & win rates" },
    { href: "/turn-1-solitaire",   label: "Turn 1 (Draw 1)",    tagline: "Easiest — flip one card at a time" },
    { href: "/turn-3-solitaire",   label: "Turn 3 (Draw 3)",    tagline: "Harder — flip three cards at a time" },
    { href: "/vegas-solitaire",    label: "Vegas Scoring",      tagline: "Casino-style wager and payout" },
    { href: "/double-klondike",    label: "Double Klondike",    tagline: "Two decks, 9 columns, 8 foundations" },
  ],
  spider: [
    { href: "/spider-solitaire",         label: "Spider Solitaire",   tagline: "Classic rules & strategy guide" },
    { href: "/1-suit-spider-solitaire",  label: "1 Suit (Easy)",      tagline: "All spades — ideal for beginners" },
    { href: "/2-suit-spider-solitaire",  label: "2 Suit (Medium)",    tagline: "Spades and hearts — middle ground" },
    { href: "/4-suit-spider-solitaire",  label: "4 Suit (Expert)",    tagline: "All four suits — maximum difficulty" },
  ],
  freecell: [
    { href: "/freecell-solitaire", label: "FreeCell Solitaire", tagline: "Rules, strategy & solvability guide" },
  ],
};

function GameVariants({ gameKey }: { gameKey: string }) {
  const variants = GAME_VARIANTS[gameKey];
  if (!variants?.length) return null;
  return (
    <section className="mx-auto mt-6 sm:mt-10 max-w-[900px] xl:max-w-[1200px] px-4">
      <div className="glass rounded-2xl p-6 sm:p-8">
        <h2
          className="mb-5 text-xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Variants &amp; modes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {variants.map((v) => (
            <Link
              key={v.href}
              to={v.href as "/klondike-solitaire"}
              className="group flex flex-col gap-1 rounded-xl border border-border/40 bg-surface/40 p-4 transition hover:border-border hover:bg-surface/70"
            >
              <span className="text-sm font-semibold leading-snug text-foreground group-hover:underline">
                {v.label}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {v.tagline}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function GameGuides({ gameKey }: { gameKey: string }) {
  const tag = (GAME_KEY_TO_TAG[gameKey] ?? gameKey) as GameTag;
  const guides = GUIDES.filter((g) => g.game === tag).slice(0, 4);
  if (guides.length === 0) return null;
  return (
    <section className="mx-auto mt-6 sm:mt-10 max-w-[900px] xl:max-w-[1200px] px-4">
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Strategy guides
          </h2>
          <Link
            to="/guides"
            className="text-xs font-medium transition hover:underline"
            style={{ color: "var(--neon)" }}
          >
            All guides →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {guides.map((g) => (
            <Link
              key={g.slug}
              to="/guides/$slug"
              params={{ slug: g.slug }}
              className="group flex flex-col gap-1 rounded-xl border border-border/40 bg-surface/40 p-4 transition hover:border-border hover:bg-surface/70"
            >
              <span className="text-sm font-semibold leading-snug text-foreground group-hover:underline">
                {g.title}
              </span>
              <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {g.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface RuleItem {
  title: string;
  body: string;
  demo?: React.ReactNode;
}

interface Props {
  gameKey: string;
  badge: string;
  title: string;
  tagline: string;
  rulesIntro: string;
  rules: RuleItem[];
  children: React.ReactNode;
}

const VERT_DIVIDER = (
  <div
    className="self-stretch w-px shrink-0"
    style={{ background: "color-mix(in oklab, white 10%, transparent)" }}
  />
);

export function GamePageLayout({ gameKey, badge, title, tagline, rulesIntro, rules, children }: Props) {
  const navBarRef = useRef<HTMLDivElement>(null);

  // Mobile-only: hide the in-game control bars (timer + appearance) to maximise board space
  const [toolbarsHidden, setToolbarsHidden] = useState(() => {
    try { return localStorage.getItem("toolbars-hidden") === "1"; } catch { return false; }
  });
  const toggleToolbars = () => {
    setToolbarsHidden(h => {
      const next = !h;
      try { localStorage.setItem("toolbars-hidden", next ? "1" : "0"); } catch {}
      return next;
    });
  };

  // Suppress bar slide transitions on initial mount so switching games doesn't
  // produce a blip. Transitions are only enabled after the first painted frame.
  const [barAnimReady, setBarAnimReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setBarAnimReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const el = navBarRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.borderBoxSize?.[0]?.blockSize ?? entries[0]?.contentRect.height;
      if (height != null) {
        document.documentElement.style.setProperty("--sticky-nav-height", `${height}px`);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <DailyChallengeProvider gameKey={gameKey}>
      <main className="game-page-main min-h-screen w-full py-6 sm:py-10 xl:py-14">

        {/* ── Sticky nav bar ─────────────────────────────────────────────── */}
        <div
          ref={navBarRef}
          className={`game-nav-wrap sticky top-0 z-50 mb-4${toolbarsHidden ? " bars-hidden" : ""}`}
          style={{
            background: "color-mix(in oklab, var(--surface) 80%, transparent)",
            backdropFilter: "blur(16px) saturate(160%)",
            borderBottom: "1px solid color-mix(in oklab, white 8%, transparent)",
          }}
        >
          <div className="relative mx-auto max-w-[900px] xl:max-w-[1200px] md:px-4 md:py-2">

            {/* Desktop: Logo left — stats absolutely centered — GameSwitcher right */}
            <div className="hidden md:flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <SolitaireStationLogo variant="full" className="shrink-0" />
                {VERT_DIVIDER}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
                <GameStatsBar gameKey={gameKey} variant="inline" />
              </div>
              <div className="flex items-center gap-3">
                {VERT_DIVIDER}
                <div className="w-72 shrink-0">
                  <GameSwitcher />
                </div>
              </div>
            </div>

            {/* Mobile: [logo left | stats right] then [GameSwitcher] then [hide controls toggle] */}
            <div className="md:hidden flex flex-col gap-1 py-1">
              <div className="flex items-center justify-between gap-2 px-2 pt-1">
                <SolitaireStationLogo variant="full" className="shrink-0" />
                <GameStatsBar gameKey={gameKey} variant="inline" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <GameSwitcher />
                </div>
                <button
                  onClick={toggleToolbars}
                  aria-label={toolbarsHidden ? "Show controls" : "Hide controls"}
                  className="sm:hidden shrink-0 flex items-center gap-1 rounded-full border border-border/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground mr-2"
                  style={{ background: "color-mix(in oklab, white 5%, transparent)" }}
                >
                  <span>{toolbarsHidden ? "▾" : "▴"}</span>
                  <span className="whitespace-nowrap">{toolbarsHidden ? "show bars" : "hide bars"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Hero (desktop only) ─────────────────────────────────────────── */}
        <header className="game-hero hidden md:block mx-auto mb-6 xl:mb-10 max-w-[900px] xl:max-w-[1200px] px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--neon)", boxShadow: "0 0 8px var(--neon)" }}
            />
            {badge}
          </div>
          <h1
            className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{tagline}</p>
        </header>

        {/* ── Game board ─────────────────────────────────────────────────── */}
        <section
          id="game-board"
          className={`sm:mx-auto sm:max-w-[900px] xl:max-w-[1200px]${barAnimReady ? " bars-anim-ready" : ""}${toolbarsHidden ? " toolbars-collapsed" : ""}`}
          style={{ scrollMarginTop: "var(--sticky-nav-height)" }}
        >
          {children}

          {/* ── Scroll-to-instructions link (mobile only) ────────────────── */}
          <div className="md:hidden mt-3 px-4 text-center">
            <a
              href="#how-to-play"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("how-to-play")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs hover:underline"
              style={{ color: "var(--neon)" }}
            >
              ↓ Game instructions
            </a>
          </div>
        </section>

        {/* ── Rules ──────────────────────────────────────────────────────── */}
        <section
          id="how-to-play"
          className="mx-auto mt-6 sm:mt-12 max-w-[900px] xl:max-w-[1200px] px-4"
          style={{ scrollMarginTop: "var(--sticky-nav-height)" }}
        >
          <div className="glass rounded-2xl p-6 sm:p-8">
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How to play
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{rulesIntro}</p>
            <div className="mt-6 grid gap-6">
              {rules.map((r, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold tracking-tight">{r.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                  {r.demo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Variants & modes ───────────────────────────────────────────── */}
        <GameVariants gameKey={gameKey} />

        {/* ── Strategy guides ────────────────────────────────────────────── */}
        <GameGuides gameKey={gameKey} />

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-[900px] xl:max-w-[1200px] px-4">
          <SiteFooter />
        </div>

      </main>
    </DailyChallengeProvider>
  );
}
