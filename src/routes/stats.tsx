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
  component: StatsPage,
  head: () => ({
    meta: [
      { title: "My Stats — Solitaire Station" },
      {
        name: "description",
        content:
          "View your lifetime solitaire stats: games played, win rate, best time, and longest streak across every game on Solitaire Station.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "My Stats — Solitaire Station" },
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
  // Start with default (zero) stats so SSR and first client render match.
  // Real localStorage data is loaded in the effect below.
  const [rows, setRows] = useState<GameRow[]>(buildDefaultRows);
  const [hydrated, setHydrated] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [dailyOnly, setDailyOnly] = useState(false);

  // Load real stats from localStorage after first mount (client-only)
  useEffect(() => {
    setRows(loadRows());
    setHydrated(true);
  }, []);

  // Refresh when any game records a win/loss
  useEffect(() => {
    const handler = () => setRows(loadRows());
    window.addEventListener("neon-solitaire:stats-updated", handler);
    return () =>
      window.removeEventListener("neon-solitaire:stats-updated", handler);
  }, []);

  const sorted = sortRows(rows, sortKey, sortDir);
  const totals = aggregateStats(rows);
  const overallWinRate =
    totals.gamesPlayed > 0
      ? Math.round((totals.wins / totals.gamesPlayed) * 100)
      : 0;
  const gamesWithPlays = rows.filter((r) => r.stats.gamesPlayed > 0).length;

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // For numeric columns, default descending (highest first); name → asc
      setSortDir(key === "title" ? "asc" : "desc");
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[900px] px-4 py-10 sm:py-16">
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
                <SortTh col="title" label="Game" align="left" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="gamesPlayed" label="Played" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="wins" label="Wins" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="winRate" label="Win Rate" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="bestTime" label="Best Time" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="longestStreak" label="Longest Streak" align="right" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <TableRow key={row.saveKey} row={row} isLast={i === sorted.length - 1} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-3">
          {sorted.map((row) => (
            <MobileCard key={row.saveKey} row={row} />
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
              </h2>
              <button
                onClick={() => setDailyOnly((v) => !v)}
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
            ) : (
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
                        <th className="px-5 py-3 font-semibold">Game</th>
                        <th className="px-4 py-3 font-semibold">Result</th>
                        <th className="px-4 py-3 font-semibold text-right">Time</th>
                        <th className="px-4 py-3 font-semibold text-right">Moves</th>
                        <th className="px-4 py-3 font-semibold text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((entry, i) => (
                        <HistoryTableRow
                          key={`${entry.gameTo}-${entry.record.date}`}
                          entry={entry}
                          isLast={i === filteredHistory.length - 1}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile history cards */}
                <div className="sm:hidden space-y-2">
                  {filteredHistory.map((entry) => (
                    <HistoryMobileRow
                      key={`${entry.gameTo}-${entry.record.date}`}
                      entry={entry}
                    />
                  ))}
                </div>
              </>
            )}
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

function SortTh({
  col,
  label,
  align,
  sortKey,
  sortDir,
  onSort,
}: {
  col: SortKey;
  label: string;
  align: "left" | "right";
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
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

function TableRow({ row, isLast }: { row: GameRow; isLast: boolean }) {
  const { stats } = row;
  const hasPlayed = stats.gamesPlayed > 0;
  const winRate = getWinRate(stats);

  return (
    <tr
      className="transition-colors hover:bg-white/[0.03]"
      style={
        !isLast
          ? { borderBottom: "1px solid color-mix(in oklab, var(--neon) 8%, transparent)" }
          : undefined
      }
    >
      {/* Game name */}
      <td className="px-5 py-3">
        <Link
          to={row.to as "/klondike"}
          className="flex items-center gap-2 font-medium text-foreground hover:underline underline-offset-2 transition"
        >
          <span>{row.emoji}</span>
          <span>{row.title}</span>
        </Link>
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
      className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
      style={{
        background: "color-mix(in oklab, var(--neon) 4%, oklch(0.16 0.03 155))",
        border: "1px solid color-mix(in oklab, var(--neon) 14%, transparent)",
      }}
    >
      {/* Left: game + badges */}
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

      {/* Right: result + date */}
      <div className="flex items-center gap-3 shrink-0 text-xs">
        <span
          className="font-semibold"
          style={{ color: record.won ? "var(--neon)" : "var(--muted-foreground)" }}
        >
          {record.won ? "Win" : "Loss"}
        </span>
        <span style={{ color: "var(--muted-foreground)" }}>{dateStr}</span>
      </div>
    </div>
  );
}

/* ── Export / Import controls ─────────────────────────────────────────────── */

function ExportImportControls({ onImported }: { onImported: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);

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
      const count = importStatsFromExport(data);
      onImported();
      setStatus({ kind: "success", message: `Imported stats for ${count} game${count !== 1 ? "s" : ""}.` });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not read the file.",
      });
    }
    // Auto-clear after 5 s
    setTimeout(() => setStatus(null), 5000);
  }

  return (
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
  );
}

/* ── Mobile card ──────────────────────────────────────────────────────────── */

function MobileCard({ row }: { row: GameRow }) {
  const { stats } = row;
  const hasPlayed = stats.gamesPlayed > 0;
  const winRate = getWinRate(stats);

  return (
    <div
      className="rounded-xl px-4 py-3"
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
    </div>
  );
}
