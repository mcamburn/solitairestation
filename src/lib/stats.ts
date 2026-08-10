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
  /**
   * All-time best in-game run (e.g. consecutive Pyramid pair removals without
   * drawing from stock). Zero for games that don't use this metric.
   */
  bestRun: number;
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
    bestRun: 0,
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
 * @param peakRun - highest in-game run counter reached this session (e.g. Pyramid streak)
 */
export function recordWin(
  gameKey: string,
  elapsedSeconds: number,
  moves: number = 0,
  isDaily: boolean = false,
  peakRun: number = 0,
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
    bestRun: Math.max(stats.bestRun ?? 0, peakRun),
  };
  saveStats(gameKey, updated);
  return updated;
}

/**
 * Record a loss/abandon for the given game key. Resets current streak.
 * @param peakRun - highest in-game run counter reached this session (e.g. Pyramid streak)
 */
export function recordLoss(
  gameKey: string,
  moves: number = 0,
  isDaily: boolean = false,
  peakRun: number = 0,
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
    bestRun: Math.max(stats.bestRun ?? 0, peakRun),
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

// ── Validation helpers ────────────────────────────────────────────────────

/**
 * Returns true if the value is a finite, non-negative integer (or zero).
 */
function isNonNegativeInt(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0;
}

/**
 * Returns true if the value is either null or a finite, non-negative number.
 */
function isNullOrNonNegativeNumber(v: unknown): v is number | null {
  return v === null || (typeof v === "number" && Number.isFinite(v) && v >= 0);
}

/**
 * Validate a single GameRecord entry. Returns true if the entry is well-formed.
 */
function isValidGameRecord(r: unknown): r is GameRecord {
  if (typeof r !== "object" || r === null) return false;
  const rec = r as Record<string, unknown>;
  return (
    typeof rec.date === "number" &&
    Number.isFinite(rec.date) &&
    typeof rec.won === "boolean" &&
    isNonNegativeInt(rec.moves) &&
    isNonNegativeInt(rec.durationSeconds) &&
    typeof rec.isDaily === "boolean"
  );
}

/**
 * Validate a GameStats object.
 * Returns null if valid (after coercing history to only valid entries),
 * or a string describing the first problem found.
 */
function validateGameStats(raw: unknown): { stats: GameStats } | { error: string } {
  if (typeof raw !== "object" || raw === null) {
    return { error: "stats entry is not an object" };
  }
  const s = raw as Record<string, unknown>;

  if (!isNonNegativeInt(s.gamesPlayed)) {
    return { error: "gamesPlayed must be a non-negative integer" };
  }
  if (!isNonNegativeInt(s.wins)) {
    return { error: "wins must be a non-negative integer" };
  }
  if (!isNonNegativeInt(s.losses)) {
    return { error: "losses must be a non-negative integer" };
  }
  if (!isNonNegativeInt(s.currentStreak)) {
    return { error: "currentStreak must be a non-negative integer" };
  }
  if (!isNonNegativeInt(s.longestStreak)) {
    return { error: "longestStreak must be a non-negative integer" };
  }
  if (!isNullOrNonNegativeNumber(s.bestTime)) {
    return { error: "bestTime must be null or a non-negative number" };
  }
  if (!isNullOrNonNegativeNumber(s.bestMoves)) {
    return { error: "bestMoves must be null or a non-negative number" };
  }
  if (!isNullOrNonNegativeNumber(s.avgTime)) {
    return { error: "avgTime must be null or a non-negative number" };
  }
  if (!isNullOrNonNegativeNumber(s.avgMoves)) {
    return { error: "avgMoves must be null or a non-negative number" };
  }
  if (!isNullOrNonNegativeNumber(s.lastPlayedAt) || typeof s.lastPlayedAt !== "number") {
    return { error: "lastPlayedAt must be a non-negative finite number" };
  }
  if ((s.wins as number) > (s.gamesPlayed as number)) {
    return { error: "wins cannot exceed gamesPlayed" };
  }
  if ((s.losses as number) > (s.gamesPlayed as number)) {
    return { error: "losses cannot exceed gamesPlayed" };
  }
  if ((s.wins as number) + (s.losses as number) > (s.gamesPlayed as number)) {
    return { error: "wins + losses cannot exceed gamesPlayed" };
  }

  // bestRun: optional in legacy exports; default 0 when absent; reject invalid values
  const rawBestRun = s.bestRun ?? 0;
  if (!isNonNegativeInt(rawBestRun)) {
    return { error: "bestRun must be a non-negative integer" };
  }

  // History: keep only well-formed entries; drop malformed ones silently
  const rawHistory = Array.isArray(s.history) ? s.history : [];
  const history: GameRecord[] = rawHistory.filter(isValidGameRecord);

  const merged: GameStats = {
    ...defaultStats(),
    ...(s as Partial<GameStats>),
    history,
    bestRun: rawBestRun,
  };
  return { stats: merged };
}

/**
 * Merge two GameStats objects so the player is never left worse off.
 *
 * - History: union of both sets, deduplicated by timestamp, newest first,
 *   capped at MAX_HISTORY.
 * - Aggregate counts: take the larger value from each side.
 * - Best times / best moves: take the smaller (better) non-null value.
 * - Running averages: prefer the existing value (more accurate for live play).
 * - lastPlayedAt: take the more recent timestamp.
 */
export function mergeStats(existing: GameStats, imported: GameStats): GameStats {
  // Build a deduped, sorted merged history
  const seen = new Set<number>();
  const combined: GameRecord[] = [];
  for (const r of [...existing.history, ...imported.history]) {
    if (!seen.has(r.date)) {
      seen.add(r.date);
      combined.push(r);
    }
  }
  combined.sort((a, b) => b.date - a.date);
  const history = combined.slice(0, MAX_HISTORY);

  const bestTime =
    existing.bestTime === null
      ? imported.bestTime
      : imported.bestTime === null
        ? existing.bestTime
        : Math.min(existing.bestTime, imported.bestTime);

  const bestMoves =
    existing.bestMoves === null
      ? imported.bestMoves
      : imported.bestMoves === null
        ? existing.bestMoves
        : Math.min(existing.bestMoves, imported.bestMoves);

  const wins = Math.max(existing.wins, imported.wins);
  const losses = Math.max(existing.losses, imported.losses);
  // Adjust gamesPlayed upward if the independently-maximised wins+losses would
  // otherwise exceed it, preserving the invariant wins + losses ≤ gamesPlayed.
  const gamesPlayed = Math.max(
    existing.gamesPlayed,
    imported.gamesPlayed,
    wins + losses,
  );

  return {
    gamesPlayed,
    wins,
    losses,
    currentStreak: Math.max(existing.currentStreak, imported.currentStreak),
    longestStreak: Math.max(existing.longestStreak, imported.longestStreak),
    bestTime,
    bestMoves,
    // Prefer the existing running averages; fall back to imported if we have none yet
    avgTime: existing.avgTime ?? imported.avgTime,
    avgMoves: existing.avgMoves ?? imported.avgMoves,
    lastPlayedAt: Math.max(existing.lastPlayedAt, imported.lastPlayedAt),
    history,
    bestRun: Math.max(existing.bestRun ?? 0, imported.bestRun ?? 0),
  };
}

export interface ImportResult {
  /** Number of game keys successfully imported. */
  count: number;
  /** Number of game keys skipped because their data was structurally invalid. */
  skippedGames: number;
  /** Number of individual history records removed because they were malformed. */
  droppedRecords: number;
}

/**
 * Import a StatsExport object, merging each game's stats into localStorage.
 * Existing stats are never replaced outright — imported data is merged so the
 * player ends up with the union of both histories and the best aggregate values.
 * Throws on structurally invalid files; silently skips corrupted per-game entries.
 * Returns an ImportResult with counts of successes, skipped games, and dropped records.
 */
export function importStatsFromExport(data: unknown): ImportResult {
  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data) ||
    (data as StatsExport).version !== 1 ||
    typeof (data as StatsExport).games !== "object" ||
    (data as StatsExport).games === null ||
    Array.isArray((data as StatsExport).games)
  ) {
    throw new Error("Invalid stats file — please use a file exported from Solitaire Station.");
  }
  const { games } = data as StatsExport;
  let count = 0;
  let skippedGames = 0;
  let droppedRecords = 0;
  for (const [gameKey, stats] of Object.entries(games)) {
    if (typeof gameKey !== "string") continue;
    // Count raw history entries before validation so we can detect drops
    const rawStats = stats as Record<string, unknown>;
    const rawHistoryLen = Array.isArray(rawStats.history) ? rawStats.history.length : 0;
    const result = validateGameStats(stats);
    if ("error" in result) {
      skippedGames++;
      continue;
    }
    droppedRecords += rawHistoryLen - result.stats.history.length;
    const existing = loadStats(gameKey);
    saveStats(gameKey, mergeStats(existing, result.stats));
    count++;
  }
  return { count, skippedGames, droppedRecords };
}

/* ── Import preview (dry-run) ─────────────────────────────────────────────── */

export interface ImportPreviewEntry {
  /** The game key (e.g. "klondike"). */
  gameKey: string;
  /** History records in the imported file that aren't already in local storage. */
  newRecords: number;
  /** Total valid history records in the imported file for this game. */
  totalRecords: number;
}

export interface ImportPreview {
  /** Per-game breakdown; only games that pass validation are included. */
  entries: ImportPreviewEntry[];
  /** Sum of newRecords across all games. */
  totalNewRecords: number;
  /** Number of valid game keys found in the import. */
  validGameCount: number;
}

/**
 * Parse and validate an import file, then compute per-game counts of
 * history records that would be added — without writing anything.
 * Throws on a structurally invalid file (same as importStatsFromExport).
 */
export function previewStatsImport(data: unknown): ImportPreview {
  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data) ||
    (data as StatsExport).version !== 1 ||
    typeof (data as StatsExport).games !== "object" ||
    (data as StatsExport).games === null ||
    Array.isArray((data as StatsExport).games)
  ) {
    throw new Error("Invalid stats file — please use a file exported from Solitaire Station.");
  }
  const { games } = data as StatsExport;
  const entries: ImportPreviewEntry[] = [];
  let totalNewRecords = 0;

  for (const [gameKey, rawStats] of Object.entries(games)) {
    if (typeof gameKey !== "string") continue;
    const result = validateGameStats(rawStats);
    if ("error" in result) continue; // skip invalid games (same as importStatsFromExport)

    const existing = loadStats(gameKey);
    // Simulate the real merge so the count respects deduplication and the
    // MAX_HISTORY cap — identical to what importStatsFromExport will do.
    const merged = mergeStats(existing, result.stats);
    const existingTimestamps = new Set(existing.history.map((r) => r.date));
    const newRecords = merged.history.filter((r) => !existingTimestamps.has(r.date)).length;

    entries.push({
      gameKey,
      newRecords,
      totalRecords: result.stats.history.length,
    });
    totalNewRecords += newRecords;
  }

  return { entries, totalNewRecords, validGameCount: entries.length };
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
