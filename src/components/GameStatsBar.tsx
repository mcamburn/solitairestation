/**
 * GameStatsBar
 *
 * Renders live streak + win rate for the current game, a Daily Challenge
 * button, and a Stats button that opens the full StatsModal.
 *
 * variant="bar"    — standalone bar with neon background (original)
 * variant="inline" — bare flex items, no wrapper, designed to sit inside
 *                    an existing nav bar row
 *
 * Subscribes to "neon-solitaire:stats-updated" events so it refreshes
 * automatically after each game without prop drilling.
 */

import { useEffect, useRef, useState } from "react";
import { loadStats, getWinRate, type GameStats } from "@/lib/stats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import { StatsModal } from "./StatsModal";
import { GAMES } from "@/lib/games";

interface Props {
  gameKey: string;
  variant?: "bar" | "inline";
}

export function GameStatsBar({ gameKey, variant = "bar" }: Props) {
  const [stats, setStats] = useState<GameStats>(() => loadStats(gameKey));
  const [modalOpen, setModalOpen] = useState(false);
  const [justActivated, setJustActivated] = useState(false);
  const activatedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { activateDaily, completedToday, dailyStreak } = useDailyChallenge();

  const handleActivateDaily = () => {
    activateDaily();
    setJustActivated(true);
    if (activatedTimerRef.current) clearTimeout(activatedTimerRef.current);
    activatedTimerRef.current = setTimeout(() => setJustActivated(false), 2500);
  };

  useEffect(() => () => {
    if (activatedTimerRef.current) clearTimeout(activatedTimerRef.current);
  }, []);

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

  const winRate = getWinRate(stats);
  const streak = stats.currentStreak;
  const hasPlayed = stats.gamesPlayed > 0;

  const game = GAMES.find((g) => g.saveKey === gameKey);
  const gameTitle = game?.title ?? gameKey;
  const gameEmoji = game?.emoji ?? "🃏";

  const items = (
    <>
      {/* Streak — click to open stats modal */}
      <button
        onClick={() => setModalOpen(true)}
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

      {/* Daily challenge */}
      {completedToday ? (
        <div className="flex items-center gap-1 shrink-0">
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
        </div>
      ) : justActivated ? (
        <div
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold shrink-0"
          style={{
            background: "color-mix(in oklab, var(--neon) 18%, transparent)",
            color: "var(--neon)",
            border: "1px solid color-mix(in oklab, var(--neon) 40%, transparent)",
          }}
        >
          <span>📅</span>
          <span>Daily Challenge active!</span>
        </div>
      ) : (
        <button
          onClick={handleActivateDaily}
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
          {/* Spacer pushes daily+stats to the right */}
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        dailyStreak={dailyStreak}
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
