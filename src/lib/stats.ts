/**
 * Per-game statistics persisted to localStorage.
 * Tracks wins, losses, streaks, times, moves, and a history log.
 *
 * Key format: neon-solitaire:stats:<gameKey>
 */

const STATS_PREFIX = "neon-solitaire:stats:";
const MAX_HISTORY = 50;

export interface GameRecord {
  date: number;           // Unix timestamp (ms)
  won: boolean;
  moves: number;
  durationSeconds: number;
  isDaily: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  currentStreak: number;
  longestStreak: number;
  /** Best winning time in seconds; null until first win. */
  bestTime: number | null;
  /** Fewest moves to win; null until first win. */
  bestMoves: number | null;
  /** Running average win time in seconds; null until first win. */
  avgTime: number | null;
  /** Running average moves across all games; null until first game. */
  avgMoves: number | null;
  lastPlayedAt: number;
  history: GameRecord[];
}

function defaultStats(): GameStats {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    longestStreak: 0,
    bestTime: null,
    bestMoves: null,
    avgTime: null,
    avgMoves: null,
    lastPlayedAt: 0,
    history: [],
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
    // Notify any listening components (e.g. GameStatsBar)
    window.dispatchEvent(
      new CustomEvent("neon-solitaire:stats-updated", { detail: { gameKey } })
    );
  } catch {
    // Private browsing, quota exceeded, or SSR — ignore.
  }
}

/** Running-average helper. */
function updateAvg(prev: number | null, newVal: number, count: number): number {
  if (prev === null) return newVal;
  return Math.round(((prev * (count - 1)) + newVal) / count);
}

/**
 * Record a win for the given game key.
 * @param elapsedSeconds - how long the game took
 * @param moves - number of moves made
 * @param isDaily - whether this was a daily challenge game
 */
export function recordWin(
  gameKey: string,
  elapsedSeconds: number,
  moves: number = 0,
  isDaily: boolean = false,
): GameStats {
  const stats = loadStats(gameKey);
  const newStreak = stats.currentStreak + 1;
  const newWins = stats.wins + 1;

  const record: GameRecord = {
    date: Date.now(),
    won: true,
    moves,
    durationSeconds: elapsedSeconds,
    isDaily,
  };

  const updated: GameStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    wins: newWins,
    losses: stats.losses,
    currentStreak: newStreak,
    longestStreak: Math.max(stats.longestStreak, newStreak),
    bestTime:
      stats.bestTime === null
        ? elapsedSeconds
        : Math.min(stats.bestTime, elapsedSeconds),
    bestMoves:
      moves === 0
        ? stats.bestMoves
        : stats.bestMoves === null
          ? moves
          : Math.min(stats.bestMoves, moves),
    avgTime: updateAvg(stats.avgTime, elapsedSeconds, newWins),
    avgMoves:
      moves === 0
        ? stats.avgMoves
        : updateAvg(stats.avgMoves, moves, stats.gamesPlayed + 1),
    lastPlayedAt: Date.now(),
    history: [record, ...stats.history].slice(0, MAX_HISTORY),
  };
  saveStats(gameKey, updated);
  return updated;
}

/**
 * Record a loss/abandon for the given game key. Resets current streak.
 */
export function recordLoss(
  gameKey: string,
  moves: number = 0,
  isDaily: boolean = false,
): GameStats {
  const stats = loadStats(gameKey);

  const record: GameRecord = {
    date: Date.now(),
    won: false,
    moves,
    durationSeconds: 0,
    isDaily,
  };

  const updated: GameStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    wins: stats.wins,
    losses: stats.losses + 1,
    currentStreak: 0,
    longestStreak: stats.longestStreak,
    bestTime: stats.bestTime,
    bestMoves: stats.bestMoves,
    avgMoves:
      moves === 0
        ? stats.avgMoves
        : updateAvg(stats.avgMoves, moves, stats.gamesPlayed + 1),
    avgTime: stats.avgTime,
    lastPlayedAt: Date.now(),
    history: [record, ...stats.history].slice(0, MAX_HISTORY),
  };
  saveStats(gameKey, updated);
  return updated;
}

/* ── Export / Import ──────────────────────────────────────────────────────── */

export interface StatsExport {
  version: 1;
  exportedAt: number;
  games: Record<string, GameStats>;
}

/**
 * Collect all game stats from localStorage and return a portable snapshot.
 * Only keys that match the STATS_PREFIX are included.
 */
export function exportAllStats(): StatsExport {
  const games: Record<string, GameStats> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STATS_PREFIX)) {
        const gameKey = key.slice(STATS_PREFIX.length);
        games[gameKey] = loadStats(gameKey);
      }
    }
  } catch {
    // SSR or private-browsing — return empty export
  }
  return { version: 1, exportedAt: Date.now(), games };
}

/**
 * Trigger a JSON file download containing all stats.
 */
export function downloadStatsExport(): void {
  const data = exportAllStats();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `solitaire-stats-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import a StatsExport object, writing each game's stats to localStorage.
 * Existing stats for each game are replaced entirely.
 * Returns the number of games imported, or throws on invalid data.
 */
export function importStatsFromExport(data: unknown): number {
  if (
    typeof data !== "object" ||
    data === null ||
    (data as StatsExport).version !== 1 ||
    typeof (data as StatsExport).games !== "object"
  ) {
    throw new Error("Invalid stats file — please use a file exported from Solitaire Station.");
  }
  const { games } = data as StatsExport;
  let count = 0;
  for (const [gameKey, stats] of Object.entries(games)) {
    if (typeof gameKey !== "string" || typeof stats !== "object" || stats === null) continue;
    // Merge with defaults so forward-compat fields don't disappear
    const merged: GameStats = { ...defaultStats(), ...(stats as Partial<GameStats>) };
    saveStats(gameKey, merged);
    count++;
  }
  return count;
}

/** Win percentage (0–100), rounded to nearest integer. */
export function getWinRate(stats: GameStats): number {
  if (stats.gamesPlayed === 0) return 0;
  return Math.round((stats.wins / stats.gamesPlayed) * 100);
}

/** Format seconds as M:SS or H:MM:SS. */
export function formatStatTime(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
