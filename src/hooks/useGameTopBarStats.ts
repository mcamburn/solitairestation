/**
 * useGameTopBarStats
 *
 * Lightweight hook for showing current streak and win rate in the in-game
 * top bar. Loads from localStorage on mount and refreshes automatically
 * whenever a game result is recorded (via the stats-updated custom event).
 */

import { useEffect, useState } from "react";
import { loadStats, getWinRate } from "@/lib/stats";

interface TopBarStats {
  streak: number;
  winRate: number;
  /** true once at least one game has been played */
  hasPlayed: boolean;
}

export function useGameTopBarStats(gameKey: string): TopBarStats {
  const [stats, setStats] = useState(() => loadStats(gameKey));

  // Refresh when this game records a win or loss
  useEffect(() => {
    const handler = (e: Event) => {
      const key = (e as CustomEvent<{ gameKey: string }>).detail?.gameKey;
      if (key === gameKey) setStats(loadStats(gameKey));
    };
    window.addEventListener("neon-solitaire:stats-updated", handler);
    return () => window.removeEventListener("neon-solitaire:stats-updated", handler);
  }, [gameKey]);

  // Re-load when the game key changes (e.g. switching between games)
  useEffect(() => {
    setStats(loadStats(gameKey));
  }, [gameKey]);

  return {
    streak: stats.currentStreak,
    winRate: getWinRate(stats),
    hasPlayed: stats.gamesPlayed > 0,
  };
}
