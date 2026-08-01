import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { GAMES } from "@/lib/games";
import { hasSave, SAVE_CHANGED_EVENT } from "@/lib/persist";

/** Returns a set of saveKeys that currently have a valid localStorage save. */
function useSaveStates(): Set<string> {
  const [saves, setSaves] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const refresh = () => {
      const s = new Set<string>();
      GAMES.forEach(g => { if (hasSave(g.saveKey)) s.add(g.saveKey); });
      setSaves(s);
    };
    refresh();
    window.addEventListener(SAVE_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const active = GAMES.find(g => g.to === pathname) ?? GAMES[0];
  const saves = useSaveStates();
  const activeInProgress = saves.has(active.saveKey);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
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
    <div ref={containerRef} className="relative">
      {/* ── Trigger ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150 select-none"
        style={{
          background: open
            ? "color-mix(in oklab, var(--neon) 20%, oklch(0.18 0.03 155))"
            : "color-mix(in oklab, var(--neon) 12%, oklch(0.18 0.03 155))",
          color: "var(--neon)",
          border: "1px solid color-mix(in oklab, var(--neon) 35%, transparent)",
          boxShadow: open ? "0 0 20px -6px var(--neon)" : "none",
        }}
      >
        {/* Current game identity */}
        <span className="text-xl leading-none">{active.emoji}</span>
        <span className="flex flex-col items-start leading-none">
          <span className="text-sm font-bold tracking-tight">{active.title}</span>
          <span
            className="text-[10px] font-normal mt-0.5"
            style={{ color: "color-mix(in oklab, var(--neon) 65%, white)" }}
          >
            {active.subtitle}
          </span>
        </span>
        {activeInProgress && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide uppercase shrink-0"
            style={{
              background: "color-mix(in srgb, var(--neon) 22%, transparent)",
              color: "var(--neon)",
              border: "1px solid color-mix(in srgb, var(--neon) 40%, transparent)",
            }}
          >
            In Progress
          </span>
        )}
        {/* Chevron */}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`shrink-0 ml-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M1.5 3.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── Dropdown panel ──────────────────────────────────────────── */}
      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-50 rounded-2xl overflow-hidden"
          style={{
            background: "color-mix(in oklab, var(--neon) 6%, oklch(0.15 0.03 155))",
            border: "1px solid color-mix(in oklab, var(--neon) 28%, transparent)",
            boxShadow: "0 24px 64px -8px rgba(0,0,0,0.8), 0 0 0 0 transparent",
            minWidth: "min(600px, 92vw)",
          }}
        >
          {/* Panel header */}
          <div
            className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{
              color: "color-mix(in oklab, var(--neon) 60%, white)",
              borderBottom: "1px solid color-mix(in oklab, var(--neon) 15%, transparent)",
            }}
          >
            Choose a game
          </div>

          {/* Game grid — 4 cols desktop, 3 cols mobile */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 p-3">
            {GAMES.map(g => {
              const isCurrent = g.to === pathname;
              const inProgress = saves.has(g.saveKey);
              return (
                <Link
                  key={g.to}
                  to={g.to}
                  onClick={() => setOpen(false)}
                  preload="intent"
                  role="option"
                  aria-selected={isCurrent}
                  className="flex flex-col items-center rounded-xl px-2 py-3 text-center transition-all duration-100 outline-none focus-visible:ring-2"
                  style={
                    isCurrent
                      ? {
                          background: "color-mix(in oklab, var(--neon) 18%, transparent)",
                          boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--neon) 45%, transparent), 0 0 20px -6px var(--neon)",
                        }
                      : { background: "rgba(255,255,255,0.03)" }
                  }
                  onMouseEnter={e => {
                    if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={e => {
                    if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  {/* Emoji */}
                  <span className="text-2xl leading-none">{g.emoji}</span>

                  {/* Title */}
                  <span
                    className="mt-1.5 text-[11px] font-bold leading-tight tracking-tight"
                    style={isCurrent ? { color: "var(--neon)" } : { color: "var(--foreground)" }}
                  >
                    {g.title}
                  </span>

                  {/* Subtitle */}
                  <span className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                    {g.subtitle}
                  </span>

                  {/* In-progress badge */}
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
  );
}
