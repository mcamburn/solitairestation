/**
 * Tests for the history sort logic in the Stats page.
 *
 * Covers:
 * 1. Sorting by game name (asc/desc)
 * 2. Sorting by result — wins before losses ascending
 * 3. Sorting by time — fastest first ascending, unavailable (loss / no time) always last
 * 4. Sorting by moves — fewest first ascending, unavailable always last
 * 5. Sorting by date — newest first descending
 * 6. Direction toggle (asc ↔ desc) for all keys
 * 7. Entries with both time and moves unavailable sort stably to bottom
 */

import { describe, it, expect } from "vitest";

// ── Inline the pure sort logic so the test has no React/DOM deps ─────────────

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

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeEntry(
  gameTitle: string,
  won: boolean,
  durationSeconds: number,
  moves: number,
  date: number,
): HistoryEntry {
  return {
    record: { date, won, durationSeconds, moves },
    gameTitle,
    gameEmoji: "🃏",
    gameTo: `/${gameTitle.toLowerCase()}`,
  };
}

const WIN_FAST  = makeEntry("Klondike", true,  120, 30, 1000);
const WIN_SLOW  = makeEntry("Klondike", true,  300, 80, 2000);
const LOSS_NONE = makeEntry("FreeCell", false, 0,   0,  3000); // no time/moves
const WIN_MOVES = makeEntry("Spider",   true,  200, 10, 500);  // fewest moves

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("sortHistory — game", () => {
  it("sorts A→Z ascending", () => {
    const result = sortHistory([LOSS_NONE, WIN_FAST, WIN_MOVES], "game", "asc");
    expect(result.map((e) => e.gameTitle)).toEqual(["FreeCell", "Klondike", "Spider"]);
  });

  it("sorts Z→A descending", () => {
    const result = sortHistory([LOSS_NONE, WIN_FAST, WIN_MOVES], "game", "desc");
    expect(result.map((e) => e.gameTitle)).toEqual(["Spider", "Klondike", "FreeCell"]);
  });
});

describe("sortHistory — result", () => {
  it("puts wins before losses ascending", () => {
    const result = sortHistory([LOSS_NONE, WIN_FAST, WIN_SLOW], "result", "asc");
    expect(result[0].record.won).toBe(true);
    expect(result[1].record.won).toBe(true);
    expect(result[2].record.won).toBe(false);
  });

  it("puts losses before wins descending", () => {
    const result = sortHistory([WIN_FAST, WIN_SLOW, LOSS_NONE], "result", "desc");
    expect(result[0].record.won).toBe(false);
  });
});

describe("sortHistory — time", () => {
  it("sorts fastest first ascending", () => {
    const result = sortHistory([WIN_SLOW, WIN_FAST, WIN_MOVES, LOSS_NONE], "time", "asc");
    const times = result.map((e) => e.record.durationSeconds);
    // fastest two wins first
    expect(times[0]).toBe(120);
    expect(times[1]).toBe(200);
    expect(times[2]).toBe(300);
  });

  it("always puts no-time entries (losses, durationSeconds=0) at the bottom ascending", () => {
    const result = sortHistory([LOSS_NONE, WIN_FAST, WIN_SLOW], "time", "asc");
    expect(result[result.length - 1]).toBe(LOSS_NONE);
  });

  it("always puts no-time entries at the bottom descending", () => {
    const result = sortHistory([LOSS_NONE, WIN_FAST, WIN_SLOW], "time", "desc");
    expect(result[result.length - 1]).toBe(LOSS_NONE);
  });

  it("slowest first descending (among entries with a time)", () => {
    const result = sortHistory([WIN_FAST, WIN_SLOW, WIN_MOVES, LOSS_NONE], "time", "desc");
    expect(result[0].record.durationSeconds).toBe(300);
    expect(result[result.length - 1]).toBe(LOSS_NONE);
  });
});

describe("sortHistory — moves", () => {
  it("sorts fewest moves first ascending", () => {
    const result = sortHistory([WIN_SLOW, WIN_FAST, WIN_MOVES, LOSS_NONE], "moves", "asc");
    expect(result[0]).toBe(WIN_MOVES); // 10 moves
    expect(result[1]).toBe(WIN_FAST);  // 30 moves
    expect(result[2]).toBe(WIN_SLOW);  // 80 moves
    expect(result[3]).toBe(LOSS_NONE); // 0 → bottom
  });

  it("always puts zero-move entries at the bottom ascending", () => {
    const result = sortHistory([LOSS_NONE, WIN_FAST], "moves", "asc");
    expect(result[result.length - 1]).toBe(LOSS_NONE);
  });

  it("always puts zero-move entries at the bottom descending", () => {
    const result = sortHistory([LOSS_NONE, WIN_FAST, WIN_SLOW], "moves", "desc");
    expect(result[result.length - 1]).toBe(LOSS_NONE);
  });
});

describe("sortHistory — date", () => {
  it("sorts newest first descending", () => {
    const result = sortHistory([WIN_FAST, WIN_SLOW, LOSS_NONE, WIN_MOVES], "date", "desc");
    const dates = result.map((e) => e.record.date);
    expect(dates).toEqual([3000, 2000, 1000, 500]);
  });

  it("sorts oldest first ascending", () => {
    const result = sortHistory([WIN_FAST, WIN_SLOW, LOSS_NONE, WIN_MOVES], "date", "asc");
    const dates = result.map((e) => e.record.date);
    expect(dates).toEqual([500, 1000, 2000, 3000]);
  });
});

describe("sortHistory — multiple unavailable", () => {
  it("groups all no-time entries at the bottom and sorts them stably", () => {
    const loss1 = makeEntry("Alpha", false, 0, 0, 100);
    const loss2 = makeEntry("Beta",  false, 0, 0, 200);
    const win   = makeEntry("Zeta",  true, 50, 5, 300);
    const result = sortHistory([loss2, win, loss1], "time", "asc");
    expect(result[0]).toBe(win);
    // Both losses are at the bottom (order between them is stable/unspecified,
    // but neither should appear before the win)
    expect(result[1].record.won).toBe(false);
    expect(result[2].record.won).toBe(false);
  });
});
