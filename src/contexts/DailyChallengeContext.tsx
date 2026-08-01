/**
 * DailyChallengeContext
 *
 * Provided by GamePageLayout (with a gameKey prop) and consumed by game
 * components via useDailyChallenge(). Manages the daily challenge lifecycle:
 * activation trigger, seed, completion state, and streak.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getDailySeed,
  isDailyComplete,
  loadDailyStats,
  recordDailyWin,
  type DailyStats,
} from "@/lib/daily";

interface DailyChallengeContextValue {
  /** Deterministic seed for today's deal. */
  dailySeed: number;
  /** Whether today's daily is already finished. */
  completedToday: boolean;
  /** Current daily win streak. */
  dailyStreak: number;
  /** All-time best daily streak. */
  longestDailyStreak: number;
  /**
   * Increments every time the user activates the daily challenge.
   * Game components watch this value and call reset(dailySeed) when it changes.
   */
  dailyTrigger: number;
  /** Call this when the player wins a daily challenge game. */
  onDailyWin: () => void;
  /** Activate (or re-start) the daily challenge. */
  activateDaily: () => void;
}

const DailyChallengeContext = createContext<DailyChallengeContextValue | null>(null);

interface ProviderProps {
  gameKey: string;
  children: ReactNode;
}

export function DailyChallengeProvider({ gameKey, children }: ProviderProps) {
  const dailySeed = getDailySeed(gameKey);

  const [dailyStats, setDailyStats] = useState<DailyStats>(() =>
    loadDailyStats(gameKey)
  );
  const [dailyTrigger, setDailyTrigger] = useState(0);

  // Keep daily stats fresh after external updates (e.g. after onDailyWin)
  useEffect(() => {
    const handler = (e: Event) => {
      const key = (e as CustomEvent<{ gameKey: string }>).detail?.gameKey;
      if (key === gameKey) setDailyStats(loadDailyStats(gameKey));
    };
    window.addEventListener("neon-solitaire:daily-updated", handler);
    return () => window.removeEventListener("neon-solitaire:daily-updated", handler);
  }, [gameKey]);

  const activateDaily = useCallback(() => {
    setDailyTrigger((t) => t + 1);
    // Scroll to game board so the player sees the reset
    if (typeof document !== "undefined") {
      document.getElementById("game-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const onDailyWin = useCallback(() => {
    const updated = recordDailyWin(gameKey);
    setDailyStats(updated);
  }, [gameKey]);

  const value: DailyChallengeContextValue = {
    dailySeed,
    completedToday: isDailyComplete(gameKey),
    dailyStreak: dailyStats.streak,
    longestDailyStreak: dailyStats.longestStreak,
    dailyTrigger,
    onDailyWin,
    activateDaily,
  };

  return (
    <DailyChallengeContext.Provider value={value}>
      {children}
    </DailyChallengeContext.Provider>
  );
}

/** Consume the daily challenge context inside any game component. */
export function useDailyChallenge(): DailyChallengeContextValue {
  const ctx = useContext(DailyChallengeContext);
  if (!ctx) {
    // Return a no-op stub when rendered outside a provider (e.g. tests)
    return {
      dailySeed: 0,
      completedToday: false,
      dailyStreak: 0,
      longestDailyStreak: 0,
      dailyTrigger: 0,
      onDailyWin: () => {},
      activateDaily: () => {},
    };
  }
  return ctx;
}
