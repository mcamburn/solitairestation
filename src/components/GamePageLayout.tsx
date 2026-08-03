import { useEffect, useRef } from "react";
import { GameSwitcher } from "./GameSwitcher";
import { SiteFooter } from "./SiteFooter";
import { SolitaireStationLogo } from "./SolitaireStationLogo";
import { GameStatsBar } from "./GameStatsBar";
import { DailyChallengeProvider } from "@/contexts/DailyChallengeContext";

export interface RuleItem {
  title: string;
  body: string;
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
          className="game-nav-wrap sticky top-0 z-50 mb-4"
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

            {/* Mobile: [stats centered] then [GameSwitcher] */}
            <div className="md:hidden flex flex-col gap-1 py-1">
              <div className="flex items-center justify-center gap-2 px-2 pt-1">
                <GameStatsBar gameKey={gameKey} variant="inline" />
              </div>
              <GameSwitcher />
            </div>

          </div>
        </div>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <header className="game-hero mx-auto mb-6 xl:mb-10 max-w-[900px] xl:max-w-[1200px] px-4 text-center">
          <div className="md:hidden flex justify-center mb-4">
            <SolitaireStationLogo variant="full" />
          </div>
          <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur">
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
          className="sm:mx-auto sm:max-w-[900px] xl:max-w-[1200px]"
          style={{ scrollMarginTop: "var(--sticky-nav-height)" }}
        >
          {children}
        </section>

        {/* ── Rules ──────────────────────────────────────────────────────── */}
        <section
          id="how-to-play"
          className="mx-auto mt-12 max-w-[900px] xl:max-w-[1200px] px-4"
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
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {rules.map((r, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold tracking-tight">{r.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-[900px] xl:max-w-[1200px] px-4">
          <SiteFooter />
        </div>

      </main>
    </DailyChallengeProvider>
  );
}
