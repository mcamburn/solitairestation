/**
 * GameStatsBar
 *
 * A compact bar rendered by GamePageLayout between the hero and the game board.
 * Shows live streak + win rate for the current game, a Daily Challenge button,
 * and a Stats button that opens the full StatsModal.
 *
 * Subscribes to "neon-solitaire:stats-updated" events so it refreshes
 * automatically after each game without props drilling.
 */

import { useEffect, useState } from "react";
import { loadStats, getWinRate, type GameStats } from "@/lib/stats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import { StatsModal } from "./StatsModal";
import { GAMES } from "@/lib/games";

interface Props {
  gameKey: string;
}

export function GameStatsBar({ gameKey }: Props) {
  const [stats, setStats] = useState<GameStats>(() => loadStats(gameKey));
  const [modalOpen, setModalOpen] = useState(false);
  const { activateDaily, completedToday, dailyStreak } = useDailyChallenge();

  // Refresh stats whenever a game records a win/loss
  useEffect(() => {
    const handler = (e: Event) => {
      const key = (e as CustomEvent<{ gameKey: string }>).detail?.gameKey;
      if (key === gameKey) setStats(loadStats(gameKey));
    };
    window.addEventListener("neon-solitaire:stats-updated", handler);
    return () => window.removeEventListener("neon-solitaire:stats-updated", handler);
  }, [gameKey]);

  // Also refresh daily state
  useEffect(() => {
    setStats(loadStats(gameKey));
  }, [gameKey]);

  const winRate = getWinRate(stats);
  const streak = stats.currentStreak;

  // Find game title for modal
  const game = GAMES.find((g) => g.saveKey === gameKey);
  const gameTitle = game?.title ?? gameKey;
  const gameEmoji = game?.emoji ?? "🃏";

  const hasPlayed = stats.gamesPlayed > 0;

  return (
    <>
      <div
        className="flex items-center gap-2 sm:gap-3 rounded-xl px-3 py-2 mb-3 flex-wrap"
        style={{
          background: "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
          border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
        }}
      >
        {/* Streak */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-base leading-none">🔥</span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: streak > 0 ? "var(--neon)" : "color-mix(in oklab, var(--neon) 45%, white)" }}
          >
            {streak}
          </span>
          <span
            className="text-xs"
            style={{ color: "color-mix(in oklab, var(--neon) 45%, white)" }}
          >
            streak
          </span>
        </div>

        <Divider />

        {/* Win rate */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: hasPlayed ? "var(--neon)" : "color-mix(in oklab, var(--neon) 45%, white)" }}
          >
            {hasPlayed ? `${winRate}%` : "—"}
          </span>
          <span
            className="text-xs"
            style={{ color: "color-mix(in oklab, var(--neon) 45%, white)" }}
          >
            win rate
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Daily challenge button */}
        {completedToday ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs">✅</span>
            <span
              className="text-xs font-medium"
              style={{ color: "color-mix(in oklab, var(--neon) 55%, white)" }}
            >
              Daily done
              {dailyStreak > 1 && (
                <span className="ml-1 opacity-70">· {dailyStreak} day streak</span>
              )}
            </span>
          </div>
        ) : (
          <button
            onClick={activateDaily}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all hover:opacity-90 active:scale-95 shrink-0"
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

        {/* Stats modal button */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all hover:opacity-80 active:scale-95 shrink-0"
          style={{
            background: "color-mix(in oklab, var(--neon) 12%, transparent)",
            color: "color-mix(in oklab, var(--neon) 75%, white)",
            border: "1px solid color-mix(in oklab, var(--neon) 25%, transparent)",
          }}
          title="View full statistics"
        >
          <span>📊</span>
          <span className="hidden sm:inline">Stats</span>
        </button>
      </div>

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

function Divider() {
  return (
    <div
      className="self-stretch w-px shrink-0"
      style={{ background: "color-mix(in oklab, var(--neon) 20%, transparent)" }}
    />
  );
}
