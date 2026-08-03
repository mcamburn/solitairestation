import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  loadStats,
  getWinRate,
  formatStatTime,
  downloadStatsExport,
  importStatsFromExport,
  type GameStats,
  type GameRecord,
} from "@/lib/stats";
import { GAMES } from "@/lib/games";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/stats")({
  validateSearch: (search: Record<string, unknown>): { from?: string } => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  component: StatsPage,
  head: () => ({
    meta: [
      { title: "Solitaire Station — My Stats" },
      {
        name: "description",
        content:
          "View your lifetime solitaire stats: games played, win rate, best time, and longest streak across every game on Solitaire Station.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Solitaire Station — My Stats" },
      {
        property: "og:description",
        content:
          "Your lifetime solitaire stats across every game on Solitaire Station.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/stats` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/stats` }],
  }),
});

/* ── Types ────────────────────────────────────────────────────────────────── */

interface GameRow {
  saveKey: string;
  title: string;
  emoji: string;
  to: string;
  stats: GameStats;
}

interface HistoryEntry {
  record: GameRecord;
  gameTitle: string;
  gameEmoji: string;
  gameTo: string;
}

type SortKey = "title" | "gamesPlayed" | "wins" | "winRate" | "bestTime" | "longestStreak";
type HistorySortKey = "game" | "result" | "time" | "moves" | "date";
type SortDir = "asc" | "desc";

/* ── Default rows (no localStorage access — safe for SSR) ────────────────── */

function buildDefaultRows(): GameRow[] {
  return GAMES.map((g) => ({
    saveKey: g.saveKey,
    title: g.title,
    emoji: g.emoji,
    to: g.to,
    stats: {
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
    },
  }));
}

function loadRows(): GameRow[] {
  return GAMES.map((g) => ({
    saveKey: g.saveKey,
    title: g.title,
    emoji: g.emoji,
    to: g.to,
    stats: loadStats(g.saveKey),
  }));
}

/* ── Sorting helper ───────────────────────────────────────────────────────── */

function rowSortValue(row: GameRow, key: SortKey): number | string {
  const s = row.stats;
  switch (key) {
    case "title":       return row.title.toLowerCase();
    case "gamesPlayed": return s.gamesPlayed;
    case "wins":        return s.wins;
    case "winRate":     return s.gamesPlayed > 0 ? getWinRate(s) : -1;
    case "bestTime":    return s.bestTime ?? Infinity;
    case "longestStreak": return s.longestStreak;
  }
}

function sortRows(rows: GameRow[], key: SortKey, dir: SortDir): GameRow[] {
  return [...rows].sort((a, b) => {
    const av = rowSortValue(a, key);
    const bv = rowSortValue(b, key);
    let cmp = 0;
    if (typeof av === "string" && typeof bv === "string") {
      cmp = av.localeCompare(bv);
    } else {
      cmp = (av as number) - (bv as number);
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

/* ── History sort ─────────────────────────────────────────────────────────── */

function historySortValue(entry: HistoryEntry, key: HistorySortKey): number | string {
  const r = entry.record;
  switch (key) {
    case "game":   return entry.gameTitle.toLowerCase();
    case "result": return r.won ? 0 : 1;
    case "time":   return r.won && r.durationSeconds > 0 ? r.durationSeconds : Infinity;
    case "moves":  return r.moves > 0 ? r.moves : Infinity;
    case "date":   return r.date;
  }
}

function sortHistory(entries: HistoryEntry[], key: HistorySortKey, dir: SortDir): HistoryEntry[] {
  return [...entries].sort((a, b) => {
    const av = historySortValue(a, key);
    const bv = historySortValue(b, key);

    // Unavailable numeric values (Infinity) always sort to the bottom,
    // regardless of the chosen direction.
    const aInf = av === Infinity;
    const bInf = bv === Infinity;
    if (aInf && bInf) return 0;
    if (aInf) return 1;
    if (bInf) return -1;

    let cmp = 0;
    if (typeof av === "string" && typeof bv === "string") {
      cmp = av.localeCompare(bv);
    } else {
      cmp = (av as number) - (bv as number);
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

/* ── Combined history builder ─────────────────────────────────────────────── */

function buildCombinedHistory(rows: GameRow[]): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  for (const row of rows) {
    for (const record of row.stats.history) {
      entries.push({
        record,
        gameTitle: row.title,
        gameEmoji: row.emoji,
        gameTo: row.to,
      });
    }
  }
  // Most recent first
  entries.sort((a, b) => b.record.date - a.record.date);
  return entries;
}

/* ── Aggregation ─────────────────────────────────────────────────────────── */

function aggregateStats(rows: GameRow[]) {
  return rows.reduce(
    (acc, r) => ({
      gamesPlayed: acc.gamesPlayed + r.stats.gamesPlayed,
      wins: acc.wins + r.stats.wins,
    }),
    { gamesPlayed: 0, wins: 0 },
  );
}

/* ── Page component ───────────────────────────────────────────────────────── */

function StatsPage() {
  const { from } = Route.useSearch();

  // Start with default (zero) stats so SSR and first client render match.
  // Real localStorage data is loaded in the effect below.
  const [rows, setRows] = useState<GameRow[]>(buildDefaultRows);
  const [hydrated, setHydrated] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  // Separate ref maps for desktop table rows and mobile cards so the later-mounted
  // mobile card doesn't overwrite the desktop row under the same saveKey.
  const tableRowRefs = useRef<Map<string, HTMLElement>>(new Map());
  const mobileCardRefs = useRef<Map<string, HTMLElement>>(new Map());

  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [dailyOnly, setDailyOnly] = useState(false);
  const [drilldownDailyOnly, setDrilldownDailyOnly] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(25);
  const [historySortKey, setHistorySortKey] = useState<HistorySortKey>("date");
  const [historySortDir, setHistorySortDir] = useState<SortDir>("desc");
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  function toggleGameExpanded(saveKey: string) {
    setExpandedGames((prev) => {
      const next = new Set(prev);
      if (next.has(saveKey)) next.delete(saveKey);
      else next.add(saveKey);
      return next;
    });
  }

  // Load real stats from localStorage after first mount (client-only)
  useEffect(() => {
    setRows(loadRows());
    // Restore persisted sort preference
    try {
      const savedKey = localStorage.getItem("stats-sort-key") as SortKey | null;
      const savedDir = localStorage.getItem("stats-sort-dir") as SortDir | null;
      const validKeys: SortKey[] = ["title", "gamesPlayed", "wins", "winRate", "bestTime", "longestStreak"];
      if (savedKey && validKeys.includes(savedKey)) setSortKey(savedKey);
      if (savedDir === "asc" || savedDir === "desc") setSortDir(savedDir);
      const savedDailyOnly = localStorage.getItem("stats-daily-only");
      if (savedDailyOnly === "true") setDailyOnly(true);
      const savedDrilldownDailyOnly = localStorage.getItem("stats-drilldown-daily-only");
      if (savedDrilldownDailyOnly === "true") setDrilldownDailyOnly(true);
      const savedHistKey = localStorage.getItem("stats-history-sort-key") as HistorySortKey | null;
      const savedHistDir = localStorage.getItem("stats-history-sort-dir") as SortDir | null;
      const validHistKeys: HistorySortKey[] = ["game", "result", "time", "moves", "date"];
      if (savedHistKey && validHistKeys.includes(savedHistKey)) setHistorySortKey(savedHistKey);
      if (savedHistDir === "asc" || savedHistDir === "desc") setHistorySortDir(savedHistDir);
    } catch {
      // localStorage unavailable — keep defaults
    }
    setHydrated(true);
  }, []);

  // Refresh when any game records a win/loss
  useEffect(() => {
    const handler = () => setRows(loadRows());
    window.addEventListener("neon-solitaire:stats-updated", handler);
    return () =>
      window.removeEventListener("neon-solitaire:stats-updated", handler);
  }, []);

  // Scroll to and highlight the game the player just came from.
  // Pick whichever rendering is actually visible (desktop table row vs mobile card).
  useEffect(() => {
    if (!hydrated || !from) return;
    setHighlightedKey(from);
    const tableEl = tableRowRefs.current.get(from);
    const mobileEl = mobileCardRefs.current.get(from);
    // An element hidden via display:none has offsetWidth === 0 and offsetHeight === 0
    const visibleEl =
      tableEl && (tableEl.offsetWidth > 0 || tableEl.offsetHeight > 0)
        ? tableEl
        : mobileEl;
    if (visibleEl) {
      visibleEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const timer = setTimeout(() => setHighlightedKey(null), 2200);
    return () => clearTimeout(timer);
  }, [hydrated, from]);

  const sorted = sortRows(rows, sortKey, sortDir);
  const totals = aggregateStats(rows);
  const overallWinRate =
    totals.gamesPlayed > 0
      ? Math.round((totals.wins / totals.gamesPlayed) * 100)
      : 0;
  const gamesWithPlays = rows.filter((r) => r.stats.gamesPlayed > 0).length;

  function persistSort(key: SortKey, dir: SortDir) {
    try {
      localStorage.setItem("stats-sort-key", key);
      localStorage.setItem("stats-sort-dir", dir);
    } catch {
      // ignore
    }
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      const newDir: SortDir = sortDir === "asc" ? "desc" : "asc";
      setSortDir(newDir);
      persistSort(key, newDir);
    } else {
      // For numeric columns, default descending (highest first); name → asc
      const newDir: SortDir = key === "title" ? "asc" : "desc";
      setSortKey(key);
      setSortDir(newDir);
      persistSort(key, newDir);
    }
  }

  function persistHistorySort(key: HistorySortKey, dir: SortDir) {
    try {
      localStorage.setItem("stats-history-sort-key", key);
      localStorage.setItem("stats-history-sort-dir", dir);
    } catch {
      // ignore
    }
  }

  function persistDrilldownDailyOnly(value: boolean) {
    try {
      localStorage.setItem("stats-drilldown-daily-only", String(value));
    } catch {
      // ignore
    }
  }

  function handleToggleDrilldownDailyOnly() {
    setDrilldownDailyOnly((v) => {
      const next = !v;
      persistDrilldownDailyOnly(next);
      return next;
    });
  }

  function handleHistorySort(key: HistorySortKey) {
    if (key === historySortKey) {
      const newDir: SortDir = historySortDir === "asc" ? "desc" : "asc";
      setHistorySortDir(newDir);
      persistHistorySort(key, newDir);
    } else {
      // date → desc (newest first); time/moves/game/result → asc (fastest / fewest / A-Z / wins first)
      const newDir: SortDir = key === "date" ? "desc" : "asc";
      setHistorySortKey(key);
      setHistorySortDir(newDir);
      persistHistorySort(key, newDir);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[900px] px-4 py-10 sm:py-16">
      {/* Highlight animation */}
      <style>{`
        @keyframes stats-row-flash {
          0%   { background: color-mix(in oklab, var(--neon) 24%, oklch(0.16 0.03 155)); outline: 2px solid color-mix(in oklab, var(--neon) 55%, transparent); }
          60%  { background: color-mix(in oklab, var(--neon) 14%, oklch(0.16 0.03 155)); outline: 2px solid color-mix(in oklab, var(--neon) 30%, transparent); }
          100% { background: color-mix(in oklab, var(--neon) 4%, oklch(0.16 0.03 155)); outline: 2px solid transparent; }
        }
        .stats-row-highlighted {
          animation: stats-row-flash 2.2s ease-out forwards;
          border-radius: 0.5rem;
        }
      `}</style>

      {/* Back link */}
      <Link
        to="/"
        className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
      >
        ← Back to game
      </Link>

      {/* Page heading */}
      <h1
        className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        My Stats
      </h1>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Lifetime stats across all {GAMES.length} games
      </p>

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Games Played" value={hydrated ? totals.gamesPlayed.toLocaleString() : "—"} />
        <SummaryCard label="Total Wins" value={hydrated ? totals.wins.toLocaleString() : "—"} />
        <SummaryCard
          label="Overall Win Rate"
          value={hydrated && totals.gamesPlayed > 0 ? `${overallWinRate}%` : "—"}
        />
        <SummaryCard
          label="Games Tried"
          value={hydrated ? `${gamesWithPlays} / ${GAMES.length}` : `— / ${GAMES.length}`}
        />
      </div>

      {/* Per-game table */}
      <div className="mt-8">
        {/* Desktop table */}
        <div
          className="hidden sm:block overflow-x-auto rounded-2xl"
          style={{
            background: "color-mix(in oklab, var(--neon) 4%, oklch(0.16 0.03 155))",
            border: "1px solid color-mix(in oklab, var(--neon) 14%, transparent)",
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs uppercase tracking-[0.18em]"
                style={{
                  color: "color-mix(in oklab, var(--neon) 55%, white)",
                  borderBottom: "1px solid color-mix(in oklab, var(--neon) 14%, transparent)",
                }}
              >
                <SortTh col="title" label="Game" align="left" sortKey={sortKey} sortDir={sortDir} onSort={(k) => handleSort(k as SortKey)} />
                <SortTh col="gamesPlayed" label="Played" align="right" sortKey={sortKey} sortDir={sortDir} onSort={(k) => handleSort(k as SortKey)} />
                <SortTh col="wins" label="Wins" align="right" sortKey={sortKey} sortDir={sortDir} onSort={(k) => handleSort(k as SortKey)} />
                <SortTh col="winRate" label="Win Rate" align="right" sortKey={sortKey} sortDir={sortDir} onSort={(k) => handleSort(k as SortKey)} />
                <SortTh col="bestTime" label="Best Time" align="right" sortKey={sortKey} sortDir={sortDir} onSort={(k) => handleSort(k as SortKey)} />
                <SortTh col="longestStreak" label="Longest Streak" align="right" sortKey={sortKey} sortDir={sortDir} onSort={(k) => handleSort(k as SortKey)} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <TableRow
                  key={row.saveKey}
                  row={row}
                  isLast={i === sorted.length - 1}
                  highlighted={highlightedKey === row.saveKey}
                  expanded={expandedGames.has(row.saveKey)}
                  onToggleExpand={() => toggleGameExpanded(row.saveKey)}
                  drilldownDailyOnly={drilldownDailyOnly}
                  onToggleDrilldownDailyOnly={handleToggleDrilldownDailyOnly}
                  rowRef={(el) => {
                    if (el) tableRowRefs.current.set(row.saveKey, el);
                    else tableRowRefs.current.delete(row.saveKey);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile sort toolbar */}
        <div className="sm:hidden flex items-center gap-2 mb-3">
          <label className="sr-only" htmlFor="mobile-sort-select">Sort by</label>
          <select
            id="mobile-sort-select"
            value={sortKey}
            onChange={(e) => {
              const key = e.target.value as SortKey;
              if (key === sortKey) return;
              const newDir: SortDir = key === "title" ? "asc" : "desc";
              setSortKey(key);
              setSortDir(newDir);
              persistSort(key, newDir);
            }}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-medium appearance-none cursor-pointer transition"
            style={{
              background: "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
              border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
              color: "var(--foreground)",
            }}
          >
            <option value="title">Game (A–Z)</option>
            <option value="gamesPlayed">Most Played</option>
            <option value="wins">Most Wins</option>
            <option value="winRate">Win Rate</option>
            <option value="bestTime">Best Time</option>
            <option value="longestStreak">Longest Streak</option>
          </select>
          <button
            aria-label={sortDir === "asc" ? "Sort descending" : "Sort ascending"}
            onClick={() => {
              const newDir: SortDir = sortDir === "asc" ? "desc" : "asc";
              setSortDir(newDir);
              persistSort(sortKey, newDir);
            }}
            className="rounded-lg px-3 py-2 text-sm font-semibold transition shrink-0"
            style={{
              background: "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
              border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
              color: "var(--neon)",
            }}
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-3">
          {sorted.map((row) => (
            <MobileCard
              key={row.saveKey}
              row={row}
              highlighted={highlightedKey === row.saveKey}
              expanded={expandedGames.has(row.saveKey)}
              onToggleExpand={() => toggleGameExpanded(row.saveKey)}
              drilldownDailyOnly={drilldownDailyOnly}
              onToggleDrilldownDailyOnly={handleToggleDrilldownDailyOnly}
              rowRef={(el) => {
                if (el) mobileCardRefs.current.set(row.saveKey, el);
                else mobileCardRefs.current.delete(row.saveKey);
              }}
            />
          ))}
        </div>
      </div>

      {/* Recent history */}
      {hydrated && (() => {
        const allHistory = buildCombinedHistory(rows);
        const filteredHistory = dailyOnly
          ? allHistory.filter((e) => e.record.isDaily)
          : allHistory;

        if (allHistory.length === 0) return null;

        return (
          <div className="mt-10">
            {/* Section header + filter toggle */}
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Recent History
                {filteredHistory.length > 25 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    · {filteredHistory.length.toLocaleString()} games
                  </span>
                )}
              </h2>
              <button
                onClick={() => {
                  setDailyOnly((v) => {
                    const next = !v;
                    try { localStorage.setItem("stats-daily-only", String(next)); } catch { /* ignore */ }
                    return next;
                  });
                  setHistoryLimit(25);
                }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                style={{
                  background: dailyOnly
                    ? "color-mix(in oklab, var(--neon) 22%, oklch(0.16 0.03 155))"
                    : "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
                  border: `1px solid color-mix(in oklab, var(--neon) ${dailyOnly ? "40%" : "16%"}, transparent)`,
                  color: dailyOnly ? "var(--neon)" : "var(--muted-foreground)",
                }}
                aria-pressed={dailyOnly}
              >
                <span>📅</span>
                <span>Daily only</span>
              </button>
            </div>

            {filteredHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No daily challenge games recorded yet.</p>
            ) : (() => {
              const sortedHistory = sortHistory(filteredHistory, historySortKey, historySortDir);
              const visibleHistory = sortedHistory.slice(0, historyLimit);
              const hasMore = filteredHistory.length > historyLimit;
              return (
                <>
                  {/* Desktop history table */}
                  <div
                    className="hidden sm:block overflow-x-auto rounded-2xl"
                    style={{
                      background: "color-mix(in oklab, var(--neon) 4%, oklch(0.16 0.03 155))",
                      border: "1px solid color-mix(in oklab, var(--neon) 14%, transparent)",
                    }}
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr
                          className="text-left text-xs uppercase tracking-[0.18em]"
                          style={{
                            color: "color-mix(in oklab, var(--neon) 55%, white)",
                            borderBottom: "1px solid color-mix(in oklab, var(--neon) 8%, transparent)",
                          }}
                        >
                          <SortTh col="game" label="Game" align="left" sortKey={historySortKey} sortDir={historySortDir} onSort={(k) => handleHistorySort(k as HistorySortKey)} />
                          <SortTh col="result" label="Result" align="left" sortKey={historySortKey} sortDir={historySortDir} onSort={(k) => handleHistorySort(k as HistorySortKey)} />
                          <SortTh col="time" label="Time" align="right" sortKey={historySortKey} sortDir={historySortDir} onSort={(k) => handleHistorySort(k as HistorySortKey)} />
                          <SortTh col="moves" label="Moves" align="right" sortKey={historySortKey} sortDir={historySortDir} onSort={(k) => handleHistorySort(k as HistorySortKey)} />
                          <SortTh col="date" label="Date" align="right" sortKey={historySortKey} sortDir={historySortDir} onSort={(k) => handleHistorySort(k as HistorySortKey)} />
                        </tr>
                      </thead>
                      <tbody>
                        {visibleHistory.map((entry, i) => (
                          <HistoryTableRow
                            key={`${entry.gameTo}-${entry.record.date}`}
                            entry={entry}
                            isLast={i === visibleHistory.length - 1}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile history sort toolbar */}
                  <div className="sm:hidden flex items-center gap-2 mb-3">
                    <label className="sr-only" htmlFor="mobile-history-sort-select">Sort history by</label>
                    <select
                      id="mobile-history-sort-select"
                      value={historySortKey}
                      onChange={(e) => {
                        const key = e.target.value as HistorySortKey;
                        if (key === historySortKey) return;
                        // date → desc (newest first); everything else → asc
                        const newDir: SortDir = key === "date" ? "desc" : "asc";
                        setHistorySortKey(key);
                        setHistorySortDir(newDir);
                        persistHistorySort(key, newDir);
                      }}
                      className="flex-1 rounded-lg px-3 py-2 text-sm font-medium appearance-none cursor-pointer transition"
                      style={{
                        background: "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
                        border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="date">Date</option>
                      <option value="game">Game (A–Z)</option>
                      <option value="result">Result</option>
                      <option value="time">Time</option>
                      <option value="moves">Moves</option>
                    </select>
                    <button
                      aria-label={historySortDir === "asc" ? "Sort descending" : "Sort ascending"}
                      onClick={() => {
                        const newDir: SortDir = historySortDir === "asc" ? "desc" : "asc";
                        setHistorySortDir(newDir);
                        persistHistorySort(historySortKey, newDir);
                      }}
                      className="rounded-lg px-3 py-2 text-sm font-semibold transition shrink-0"
                      style={{
                        background: "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
                        border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
                        color: "var(--neon)",
                      }}
                    >
                      {historySortDir === "asc" ? "↑" : "↓"}
                    </button>
                  </div>

                  {/* Mobile history cards */}
                  <div className="sm:hidden space-y-2">
                    {visibleHistory.map((entry) => (
                      <HistoryMobileRow
                        key={`${entry.gameTo}-${entry.record.date}`}
                        entry={entry}
                      />
                    ))}
                  </div>

                  {/* Show more */}
                  {hasMore && (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setHistoryLimit((n) => n + 25)}
                        className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                        style={{
                          background: "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
                          border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
                          color: "var(--neon)",
                        }}
                      >
                        Show more
                        <span className="ml-1.5 text-xs font-normal opacity-70">
                          ({filteredHistory.length - historyLimit} remaining)
                        </span>
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        );
      })()}

      {/* Export / Import */}
      {hydrated && <ExportImportControls onImported={() => setRows(loadRows())} />}

      <p className="mt-5 text-xs text-muted-foreground">
        Stats are stored locally in your browser and never leave your device.
      </p>

      <SiteFooter showBackLink={false} />
    </main>
  );
}

/* ── Sortable column header ───────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortTh({
  col,
  label,
  align,
  sortKey,
  sortDir,
  onSort,
}: {
  col: string;
  label: string;
  align: "left" | "right";
  sortKey: string;
  sortDir: SortDir;
  onSort: (key: string) => void;
}) {
  const active = col === sortKey;
  const arrow = active ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <th
      className={`px-5 py-3 font-semibold cursor-pointer select-none whitespace-nowrap transition-opacity hover:opacity-80 ${align === "right" ? "text-right" : "text-left"}`}
      onClick={() => onSort(col)}
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      style={{ userSelect: "none" }}
    >
      {label}
      <span aria-hidden className="ml-0.5 tabular-nums">
        {arrow}
      </span>
    </th>
  );
}

/* ── Summary card ─────────────────────────────────────────────────────────── */

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-4 py-4 flex flex-col gap-1"
      style={{
        background: "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
        border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
      }}
    >
      <span
        className="text-2xl font-bold tabular-nums"
        style={{ color: "var(--neon)" }}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/* ── Desktop table row ────────────────────────────────────────────────────── */

function TableRow({
  row,
  isLast,
  highlighted,
  expanded,
  onToggleExpand,
  drilldownDailyOnly,
  onToggleDrilldownDailyOnly,
  rowRef,
}: {
  row: GameRow;
  isLast: boolean;
  highlighted?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  drilldownDailyOnly?: boolean;
  onToggleDrilldownDailyOnly?: () => void;
  rowRef?: (el: HTMLTableRowElement | null) => void;
}) {
  const { stats } = row;
  const hasPlayed = stats.gamesPlayed > 0;
  const hasHistory = stats.history.length > 0;
  const hasDailyGames = stats.history.some((r) => r.isDaily);
  const drilldownHistory = drilldownDailyOnly
    ? stats.history.filter((r) => r.isDaily)
    : stats.history;
  const winRate = getWinRate(stats);
  const showBorder = !isLast || expanded;

  return (
    <>
      <tr
        ref={rowRef}
        className={`transition-colors hover:bg-white/[0.03]${highlighted ? " stats-row-highlighted" : ""}`}
        style={
          showBorder
            ? { borderBottom: "1px solid color-mix(in oklab, var(--neon) 8%, transparent)" }
            : undefined
        }
      >
        {/* Game name + expand toggle */}
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <Link
              to={row.to as "/klondike"}
              className="flex items-center gap-2 font-medium text-foreground hover:underline underline-offset-2 transition"
            >
              <span>{row.emoji}</span>
              <span>{row.title}</span>
            </Link>
            {hasHistory && (
              <button
                onClick={onToggleExpand}
                aria-label={expanded ? `Collapse ${row.title} history` : `Expand ${row.title} history`}
                aria-expanded={expanded}
                className="ml-1 flex items-center justify-center rounded transition-opacity hover:opacity-80"
                style={{ color: "var(--muted-foreground)", lineHeight: 1 }}
              >
                <span
                  className="text-xs transition-transform duration-200 inline-block"
                  style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  ▾
                </span>
              </button>
            )}
          </div>
        </td>

        {/* Played */}
        <td
          className="px-4 py-3 text-right tabular-nums"
          style={{ color: hasPlayed ? "var(--foreground)" : "var(--muted-foreground)" }}
        >
          {hasPlayed ? stats.gamesPlayed : "—"}
        </td>

        {/* Wins */}
        <td
          className="px-4 py-3 text-right tabular-nums"
          style={{ color: hasPlayed ? "var(--foreground)" : "var(--muted-foreground)" }}
        >
          {hasPlayed ? stats.wins : "—"}
        </td>

        {/* Win rate */}
        <td
          className="px-4 py-3 text-right tabular-nums font-semibold"
          style={{ color: hasPlayed ? "var(--neon)" : "var(--muted-foreground)" }}
        >
          {hasPlayed ? `${winRate}%` : "—"}
        </td>

        {/* Best time */}
        <td
          className="px-4 py-3 text-right tabular-nums"
          style={{
            color: stats.bestTime != null ? "var(--foreground)" : "var(--muted-foreground)",
          }}
        >
          {stats.bestTime != null ? formatStatTime(stats.bestTime) : "—"}
        </td>

        {/* Longest streak */}
        <td className="px-4 py-3 text-right tabular-nums">
          <span
            style={{
              color: stats.longestStreak > 0 ? "var(--neon)" : "var(--muted-foreground)",
            }}
          >
            {stats.longestStreak > 0 ? `🔥 ${stats.longestStreak}` : "—"}
          </span>
        </td>
      </tr>

      {/* Expanded history — full-width colspan panel with its own labelled columns */}
      {expanded && hasHistory && (
        <tr
          style={{
            background: "color-mix(in oklab, var(--neon) 3%, oklch(0.14 0.03 155))",
            borderBottom: !isLast
              ? "1px solid color-mix(in oklab, var(--neon) 8%, transparent)"
              : undefined,
          }}
        >
          <td colSpan={6} className="px-6 py-3">
            {/* Section label + Daily only toggle */}
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-[10px] uppercase tracking-[0.18em] font-semibold"
                style={{ color: "color-mix(in oklab, var(--neon) 55%, white)" }}
              >
                {row.title} — last {stats.history.length} game{stats.history.length !== 1 ? "s" : ""}
              </p>
              {(hasDailyGames || drilldownDailyOnly) && (
                <button
                  onClick={onToggleDrilldownDailyOnly}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold transition"
                  style={{
                    background: drilldownDailyOnly
                      ? "color-mix(in oklab, var(--neon) 22%, oklch(0.16 0.03 155))"
                      : "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
                    border: `1px solid color-mix(in oklab, var(--neon) ${drilldownDailyOnly ? "40%" : "16%"}, transparent)`,
                    color: drilldownDailyOnly ? "var(--neon)" : "var(--muted-foreground)",
                  }}
                  aria-pressed={drilldownDailyOnly}
                >
                  <span>📅</span>
                  <span>Daily only</span>
                </button>
              )}
            </div>

            {/* Self-contained mini-table with its own column headers */}
            {drilldownHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">No daily challenge games recorded yet.</p>
            ) : (
              <table className="w-full text-xs" data-testid={`history-table-${row.saveKey}`}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid color-mix(in oklab, var(--neon) 10%, transparent)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    <th className="pb-1.5 pr-4 text-left font-semibold">Result</th>
                    <th className="pb-1.5 px-4 text-right font-semibold">Time</th>
                    <th className="pb-1.5 px-4 text-right font-semibold">Moves</th>
                    <th className="pb-1.5 pl-4 text-right font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {drilldownHistory.map((record, i) => {
                    const isLastHistory = i === drilldownHistory.length - 1;
                    const dateStr = new Date(record.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    return (
                      <tr
                        key={record.date}
                        className="transition-colors hover:bg-white/[0.02]"
                        style={
                          !isLastHistory
                            ? { borderBottom: "1px solid color-mix(in oklab, var(--neon) 7%, transparent)" }
                            : undefined
                        }
                      >
                        {/* Result + daily badge */}
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-semibold"
                              style={{ color: record.won ? "var(--neon)" : "var(--muted-foreground)" }}
                            >
                              {record.won ? "✓ Win" : "✗ Loss"}
                            </span>
                            {record.isDaily && <DailyBadge />}
                          </div>
                        </td>
                        {/* Time */}
                        <td className="py-2 px-4 text-right tabular-nums" style={{ color: "var(--foreground)" }}>
                          {record.won && record.durationSeconds > 0
                            ? formatStatTime(record.durationSeconds)
                            : "—"}
                        </td>
                        {/* Moves */}
                        <td className="py-2 px-4 text-right tabular-nums" style={{ color: "var(--foreground)" }}>
                          {record.moves > 0 ? record.moves : "—"}
                        </td>
                        {/* Date */}
                        <td className="py-2 pl-4 text-right" style={{ color: "var(--muted-foreground)" }}>
                          {dateStr}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Daily badge ──────────────────────────────────────────────────────────── */

function DailyBadge() {
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none"
      style={{
        background: "color-mix(in oklab, var(--neon) 18%, oklch(0.16 0.03 155))",
        border: "1px solid color-mix(in oklab, var(--neon) 35%, transparent)",
        color: "var(--neon)",
      }}
    >
      📅 Daily
    </span>
  );
}

/* ── History table row (desktop) ──────────────────────────────────────────── */

function HistoryTableRow({ entry, isLast }: { entry: HistoryEntry; isLast: boolean }) {
  const { record, gameTitle, gameEmoji, gameTo } = entry;
  const dateStr = new Date(record.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <tr
      className="transition-colors hover:bg-white/[0.03]"
      style={
        !isLast
          ? { borderBottom: "1px solid color-mix(in oklab, var(--neon) 8%, transparent)" }
          : undefined
      }
    >
      {/* Game */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={gameTo as "/klondike"}
            className="flex items-center gap-1.5 font-medium text-foreground hover:underline underline-offset-2 transition"
          >
            <span>{gameEmoji}</span>
            <span>{gameTitle}</span>
          </Link>
          {record.isDaily && <DailyBadge />}
        </div>
      </td>

      {/* Result */}
      <td className="px-4 py-3">
        <span
          className="text-xs font-semibold"
          style={{ color: record.won ? "var(--neon)" : "var(--muted-foreground)" }}
        >
          {record.won ? "Win" : "Loss"}
        </span>
      </td>

      {/* Time */}
      <td className="px-4 py-3 text-right tabular-nums text-sm" style={{ color: "var(--foreground)" }}>
        {record.won && record.durationSeconds > 0
          ? formatStatTime(record.durationSeconds)
          : "—"}
      </td>

      {/* Moves */}
      <td className="px-4 py-3 text-right tabular-nums text-sm" style={{ color: "var(--foreground)" }}>
        {record.moves > 0 ? record.moves : "—"}
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-right text-xs" style={{ color: "var(--muted-foreground)" }}>
        {dateStr}
      </td>
    </tr>
  );
}

/* ── History mobile row ───────────────────────────────────────────────────── */

function HistoryMobileRow({ entry }: { entry: HistoryEntry }) {
  const { record, gameTitle, gameEmoji, gameTo } = entry;
  const dateStr = new Date(record.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: "color-mix(in oklab, var(--neon) 4%, oklch(0.16 0.03 155))",
        border: "1px solid color-mix(in oklab, var(--neon) 14%, transparent)",
      }}
    >
      {/* Top row: game name + daily badge + result */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <Link
            to={gameTo as "/klondike"}
            className="flex items-center gap-1.5 font-medium text-foreground hover:underline underline-offset-2 text-sm truncate"
          >
            <span>{gameEmoji}</span>
            <span>{gameTitle}</span>
          </Link>
          {record.isDaily && <DailyBadge />}
        </div>
        <span
          className="text-xs font-semibold shrink-0"
          style={{ color: record.won ? "var(--neon)" : "var(--muted-foreground)" }}
        >
          {record.won ? "Win" : "Loss"}
        </span>
      </div>

      {/* Bottom row: time + moves + date */}
      <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
        {record.won && record.durationSeconds > 0 ? (
          <span className="tabular-nums" style={{ color: "var(--foreground)" }}>
            {formatStatTime(record.durationSeconds)}
          </span>
        ) : (
          <span>—</span>
        )}
        {record.moves > 0 ? (
          <span className="tabular-nums" style={{ color: "var(--foreground)" }}>
            {record.moves} moves
          </span>
        ) : (
          <span>— moves</span>
        )}
        <span className="ml-auto">{dateStr}</span>
      </div>
    </div>
  );
}

/* ── Export / Import controls ─────────────────────────────────────────────── */

function ExportImportControls({ onImported }: { onImported: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importBtnRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  // Pending import: hold parsed data until the player confirms
  const [pendingImport, setPendingImport] = useState<{ data: unknown; count: number } | null>(null);

  // Close modal on Escape
  useEffect(() => {
    if (!pendingImport) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleCancelImport();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingImport]);

  function handleExport() {
    downloadStatsExport();
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be picked again after an error
    e.target.value = "";
    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;
      // Validate the file and count games without writing yet
      const { games } = data as { games: Record<string, unknown> };
      if (
        typeof data !== "object" ||
        data === null ||
        (data as { version?: number }).version !== 1 ||
        typeof games !== "object" ||
        games === null
      ) {
        throw new Error("Invalid stats file — please use a file exported from Solitaire Station.");
      }
      const count = Object.keys(games).length;
      setPendingImport({ data, count });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not read the file.",
      });
      setTimeout(() => setStatus(null), 5000);
    }
  }

  function handleConfirmImport() {
    if (!pendingImport) return;
    setPendingImport(null);
    try {
      const count = importStatsFromExport(pendingImport.data);
      onImported();
      setStatus({ kind: "success", message: `Imported stats for ${count} game${count !== 1 ? "s" : ""}.` });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not import the file.",
      });
    }
    setTimeout(() => setStatus(null), 5000);
  }

  function handleCancelImport() {
    setPendingImport(null);
    // Return focus to the trigger button
    importBtnRef.current?.focus();
  }

  return (
    <>
      {/* Confirmation modal */}
      {pendingImport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-confirm-title"
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{
              background: "oklch(0.16 0.03 155)",
              border: "1px solid color-mix(in oklab, var(--neon) 28%, transparent)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
            }}
          >
            <h3
              id="import-confirm-title"
              className="text-base font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Replace your stats?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This will overwrite your existing stats for{" "}
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                {pendingImport.count} game{pendingImport.count !== 1 ? "s" : ""}
              </span>
              . Any progress not in the imported file will be lost.
            </p>
            <div className="flex gap-3 justify-end mt-1">
              <button
                onClick={handleCancelImport}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                style={{
                  background: "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
                  border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
                  color: "var(--muted-foreground)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                style={{
                  background: "color-mix(in oklab, var(--neon) 18%, oklch(0.16 0.03 155))",
                  border: "1px solid color-mix(in oklab, var(--neon) 40%, transparent)",
                  color: "var(--neon)",
                }}
              >
                Yes, import
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-3">
        <h2
          className="text-lg font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Backup &amp; Restore
        </h2>
        <p className="text-xs text-muted-foreground">
          Export your stats to a file you can keep as a backup or load on another device.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition"
            style={{
              background: "color-mix(in oklab, var(--neon) 14%, oklch(0.16 0.03 155))",
              border: "1px solid color-mix(in oklab, var(--neon) 35%, transparent)",
              color: "var(--neon)",
            }}
          >
            ↓ Export stats
          </button>
          <button
            ref={importBtnRef}
            onClick={handleImportClick}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition"
            style={{
              background: "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
              border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
              color: "var(--muted-foreground)",
            }}
          >
            ↑ Import stats
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {status && (
          <p
            className="text-xs font-medium"
            style={{ color: status.kind === "success" ? "var(--neon)" : "oklch(0.75 0.18 25)" }}
          >
            {status.kind === "success" ? "✓ " : "✗ "}
            {status.message}
          </p>
        )}
      </div>
    </>
  );
}

/* ── Mobile card ──────────────────────────────────────────────────────────── */

function MobileCard({
  row,
  highlighted,
  expanded,
  onToggleExpand,
  drilldownDailyOnly,
  onToggleDrilldownDailyOnly,
  rowRef,
}: {
  row: GameRow;
  highlighted?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  drilldownDailyOnly?: boolean;
  onToggleDrilldownDailyOnly?: () => void;
  rowRef?: (el: HTMLDivElement | null) => void;
}) {
  const { stats } = row;
  const hasPlayed = stats.gamesPlayed > 0;
  const hasHistory = stats.history.length > 0;
  const hasDailyGames = stats.history.some((r) => r.isDaily);
  const drilldownHistory = drilldownDailyOnly
    ? stats.history.filter((r) => r.isDaily)
    : stats.history;
  const winRate = getWinRate(stats);

  return (
    <div
      ref={rowRef}
      className={`rounded-xl px-4 py-3${highlighted ? " stats-row-highlighted" : ""}`}
      style={{
        background: "color-mix(in oklab, var(--neon) 4%, oklch(0.16 0.03 155))",
        border: "1px solid color-mix(in oklab, var(--neon) 14%, transparent)",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <Link
          to={row.to as "/klondike"}
          className="flex items-center gap-2 font-semibold text-foreground hover:underline underline-offset-2"
        >
          <span>{row.emoji}</span>
          <span>{row.title}</span>
        </Link>
        {hasPlayed && (
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: "var(--neon)" }}
          >
            {winRate}%
          </span>
        )}
      </div>

      {/* Stat pills */}
      {hasPlayed ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{stats.gamesPlayed}</span> played
          </span>
          <span>
            <span className="font-semibold text-foreground">{stats.wins}</span> wins
          </span>
          {stats.bestTime != null && (
            <span>
              Best{" "}
              <span className="font-semibold text-foreground">
                {formatStatTime(stats.bestTime)}
              </span>
            </span>
          )}
          {stats.longestStreak > 0 && (
            <span>
              🔥{" "}
              <span className="font-semibold text-foreground">
                {stats.longestStreak}
              </span>{" "}
              streak
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No games played yet</p>
      )}

      {/* Expand/collapse history toggle */}
      {hasHistory && (
        <button
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse ${row.title} history` : `Show ${row.title} history`}
          className="mt-2.5 flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: "var(--muted-foreground)" }}
        >
          <span
            className="transition-transform duration-200 inline-block"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ▾
          </span>
          {expanded
            ? "Hide history"
            : `Show history (${stats.history.length})`}
        </button>
      )}

      {/* Inline history entries */}
      {expanded && hasHistory && (
        <div
          className="mt-2 -mx-4 px-4 pt-2 pb-1 space-y-2"
          style={{
            borderTop: "1px solid color-mix(in oklab, var(--neon) 10%, transparent)",
            background: "color-mix(in oklab, var(--neon) 2%, oklch(0.14 0.03 155))",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[10px] uppercase tracking-[0.18em] font-semibold"
              style={{ color: "color-mix(in oklab, var(--neon) 55%, white)" }}
            >
              Last {stats.history.length} game{stats.history.length !== 1 ? "s" : ""}
            </p>
            {(hasDailyGames || drilldownDailyOnly) && (
              <button
                onClick={onToggleDrilldownDailyOnly}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold transition"
                style={{
                  background: drilldownDailyOnly
                    ? "color-mix(in oklab, var(--neon) 22%, oklch(0.16 0.03 155))"
                    : "color-mix(in oklab, var(--neon) 6%, oklch(0.16 0.03 155))",
                  border: `1px solid color-mix(in oklab, var(--neon) ${drilldownDailyOnly ? "40%" : "16%"}, transparent)`,
                  color: drilldownDailyOnly ? "var(--neon)" : "var(--muted-foreground)",
                }}
                aria-pressed={drilldownDailyOnly}
              >
                <span>📅</span>
                <span>Daily only</span>
              </button>
            )}
          </div>
          {drilldownHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">No daily challenge games recorded yet.</p>
          ) : drilldownHistory.map((record) => {
            const dateStr = new Date(record.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            return (
              <div
                key={record.date}
                className="flex items-center justify-between gap-2 py-1.5"
                style={{
                  borderBottom: "1px solid color-mix(in oklab, var(--neon) 7%, transparent)",
                }}
              >
                {/* Left: result + daily badge */}
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span
                    className="text-xs font-semibold shrink-0"
                    style={{ color: record.won ? "var(--neon)" : "var(--muted-foreground)" }}
                  >
                    {record.won ? "✓ Win" : "✗ Loss"}
                  </span>
                  {record.isDaily && <DailyBadge />}
                </div>
                {/* Right: time/moves + date */}
                <div className="flex items-center gap-3 shrink-0 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {record.won && record.durationSeconds > 0 && (
                    <span className="tabular-nums" style={{ color: "var(--foreground)" }}>
                      {formatStatTime(record.durationSeconds)}
                    </span>
                  )}
                  {record.moves > 0 && (
                    <span className="tabular-nums" style={{ color: "var(--foreground)" }}>
                      {record.moves}m
                    </span>
                  )}
                  <span>{dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
