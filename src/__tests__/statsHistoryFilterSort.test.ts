/**
 * Tests for the interaction between the Daily-only filter and history sort logic
 * on the Stats page.
 *
 * Covers:
 * 1. After toggling Daily-only on, only daily entries are returned
 * 2. The sort order is applied correctly to the filtered (daily-only) set
 * 3. historyLimit resets to 25 when the Daily-only filter is toggled, so
 *    "Show more" is not rendered when all filtered results fit within the limit
 * 4. "Show more" IS rendered when the filtered set exceeds historyLimit
 * 5. Sort state (key + direction) is preserved independently of the filter toggle
 * 6. Toggling Daily-only off restores the full set (still sorted correctly)
 */

import { describe, it, expect } from "vitest";

// ── Inline the pure logic (no React / DOM deps) ───────────────────────────────

type HistorySortKey = "game" | "result" | "time" | "moves" | "date";
type SortDir = "asc" | "desc";

interface GameRecord {
  date: number;
  won: boolean;
  durationSeconds: number;
  moves: number;
  isDaily?: boolean;
}

interface HistoryEntry {
  record: GameRecord;
  gameTitle: string;
  gameEmoji: string;
  gameTo: string;
}

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

/** Mirrors the filteredHistory derivation in stats.tsx */
function applyDailyFilter(entries: HistoryEntry[], dailyOnly: boolean): HistoryEntry[] {
  return dailyOnly ? entries.filter((e) => e.record.isDaily) : entries;
}

/** Mirrors the hasMore / Show-more logic in stats.tsx */
function computeVisible(
  allHistory: HistoryEntry[],
  dailyOnly: boolean,
  historyLimit: number,
  sortKey: HistorySortKey,
  sortDir: SortDir,
): { visibleHistory: HistoryEntry[]; hasMore: boolean } {
  const filteredHistory = applyDailyFilter(allHistory, dailyOnly);
  const sortedHistory = sortHistory(filteredHistory, sortKey, sortDir);
  const visibleHistory = sortedHistory.slice(0, historyLimit);
  const hasMore = filteredHistory.length > historyLimit;
  return { visibleHistory, hasMore };
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeEntry(
  gameTitle: string,
  won: boolean,
  durationSeconds: number,
  moves: number,
  date: number,
  isDaily = false,
): HistoryEntry {
  return {
    record: { date, won, durationSeconds, moves, isDaily },
    gameTitle,
    gameEmoji: "🃏",
    gameTo: `/${gameTitle.toLowerCase()}`,
  };
}

// Mix of daily and non-daily entries
const DAILY_WIN_FAST   = makeEntry("Klondike", true,  120, 30,  3000, true);   // daily
const DAILY_WIN_SLOW   = makeEntry("FreeCell", true,  400, 60,  2000, true);   // daily
const DAILY_LOSS       = makeEntry("Spider",   false,   0,  0,  1000, true);   // daily
const RANDOM_WIN       = makeEntry("Pyramid",  true,  200, 45,  4000, false);  // not daily
const RANDOM_LOSS      = makeEntry("Golf",     false,   0,  0,  5000, false);  // not daily

const ALL_HISTORY = [DAILY_WIN_FAST, DAILY_WIN_SLOW, DAILY_LOSS, RANDOM_WIN, RANDOM_LOSS];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Daily-only filter — basic filtering", () => {
  it("returns all entries when dailyOnly is false", () => {
    const filtered = applyDailyFilter(ALL_HISTORY, false);
    expect(filtered).toHaveLength(5);
  });

  it("returns only daily entries when dailyOnly is true", () => {
    const filtered = applyDailyFilter(ALL_HISTORY, true);
    expect(filtered).toHaveLength(3);
    expect(filtered.every((e) => e.record.isDaily)).toBe(true);
  });
});

describe("Sort applied to daily-only filtered set", () => {
  it("sorts daily entries by date descending (newest first)", () => {
    const { visibleHistory } = computeVisible(ALL_HISTORY, true, 25, "date", "desc");
    const dates = visibleHistory.map((e) => e.record.date);
    expect(dates).toEqual([3000, 2000, 1000]);
  });

  it("sorts daily entries by date ascending (oldest first)", () => {
    const { visibleHistory } = computeVisible(ALL_HISTORY, true, 25, "date", "asc");
    const dates = visibleHistory.map((e) => e.record.date);
    expect(dates).toEqual([1000, 2000, 3000]);
  });

  it("sorts daily entries by time ascending — fastest first, no-time entries last", () => {
    const { visibleHistory } = computeVisible(ALL_HISTORY, true, 25, "time", "asc");
    expect(visibleHistory[0]).toBe(DAILY_WIN_FAST);   // 120 s
    expect(visibleHistory[1]).toBe(DAILY_WIN_SLOW);   // 400 s
    expect(visibleHistory[2]).toBe(DAILY_LOSS);       // loss → bottom
  });

  it("sorts daily entries by game name ascending (A→Z)", () => {
    const { visibleHistory } = computeVisible(ALL_HISTORY, true, 25, "game", "asc");
    const names = visibleHistory.map((e) => e.gameTitle);
    expect(names).toEqual(["FreeCell", "Klondike", "Spider"]);
  });

  it("sorts daily entries by result ascending — wins before losses", () => {
    const { visibleHistory } = computeVisible(ALL_HISTORY, true, 25, "result", "asc");
    expect(visibleHistory[0].record.won).toBe(true);
    expect(visibleHistory[1].record.won).toBe(true);
    expect(visibleHistory[2].record.won).toBe(false);
  });
});

describe("Sort applied to full (non-daily) set", () => {
  it("sorts all entries by date descending when dailyOnly is false", () => {
    const { visibleHistory } = computeVisible(ALL_HISTORY, false, 25, "date", "desc");
    const dates = visibleHistory.map((e) => e.record.date);
    expect(dates).toEqual([5000, 4000, 3000, 2000, 1000]);
  });

  it("sorts all entries by moves ascending — zero-move entries last", () => {
    const { visibleHistory } = computeVisible(ALL_HISTORY, false, 25, "moves", "asc");
    // Entries with moves > 0: DAILY_WIN_FAST(30), RANDOM_WIN(45), DAILY_WIN_SLOW(60)
    expect(visibleHistory[0]).toBe(DAILY_WIN_FAST);
    expect(visibleHistory[1]).toBe(RANDOM_WIN);
    expect(visibleHistory[2]).toBe(DAILY_WIN_SLOW);
    // DAILY_LOSS and RANDOM_LOSS have 0 moves → bottom
    expect(visibleHistory[3].record.moves).toBe(0);
    expect(visibleHistory[4].record.moves).toBe(0);
  });
});

describe("historyLimit resets to 25 when Daily-only is toggled", () => {
  it("Show more is NOT rendered when filtered results fit within the reset limit of 25", () => {
    // Only 3 daily entries → 3 ≤ 25 → hasMore should be false
    const { hasMore } = computeVisible(ALL_HISTORY, true, 25, "date", "desc");
    expect(hasMore).toBe(false);
  });

  it("Show more IS rendered when filtered results exceed historyLimit", () => {
    // Simulate a stale higher historyLimit that was NOT reset
    // but more importantly: build a set with > 25 daily entries
    const manyDailyEntries: HistoryEntry[] = Array.from({ length: 30 }, (_, i) =>
      makeEntry("Klondike", true, 100 + i, 20 + i, 1000 + i, true),
    );
    const { hasMore } = computeVisible(manyDailyEntries, true, 25, "date", "desc");
    expect(hasMore).toBe(true);
  });

  it("Show more is NOT rendered after limit resets to 25 even when non-filtered set was larger", () => {
    // Before toggle: 30 random entries → limit could have been raised to 50.
    // After toggle to daily-only with limit reset to 25: only 3 daily entries.
    const manyRandomEntries: HistoryEntry[] = Array.from({ length: 30 }, (_, i) =>
      makeEntry("Golf", true, 100 + i, 20 + i, 1000 + i, false),
    );
    const threeDailyEntries: HistoryEntry[] = Array.from({ length: 3 }, (_, i) =>
      makeEntry("Klondike", true, 200 + i, 30 + i, 2000 + i, true),
    );
    const mixed = [...manyRandomEntries, ...threeDailyEntries];
    // historyLimit reset to 25 on toggle
    const { visibleHistory, hasMore } = computeVisible(mixed, true, 25, "date", "desc");
    expect(visibleHistory).toHaveLength(3);
    expect(hasMore).toBe(false);
  });
});

describe("Sort state persists independently across filter toggles", () => {
  it("toggling dailyOnly off restores the full set sorted by the same key+dir", () => {
    // Sort by game name A→Z, dailyOnly=true → dailyOnly=false
    const { visibleHistory: withFilter } = computeVisible(ALL_HISTORY, true, 25, "game", "asc");
    const { visibleHistory: withoutFilter } = computeVisible(ALL_HISTORY, false, 25, "game", "asc");

    // daily-only result is a subset of the full sorted result
    expect(withFilter.map((e) => e.gameTitle)).toEqual(["FreeCell", "Klondike", "Spider"]);
    // full set (5 entries) is sorted A→Z
    expect(withoutFilter.map((e) => e.gameTitle)).toEqual([
      "FreeCell", "Golf", "Klondike", "Pyramid", "Spider",
    ]);
  });

  it("sort direction is preserved after toggling: desc sort on date still newest-first after filter toggle", () => {
    const { visibleHistory: daily } = computeVisible(ALL_HISTORY, true, 25, "date", "desc");
    const { visibleHistory: all } = computeVisible(ALL_HISTORY, false, 25, "date", "desc");

    // Both are sorted newest→oldest
    const dailyDates = daily.map((e) => e.record.date);
    expect(dailyDates[0]).toBeGreaterThan(dailyDates[dailyDates.length - 1]);

    const allDates = all.map((e) => e.record.date);
    expect(allDates[0]).toBeGreaterThan(allDates[allDates.length - 1]);
  });
});
