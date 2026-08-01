import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { GAMES } from "@/lib/games";
import { hasSave, SAVE_CHANGED_EVENT } from "@/lib/persist";

/** Returns a set of saveKeys that currently have a valid localStorage save.
 *  Initialises to empty so the server render matches the pre-hydration client
 *  render, then populates from localStorage after mount. */
function useSaveStates(): Set<string> {
  const [saves, setSaves] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const refresh = () => {
      const s = new Set<string>();
      GAMES.forEach(g => { if (hasSave(g.saveKey)) s.add(g.saveKey); });
      setSaves(s);
    };
    refresh(); // populate immediately after mount
    // SAVE_CHANGED_EVENT fires in the same tab whenever saveGame/clearGame runs.
    window.addEventListener(SAVE_CHANGED_EVENT, refresh);
    // "storage" fires in OTHER tabs when localStorage changes.
    window.addEventListener("storage", refresh);
    // Refresh when the tab becomes visible after being hidden.
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener(SAVE_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return saves;
}

export function GameSwitcher() {
  const [open, setOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const active = GAMES.find(g => g.to === pathname) ?? GAMES[0];
  const saves = useSaveStates();

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          DESKTOP (md+): compact single-line pill nav
          ───────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Switch game"
        className="hidden md:flex items-center justify-center gap-1 glass rounded-xl px-1.5 py-1.5 overflow-x-auto"
      >
        {GAMES.map(g => {
          const isCurrent = g.to === pathname;
          const inProgress = saves.has(g.saveKey);
          return (
            <Link
              key={g.to}
              to={g.to}
              preload="intent"
              className="relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold leading-none transition-all duration-150 select-none whitespace-nowrap"
              style={
                isCurrent
                  ? {
                      background: "color-mix(in srgb, var(--neon) 18%, transparent)",
                      color: "var(--neon)",
                      boxShadow: "0 0 16px -6px var(--neon), inset 0 0 0 1px color-mix(in srgb, var(--neon) 35%, transparent)",
                    }
                  : { color: "rgba(255,255,255,0.45)" }
              }
              onMouseEnter={e => {
                if (!isCurrent) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                }
              }}
              onMouseLeave={e => {
                if (!isCurrent) {
                  (e.currentTarget as HTMLElement).style.background = "";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                }
              }}
            >
              <span className="text-sm leading-none">{g.emoji}</span>
              <span className="tracking-tight">{g.title}</span>
              {inProgress && (
                <>
                  {/* Dot indicator at md–lg (saves space when nav is tight) */}
                  <span
                    className="lg:hidden h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: "var(--neon)", boxShadow: "0 0 6px var(--neon)" }}
                    aria-label="In progress"
                  />
                  {/* Full badge at lg+ */}
                  <span
                    className="hidden lg:inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide uppercase"
                    style={{
                      background: "color-mix(in srgb, var(--neon) 22%, transparent)",
                      color: "var(--neon)",
                      border: "1px solid color-mix(in srgb, var(--neon) 40%, transparent)",
                    }}
                  >
                    In Progress
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE: full-width trigger + full-bleed dropdown grid
          ───────────────────────────────────────────────────────────── */}
      <div ref={mobileRef} className="relative w-full md:hidden">
        {/* Trigger — spans the full nav width */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-haspopup="true"
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold transition-colors"
          style={{
            background: open
              ? "color-mix(in oklab, var(--neon) 16%, oklch(0.18 0.03 250))"
              : "color-mix(in oklab, var(--neon) 10%, oklch(0.18 0.03 250))",
            borderBottom: "1px solid color-mix(in oklab, var(--neon) 35%, transparent)",
            color: "var(--neon)",
          }}
        >
          <span className="flex items-center gap-2.5">
            <span className="text-xl leading-none">{active.emoji}</span>
            <span className="tracking-tight">{active.title}</span>
            <span
              className="text-[11px] font-normal"
              style={{ color: "color-mix(in oklab, var(--neon) 60%, white)" }}
            >
              {active.subtitle}
            </span>
          </span>
          <svg
            width="11" height="11" viewBox="0 0 11 11" fill="none"
            className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M1.5 3.5l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Full-bleed panel — 3-column game grid */}
        {open && (
          <div
            className="absolute left-0 right-0 top-full z-50"
            style={{
              background: "color-mix(in oklab, var(--neon) 7%, oklch(0.17 0.03 250))",
              borderBottom: "1px solid color-mix(in oklab, var(--neon) 28%, transparent)",
              boxShadow: "0 16px 48px -4px rgba(0,0,0,0.7), 0 0 0 0 transparent",
            }}
          >
            <div className="grid grid-cols-3 gap-px p-3 pb-4">
              {GAMES.map(g => {
                const isCurrent = g.to === pathname;
                const inProgress = saves.has(g.saveKey);
                return (
                  <Link
                    key={g.to}
                    to={g.to}
                    onClick={() => setOpen(false)}
                    preload="intent"
                    className="flex flex-col items-center rounded-xl px-2 py-3 text-center transition-colors"
                    style={
                      isCurrent
                        ? {
                            background: "color-mix(in oklab, var(--neon) 18%, transparent)",
                            boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--neon) 45%, transparent), 0 0 18px -6px var(--neon)",
                          }
                        : { background: "rgba(255,255,255,0.04)" }
                    }
                    onMouseEnter={e => {
                      if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)";
                    }}
                    onMouseLeave={e => {
                      if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                  >
                    <span className="text-2xl leading-none">{g.emoji}</span>
                    <span
                      className="mt-1.5 text-[11px] font-bold leading-tight tracking-tight"
                      style={isCurrent ? { color: "var(--neon)" } : { color: "rgba(255,255,255,0.8)" }}
                    >
                      {g.title}
                    </span>
                    <span className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                      {g.subtitle}
                    </span>
                    {inProgress && (
                      <span
                        className="mt-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide uppercase"
                        style={{
                          background: "color-mix(in oklab, var(--neon) 22%, transparent)",
                          color: "var(--neon)",
                          border: "1px solid color-mix(in oklab, var(--neon) 40%, transparent)",
                        }}
                      >
                        In Progress
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
