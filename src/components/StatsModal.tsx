/**
 * StatsModal
 *
 * Full stats overlay for a single game. Shows wins/losses, streaks, best/avg
 * time and moves, and a scrollable game history log.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { loadStats, getWinRate, formatStatTime, type GameStats, type GameRecord } from "@/lib/stats";
import { loadDailyStats } from "@/lib/daily";

interface Props {
  gameKey: string;
  gameTitle: string;
  gameEmoji: string;
  open: boolean;
  onClose: () => void;
  dailyStreak?: number;
}

export function StatsModal({ gameKey, gameTitle, gameEmoji, open, onClose, dailyStreak = 0 }: Props) {
  const [stats, setStats] = useState<GameStats>(() => loadStats(gameKey));
  const backdropRef = useRef<HTMLDivElement>(null);

  // Refresh when stats are updated externally
  useEffect(() => {
    if (!open) return;
    setStats(loadStats(gameKey));

    const handler = (e: Event) => {
      const key = (e as CustomEvent<{ gameKey: string }>).detail?.gameKey;
      if (key === gameKey) setStats(loadStats(gameKey));
    };
    window.addEventListener("neon-solitaire:stats-updated", handler);
    return () => window.removeEventListener("neon-solitaire:stats-updated", handler);
  }, [open, gameKey]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  // Guard SSR and hydration — createPortal requires a live document.body
  if (typeof document === "undefined" || !document.body) return null;

  const winRate = getWinRate(stats);
  const dailyStats = loadDailyStats(gameKey);

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: "oklch(0.15 0.04 155)",
          border: "1px solid color-mix(in oklab, var(--neon) 30%, transparent)",
          boxShadow: "0 0 60px -10px var(--neon)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid color-mix(in oklab, var(--neon) 15%, transparent)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{gameEmoji}</span>
            <div>
              <h2
                className="text-base font-bold leading-tight"
                style={{ color: "var(--neon)", fontFamily: "var(--font-display)" }}
              >
                {gameTitle}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "color-mix(in oklab, var(--neon) 50%, white)" }}>
                Lifetime statistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:opacity-80"
            style={{ color: "color-mix(in oklab, var(--neon) 60%, white)" }}
            aria-label="Close stats"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Primary stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Win Rate" value={stats.gamesPlayed > 0 ? `${winRate}%` : "—"} />
            <StatCard label="Wins" value={String(stats.wins)} />
            <StatCard label="Losses" value={String(stats.losses)} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Streak" value={String(stats.currentStreak)} highlight />
            <StatCard label="Best Streak" value={String(stats.longestStreak)} />
            <StatCard label="Played" value={String(stats.gamesPlayed)} />
          </div>

          {/* Time & moves */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Best Time" value={stats.bestTime !== null ? formatStatTime(stats.bestTime) : "—"} />
            <StatCard label="Avg Time" value={stats.avgTime !== null ? formatStatTime(stats.avgTime) : "—"} />
            <StatCard label="Best Moves" value={stats.bestMoves !== null ? String(stats.bestMoves) : "—"} />
            <StatCard label="Avg Moves" value={stats.avgMoves !== null ? String(stats.avgMoves) : "—"} />
          </div>

          {/* Best Run — only shown for games that track it (e.g. Pyramid) */}
          {stats.bestRun > 0 && (
            <div className="grid grid-cols-1 gap-2">
              <StatCard label="Best Run" value={String(stats.bestRun)} highlight />
            </div>
          )}

          {/* Daily challenge */}
          {(dailyStats.streak > 0 || dailyStats.longestStreak > 0) && (
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: "color-mix(in oklab, var(--neon) 8%, transparent)",
                border: "1px solid color-mix(in oklab, var(--neon) 20%, transparent)",
              }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: "color-mix(in oklab, var(--neon) 55%, white)" }}>
                📅 Daily Challenge
              </p>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Daily Streak" value={String(dailyStats.streak)} highlight />
                <StatCard label="Best Daily Streak" value={String(dailyStats.longestStreak)} />
              </div>
            </div>
          )}

          {/* History */}
          {stats.history.length > 0 && (
            <div>
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: "color-mix(in oklab, var(--neon) 55%, white)" }}
              >
                Recent games
              </p>
              <div className="space-y-1">
                {stats.history.map((record, i) => (
                  <HistoryRow key={i} record={record} />
                ))}
              </div>
            </div>
          )}

          {stats.gamesPlayed === 0 && (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🃏</p>
              <p className="text-sm" style={{ color: "color-mix(in oklab, var(--neon) 45%, white)" }}>
                No games played yet. Play a game to see your stats!
              </p>
            </div>
          )}

          {/* Link to the all-games stats page */}
          <div className="flex justify-center pt-1 pb-1">
            <a
              href={`/stats?from=${encodeURIComponent(gameKey)}`}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
              style={{ color: "color-mix(in oklab, var(--neon) 55%, white)" }}
            >
              View all games
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5 flex flex-col items-center gap-0.5"
      style={{
        background: highlight
          ? "color-mix(in oklab, var(--neon) 14%, transparent)"
          : "color-mix(in oklab, var(--neon) 6%, transparent)",
        border: `1px solid color-mix(in oklab, var(--neon) ${highlight ? "30" : "14"}%, transparent)`,
      }}
    >
      <span
        className="text-lg font-bold tabular-nums leading-tight"
        style={{ color: highlight ? "var(--neon)" : "color-mix(in oklab, var(--neon) 85%, white)" }}
      >
        {value}
      </span>
      <span
        className="text-[10px] font-medium uppercase tracking-wide"
        style={{ color: "color-mix(in oklab, var(--neon) 45%, white)" }}
      >
        {label}
      </span>
    </div>
  );
}

function HistoryRow({ record }: { record: GameRecord }) {
  const date = new Date(record.date);
  const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timeStr = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <div
      className="flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs"
      style={{
        background: "color-mix(in oklab, var(--neon) 4%, transparent)",
        border: "1px solid color-mix(in oklab, var(--neon) 10%, transparent)",
      }}
    >
      <span className="shrink-0">{record.won ? "✅" : "❌"}</span>
      <span style={{ color: record.won ? "var(--neon)" : "color-mix(in oklab, white 40%, var(--neon))" }} className="font-semibold shrink-0">
        {record.won ? "Win" : "Loss"}
      </span>
      {record.isDaily && (
        <span className="text-[10px] rounded px-1 py-0.5 shrink-0"
          style={{ background: "color-mix(in oklab, var(--neon) 18%, transparent)", color: "var(--neon)" }}>
          Daily
        </span>
      )}
      <span className="flex-1" />
      {record.moves > 0 && (
        <span style={{ color: "color-mix(in oklab, var(--neon) 55%, white)" }}>
          {record.moves}mv
        </span>
      )}
      {record.won && record.durationSeconds > 0 && (
        <span style={{ color: "color-mix(in oklab, var(--neon) 55%, white)" }}>
          {formatStatTime(record.durationSeconds)}
        </span>
      )}
      <span style={{ color: "color-mix(in oklab, var(--neon) 35%, white)" }}>
        {dateStr} {timeStr}
      </span>
    </div>
  );
}
