/**
 * Per-game statistics persisted to localStorage.
 * Tracks wins, losses, streaks, and best times for each game.
 *
 * Stored separately from game saves so stats survive a "New Game".
 * Key format: neon-solitaire:stats:<gameKey>
 */

const STATS_PREFIX = "neon-solitaire:stats:";

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  currentStreak: number;
  longestStreak: number;
  /** Best winning time in seconds; null until first win. */
  bestTime: number | null;
  lastPlayedAt: number;
}

function defaultStats(): GameStats {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    longestStreak: 0,
    bestTime: null,
    lastPlayedAt: 0,
  };
}

/** Load stats for a game key, returning defaults if none found. */
export function loadStats(gameKey: string): GameStats {
  try {
    const raw = localStorage.getItem(STATS_PREFIX + gameKey);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw) as Partial<GameStats>;
    return { ...defaultStats(), ...parsed };
  } catch {
    return defaultStats();
  }
}

function saveStats(gameKey: string, stats: GameStats): void {
  try {
    localStorage.setItem(STATS_PREFIX + gameKey, JSON.stringify(stats));
  } catch {
    // Private browsing, quota exceeded, or SSR — ignore.
  }
}

/**
 * Record a win for the given game key.
 * @param elapsedSeconds - how long the game took (used for best-time tracking)
 * @returns the updated stats
 */
export function recordWin(gameKey: string, elapsedSeconds: number): GameStats {
  const stats = loadStats(gameKey);
  const newStreak = stats.currentStreak + 1;
  const updated: GameStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    wins: stats.wins + 1,
    losses: stats.losses,
    currentStreak: newStreak,
    longestStreak: Math.max(stats.longestStreak, newStreak),
    bestTime:
      stats.bestTime === null
        ? elapsedSeconds
        : Math.min(stats.bestTime, elapsedSeconds),
    lastPlayedAt: Date.now(),
  };
  saveStats(gameKey, updated);
  return updated;
}

/**
 * Record a loss (stuck / game-over) for the given game key.
 * Resets the current streak.
 * @returns the updated stats
 */
export function recordLoss(gameKey: string): GameStats {
  const stats = loadStats(gameKey);
  const updated: GameStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    wins: stats.wins,
    losses: stats.losses + 1,
    currentStreak: 0,
    longestStreak: stats.longestStreak,
    bestTime: stats.bestTime,
    lastPlayedAt: Date.now(),
  };
  saveStats(gameKey, updated);
  return updated;
}

/** Win percentage (0–100), rounded to nearest integer. */
export function getWinRate(stats: GameStats): number {
  if (stats.gamesPlayed === 0) return 0;
  return Math.round((stats.wins / stats.gamesPlayed) * 100);
}

/** Format seconds as MM:SS. */
export function formatStatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
