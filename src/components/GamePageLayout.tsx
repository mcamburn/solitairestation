import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { GameSwitcher } from "./GameSwitcher";
import { SiteFooter } from "./SiteFooter";
import { SolitaireStationLogo } from "./SolitaireStationLogo";

export interface RuleItem {
  title: string;
  body: string;
}

interface Props {
  badge: string;
  title: string;
  tagline: string;
  rulesIntro: string;
  rules: RuleItem[];
  children: React.ReactNode;
}

export function GamePageLayout({ badge, title, tagline, rulesIntro, rules, children }: Props) {
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
    <main className="game-page-main min-h-screen w-full py-6 sm:py-10 xl:py-14">
      {/* Game switcher — sticky bar */}
      <div
        ref={navBarRef}
        className="game-nav-wrap sticky top-0 z-50 mb-4"
        style={{
          background: "color-mix(in oklab, var(--surface) 80%, transparent)",
          backdropFilter: "blur(16px) saturate(160%)",
          borderBottom: "1px solid color-mix(in oklab, white 8%, transparent)",
        }}
      >
        {/* On mobile the switcher is full-bleed; desktop is constrained + padded */}
        <div className="mx-auto max-w-[900px] xl:max-w-[1200px] md:px-4 md:py-2">
          {/* Desktop: logo left + switcher right */}
          <div className="hidden md:flex items-center gap-4">
            <SolitaireStationLogo variant="full" className="shrink-0" />
            <div className="w-px self-stretch" style={{ background: "color-mix(in oklab, white 10%, transparent)" }} />
            <div className="flex-1">
              <GameSwitcher />
            </div>
          </div>
          {/* Mobile: switcher only (logo shows in hero) */}
          <div className="md:hidden">
            <GameSwitcher />
          </div>
        </div>
      </div>

      {/* Header — hidden in phone landscape via .game-hero CSS rule */}
      <header className="game-hero mx-auto mb-8 xl:mb-12 max-w-[900px] xl:max-w-[1200px] px-4 text-center">
        {/* Mobile: show full logo lockup; desktop: show slim badge (logo already in nav) */}
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

      {/* Game */}
      <section id="game-board" style={{ scrollMarginTop: "var(--sticky-nav-height)" }}>
        {children}
      </section>

      {/* Rules */}
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

      {/* Footer */}
      <div className="mx-auto max-w-[900px] xl:max-w-[1200px] px-4">
        <SiteFooter />
      </div>
    </main>
  );
}
