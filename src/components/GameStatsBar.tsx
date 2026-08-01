/**
 * GameStatsBar
 *
 * Renders the win streak pill (click → StatsModal) and the Daily Challenge
 * button (click → DailyChallengeModal) inside the game nav bar.
 *
 * variant="bar"    — standalone bar with neon background (original)
 * variant="inline" — bare flex items, designed to sit inside an existing nav bar
 *
 * Subscribes to "neon-solitaire:stats-updated" events so it refreshes
 * automatically after each game without prop drilling.
 */

import { useEffect, useState } from "react";
import { loadStats, getWinRate, type GameStats } from "@/lib/stats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import { StatsModal } from "./StatsModal";
import { DailyChallengeModal } from "./DailyChallengeModal";
import { GAMES } from "@/lib/games";

interface Props {
  gameKey: string;
  variant?: "bar" | "inline";
}

export function GameStatsBar({ gameKey, variant = "bar" }: Props) {
  const [stats, setStats] = useState<GameStats>(() => loadStats(gameKey));
  const [statsOpen, setStatsOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);

  const { activateDaily, completedToday, dailyStreak, longestDailyStreak } = useDailyChallenge();

  // Refresh stats whenever a game records a win/loss
  useEffect(() => {
    const handler = (e: Event) => {
      const key = (e as CustomEvent<{ gameKey: string }>).detail?.gameKey;
      if (key === gameKey) setStats(loadStats(gameKey));
    };
    window.addEventListener("neon-solitaire:stats-updated", handler);
    return () => window.removeEventListener("neon-solitaire:stats-updated", handler);
  }, [gameKey]);

  useEffect(() => {
    setStats(loadStats(gameKey));
  }, [gameKey]);

  const streak = stats.currentStreak;

  const game = GAMES.find((g) => g.saveKey === gameKey);
  const gameTitle = game?.title ?? gameKey;
  const gameEmoji = game?.emoji ?? "🃏";

  const items = (
    <>
      {/* Streak pill — click opens StatsModal */}
      <button
        onClick={() => setStatsOpen(true)}
        className="flex items-center gap-1 rounded-lg px-2 py-1 shrink-0 transition-all hover:opacity-80 active:scale-95"
        style={{
          background: "color-mix(in oklab, var(--neon) 10%, transparent)",
          border: "1px solid color-mix(in oklab, var(--neon) 22%, transparent)",
        }}
        title="View full statistics"
      >
        <span className="text-sm leading-none">🔥</span>
        <span
          className="text-xs font-bold tabular-nums"
          style={{ color: streak > 0 ? "var(--neon)" : "color-mix(in oklab, var(--neon) 45%, white)" }}
        >
          {streak}
        </span>
        <span
          className="text-xs hidden sm:inline"
          style={{ color: "color-mix(in oklab, var(--neon) 45%, white)" }}
        >
          streak
        </span>
      </button>

      <NavDivider />

      {/* Daily challenge — click opens DailyChallengeModal */}
      {completedToday ? (
        <button
          onClick={() => setDailyOpen(true)}
          className="flex items-center gap-1 shrink-0 rounded-lg px-2 py-1 transition-all hover:opacity-80 active:scale-95"
          style={{
            background: "color-mix(in oklab, var(--neon) 8%, transparent)",
            border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
          }}
          title="Daily challenge complete — view details"
        >
          <span className="text-xs">✅</span>
          <span
            className="text-xs font-medium hidden sm:inline"
            style={{ color: "color-mix(in oklab, var(--neon) 55%, white)" }}
          >
            Daily done
            {dailyStreak > 1 && (
              <span className="ml-1 opacity-70">· {dailyStreak}d</span>
            )}
          </span>
        </button>
      ) : (
        <button
          onClick={() => setDailyOpen(true)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-all hover:opacity-90 active:scale-95 shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--neon), var(--neon-2))",
            color: "oklch(0.14 0.04 155)",
          }}
          title="Play today's daily challenge — same deal for every player"
        >
          <span>📅</span>
          <span>Daily Challenge</span>
        </button>
      )}
    </>
  );

  return (
    <>
      {variant === "bar" ? (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3 flex-wrap"
          style={{
            background: "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
            border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
          }}
        >
          {items}
          <div className="flex-1" />
        </div>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          {items}
        </div>
      )}

      <StatsModal
        gameKey={gameKey}
        gameTitle={gameTitle}
        gameEmoji={gameEmoji}
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        dailyStreak={dailyStreak}
      />

      <DailyChallengeModal
        open={dailyOpen}
        onClose={() => setDailyOpen(false)}
        onStart={() => { activateDaily(); }}
        gameEmoji={gameEmoji}
        gameTitle={gameTitle}
        completedToday={completedToday}
        dailyStreak={dailyStreak}
        longestDailyStreak={longestDailyStreak}
      />
    </>
  );
}

function NavDivider() {
  return (
    <div
      className="self-stretch w-px shrink-0"
      style={{ background: "color-mix(in oklab, var(--neon) 20%, transparent)" }}
    />
  );
}
