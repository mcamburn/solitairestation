import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadStats, getWinRate, formatStatTime, type GameStats } from "@/lib/stats";
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
