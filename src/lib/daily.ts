/**
 * Daily challenge utilities.
 * Each game generates a deterministic seed from today's date + game key,
 * ensuring every player gets the same deal for that day.
 *
 * Key format: neon-solitaire:daily:<gameKey>
 */

const DAILY_PREFIX = "neon-solitaire:daily:";

export interface DailyStats {
  streak: number;
  longestStreak: number;
  /** ISO date string (YYYY-MM-DD) of the last completed daily, or null. */
  lastCompletedDate: string | null;
}

function defaultDailyStats(): DailyStats {
  return { streak: 0, longestStreak: 0, lastCompletedDate: null };
}

/** Today's date as YYYY-MM-DD in the player's local timezone. */
export function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Yesterday's date as YYYY-MM-DD in the player's local timezone. */
function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Deterministic 32-bit seed for a game on a given day.
 * Uses FNV-1a hash of "<gameKey>:<YYYY-MM-DD>".
 */
export function getDailySeed(gameKey: string): number {
  const input = `${gameKey}:${getTodayKey()}`;
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1; // unsigned 32-bit, never 0
}

export function loadDailyStats(gameKey: string): DailyStats {
  try {
    const raw = localStorage.getItem(DAILY_PREFIX + gameKey);
    if (!raw) return defaultDailyStats();
    return { ...defaultDailyStats(), ...(JSON.parse(raw) as Partial<DailyStats>) };
  } catch {
    return defaultDailyStats();
  }
}

function saveDailyStats(gameKey: string, stats: DailyStats): void {
  try {
    localStorage.setItem(DAILY_PREFIX + gameKey, JSON.stringify(stats));
    window.dispatchEvent(
      new CustomEvent("neon-solitaire:daily-updated", { detail: { gameKey } })
    );
  } catch {
    // Ignore storage errors
  }
}

/** Returns true if today's daily challenge has already been completed. */
export function isDailyComplete(gameKey: string): boolean {
  return loadDailyStats(gameKey).lastCompletedDate === getTodayKey();
}

/**
 * Record a daily challenge win. Updates the daily streak.
 * Safe to call multiple times — only counts the first win per day.
 */
export function recordDailyWin(gameKey: string): DailyStats {
  const stats = loadDailyStats(gameKey);
  const today = getTodayKey();

  // Already completed today — no update needed
  if (stats.lastCompletedDate === today) return stats;

  const newStreak =
    stats.lastCompletedDate === getYesterdayKey() ? stats.streak + 1 : 1;

  const updated: DailyStats = {
    streak: newStreak,
    longestStreak: Math.max(stats.longestStreak, newStreak),
    lastCompletedDate: today,
  };
  saveDailyStats(gameKey, updated);
  return updated;
}
