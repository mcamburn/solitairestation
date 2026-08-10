/**
 * Tests for importStatsFromExport validation.
 *
 * Covers:
 *  - Invalid JSON / non-object input
 *  - Wrong version number
 *  - Missing or non-object `games` key
 *  - Negative numeric fields
 *  - wins > gamesPlayed
 *  - Malformed history entries (missing required fields)
 *  - Valid data imports cleanly
 *  - Corrupted per-game entries are skipped, valid ones still import
 */

import { describe, it, expect, beforeEach } from "vitest";
import { importStatsFromExport, mergeStats, loadStats, recordWin, recordLoss } from "./stats";
import type { StatsExport, GameStats } from "./stats";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validStats(overrides: Partial<GameStats> = {}): GameStats {
  return {
    gamesPlayed: 10,
    wins: 7,
    losses: 3,
    currentStreak: 2,
    longestStreak: 5,
    bestTime: 120,
    bestMoves: 30,
    avgTime: 180,
    avgMoves: 40,
    lastPlayedAt: 1_700_000_000_000,
    bestRun: 0,
    history: [
      {
        date: 1_700_000_000_000,
        won: true,
        moves: 30,
        durationSeconds: 120,
        isDaily: false,
      },
    ],
    ...overrides,
  };
}

function validExport(overrides: Partial<StatsExport> = {}): StatsExport {
  return {
    version: 1,
    exportedAt: Date.now(),
    games: { klondike: validStats() },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Top-level structure validation (throws)
// ---------------------------------------------------------------------------

describe("importStatsFromExport – top-level structure", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("throws on null input", () => {
    expect(() => importStatsFromExport(null)).toThrow();
  });

  it("throws on a plain string", () => {
    expect(() => importStatsFromExport("not an object")).toThrow();
  });

  it("throws on a number", () => {
    expect(() => importStatsFromExport(42)).toThrow();
  });

  it("throws when version is missing", () => {
    expect(() => importStatsFromExport({ games: {} })).toThrow();
  });

  it("throws when version is 0", () => {
    expect(() => importStatsFromExport({ version: 0, games: {} })).toThrow();
  });

  it("throws when version is 2 (future version)", () => {
    expect(() => importStatsFromExport({ version: 2, games: {} })).toThrow();
  });

  it("throws when version is a string", () => {
    expect(() => importStatsFromExport({ version: "1", games: {} })).toThrow();
  });

  it("throws when games key is missing", () => {
    expect(() => importStatsFromExport({ version: 1, exportedAt: 0 })).toThrow();
  });

  it("throws when games is null", () => {
    expect(() => importStatsFromExport({ version: 1, games: null })).toThrow();
  });

  it("throws when games is an array", () => {
    expect(() => importStatsFromExport({ version: 1, games: [] })).toThrow();
  });

  it("throws when games is a string", () => {
    expect(() => importStatsFromExport({ version: 1, games: "klondike" })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Valid data
// ---------------------------------------------------------------------------

describe("importStatsFromExport – valid data", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the number of games imported", () => {
    const count = importStatsFromExport(validExport());
    expect(count).toBe(1);
  });

  it("imports multiple games and returns correct count", () => {
    const data: StatsExport = {
      version: 1,
      exportedAt: Date.now(),
      games: {
        klondike: validStats(),
        spider: validStats({ gamesPlayed: 5, wins: 3, losses: 2 }),
        freecell: validStats({ gamesPlayed: 2, wins: 1, losses: 1 }),
      },
    };
    expect(importStatsFromExport(data)).toBe(3);
  });

  it("handles an empty games object without throwing", () => {
    expect(importStatsFromExport({ version: 1, exportedAt: 0, games: {} })).toBe(0);
  });

  it("stores stats with null bestTime and bestMoves without error", () => {
    const count = importStatsFromExport(
      validExport({ games: { klondike: validStats({ bestTime: null, bestMoves: null }) } }),
    );
    expect(count).toBe(1);
  });

  it("stores stats with an empty history array", () => {
    expect(
      importStatsFromExport(validExport({ games: { klondike: validStats({ history: [] }) } })),
    ).toBe(1);
  });

  it("wins equal to gamesPlayed is valid (perfect record)", () => {
    expect(
      importStatsFromExport(
        validExport({ games: { klondike: validStats({ gamesPlayed: 5, wins: 5, losses: 0 }) } }),
      ),
    ).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Per-game numeric field validation (skip corrupted entries)
// ---------------------------------------------------------------------------

describe("importStatsFromExport – negative numeric fields are skipped", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("skips a game where gamesPlayed is negative", () => {
    const data = validExport({ games: { klondike: validStats({ gamesPlayed: -1 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where wins is negative", () => {
    const data = validExport({ games: { klondike: validStats({ wins: -1 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where losses is negative", () => {
    const data = validExport({ games: { klondike: validStats({ losses: -1 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where currentStreak is negative", () => {
    const data = validExport({ games: { klondike: validStats({ currentStreak: -1 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where longestStreak is negative", () => {
    const data = validExport({ games: { klondike: validStats({ longestStreak: -1 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where bestTime is negative", () => {
    const data = validExport({ games: { klondike: validStats({ bestTime: -10 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where bestMoves is negative", () => {
    const data = validExport({ games: { klondike: validStats({ bestMoves: -5 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where avgTime is negative", () => {
    const data = validExport({ games: { klondike: validStats({ avgTime: -30 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where avgMoves is negative", () => {
    const data = validExport({ games: { klondike: validStats({ avgMoves: -1 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where gamesPlayed is NaN", () => {
    const data = validExport({ games: { klondike: validStats({ gamesPlayed: NaN }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where wins is Infinity", () => {
    const data = validExport({ games: { klondike: validStats({ wins: Infinity }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where gamesPlayed is fractional (not an integer)", () => {
    const data = validExport({ games: { klondike: validStats({ gamesPlayed: 10.5 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where wins is fractional", () => {
    const data = validExport({ games: { klondike: validStats({ wins: 3.7 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where losses is fractional", () => {
    const data = validExport({ games: { klondike: validStats({ losses: 1.1 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where currentStreak is fractional", () => {
    const data = validExport({ games: { klondike: validStats({ currentStreak: 0.5 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where longestStreak is fractional", () => {
    const data = validExport({ games: { klondike: validStats({ longestStreak: 2.9 }) } });
    expect(importStatsFromExport(data)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// lastPlayedAt validation
// ---------------------------------------------------------------------------

describe("importStatsFromExport – lastPlayedAt validation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("skips a game where lastPlayedAt is a string", () => {
    const data = validExport({
      games: { klondike: validStats({ lastPlayedAt: "2024-01-01" as unknown as number }) },
    });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where lastPlayedAt is negative", () => {
    const data = validExport({
      games: { klondike: validStats({ lastPlayedAt: -1 }) },
    });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where lastPlayedAt is NaN", () => {
    const data = validExport({
      games: { klondike: validStats({ lastPlayedAt: NaN }) },
    });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where lastPlayedAt is Infinity", () => {
    const data = validExport({
      games: { klondike: validStats({ lastPlayedAt: Infinity }) },
    });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("accepts lastPlayedAt of 0 (no games played yet)", () => {
    const data = validExport({
      games: {
        klondike: validStats({ gamesPlayed: 0, wins: 0, losses: 0, lastPlayedAt: 0 }),
      },
    });
    expect(importStatsFromExport(data)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// wins > gamesPlayed / wins + losses > gamesPlayed
// ---------------------------------------------------------------------------

describe("importStatsFromExport – aggregate count invariants are enforced", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("skips a game where wins exceeds gamesPlayed", () => {
    const data = validExport({
      games: { klondike: validStats({ gamesPlayed: 5, wins: 8, losses: 0 }) },
    });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips when wins > gamesPlayed even if other fields look fine", () => {
    const data = validExport({
      games: {
        klondike: validStats({ gamesPlayed: 1, wins: 2, losses: 0, currentStreak: 1 }),
      },
    });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where losses exceeds gamesPlayed", () => {
    const data = validExport({
      games: { klondike: validStats({ gamesPlayed: 5, wins: 0, losses: 10 }) },
    });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("skips a game where wins + losses exceeds gamesPlayed", () => {
    const data = validExport({
      games: { klondike: validStats({ gamesPlayed: 10, wins: 7, losses: 100 }) },
    });
    expect(importStatsFromExport(data)).toBe(0);
  });

  it("accepts wins + losses exactly equal to gamesPlayed", () => {
    const data = validExport({
      games: {
        klondike: validStats({ gamesPlayed: 10, wins: 7, losses: 3 }),
      },
    });
    expect(importStatsFromExport(data)).toBe(1);
  });

  it("accepts wins + losses less than gamesPlayed (games still in progress count)", () => {
    const data = validExport({
      games: {
        klondike: validStats({ gamesPlayed: 10, wins: 5, losses: 3 }),
      },
    });
    expect(importStatsFromExport(data)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Malformed history entries
// ---------------------------------------------------------------------------

describe("importStatsFromExport – malformed history entries are dropped", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("drops a history entry that is not an object", () => {
    const data = validExport({
      games: {
        klondike: validStats({
          history: ["not-an-object"] as unknown as GameStats["history"],
        }),
      },
    });
    // Game itself is valid; the bad entry is just silently dropped
    expect(importStatsFromExport(data)).toBe(1);
  });

  it("drops a history entry missing the 'won' field", () => {
    const badEntry = { date: Date.now(), moves: 10, durationSeconds: 60, isDaily: false };
    const data = validExport({
      games: {
        klondike: validStats({
          history: [badEntry] as unknown as GameStats["history"],
        }),
      },
    });
    expect(importStatsFromExport(data)).toBe(1);
  });

  it("drops a history entry missing the 'date' field", () => {
    const badEntry = { won: true, moves: 10, durationSeconds: 60, isDaily: false };
    const data = validExport({
      games: {
        klondike: validStats({
          history: [badEntry] as unknown as GameStats["history"],
        }),
      },
    });
    expect(importStatsFromExport(data)).toBe(1);
  });

  it("drops a history entry where 'moves' is negative", () => {
    const badEntry = { date: Date.now(), won: true, moves: -5, durationSeconds: 60, isDaily: false };
    const data = validExport({
      games: {
        klondike: validStats({
          history: [badEntry] as unknown as GameStats["history"],
        }),
      },
    });
    expect(importStatsFromExport(data)).toBe(1);
  });

  it("drops a history entry where 'durationSeconds' is missing", () => {
    const badEntry = { date: Date.now(), won: false, moves: 10, isDaily: true };
    const data = validExport({
      games: {
        klondike: validStats({
          history: [badEntry] as unknown as GameStats["history"],
        }),
      },
    });
    expect(importStatsFromExport(data)).toBe(1);
  });

  it("drops a history entry where 'isDaily' is not a boolean", () => {
    const badEntry = { date: Date.now(), won: true, moves: 10, durationSeconds: 60, isDaily: "yes" };
    const data = validExport({
      games: {
        klondike: validStats({
          history: [badEntry] as unknown as GameStats["history"],
        }),
      },
    });
    expect(importStatsFromExport(data)).toBe(1);
  });

  it("keeps valid history entries alongside dropped malformed ones", () => {
    const goodEntry = { date: Date.now(), won: true, moves: 20, durationSeconds: 90, isDaily: false };
    const badEntry = { won: false }; // missing required fields
    const data = validExport({
      games: {
        klondike: validStats({
          history: [goodEntry, badEntry] as unknown as GameStats["history"],
        }),
      },
    });
    expect(importStatsFromExport(data)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Mixed valid / invalid games
// ---------------------------------------------------------------------------

describe("importStatsFromExport – partial corruption", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("skips corrupted game entries but still imports valid ones", () => {
    const data: StatsExport = {
      version: 1,
      exportedAt: Date.now(),
      games: {
        klondike: validStats(),                                   // valid
        spider: validStats({ gamesPlayed: 3, wins: 99 }),        // wins > gamesPlayed — skipped
        freecell: validStats({ gamesPlayed: 5, wins: 3, losses: 2 }), // valid
      },
    };
    expect(importStatsFromExport(data)).toBe(2);
  });

  it("skips a per-game entry where stats is not an object", () => {
    const data = {
      version: 1,
      exportedAt: Date.now(),
      games: {
        klondike: "not-an-object",
        spider: validStats(),
      },
    };
    expect(importStatsFromExport(data)).toBe(1);
  });

  it("skips a per-game entry where stats is null", () => {
    const data = {
      version: 1,
      exportedAt: Date.now(),
      games: {
        klondike: null,
        spider: validStats(),
      },
    };
    expect(importStatsFromExport(data)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// mergeStats unit tests
// ---------------------------------------------------------------------------

describe("mergeStats – history deduplication and merging", () => {
  it("keeps entries from both sides when timestamps are distinct", () => {
    const a = validStats({ history: [{ date: 1000, won: true, moves: 10, durationSeconds: 60, isDaily: false }] });
    const b = validStats({ history: [{ date: 2000, won: false, moves: 20, durationSeconds: 30, isDaily: false }] });
    const result = mergeStats(a, b);
    expect(result.history).toHaveLength(2);
    expect(result.history[0].date).toBe(2000); // newest first
    expect(result.history[1].date).toBe(1000);
  });

  it("deduplicates history entries with the same timestamp", () => {
    const entry = { date: 1000, won: true, moves: 10, durationSeconds: 60, isDaily: false };
    const a = validStats({ history: [entry] });
    const b = validStats({ history: [entry] });
    const result = mergeStats(a, b);
    expect(result.history).toHaveLength(1);
  });

  it("caps history at MAX_HISTORY (50 entries)", () => {
    const makeEntries = (count: number, startDate: number) =>
      Array.from({ length: count }, (_, i) => ({
        date: startDate + i,
        won: true,
        moves: 10,
        durationSeconds: 60,
        isDaily: false,
      }));
    const a = validStats({ history: makeEntries(40, 1000) });
    const b = validStats({ history: makeEntries(40, 5000) });
    const result = mergeStats(a, b);
    expect(result.history).toHaveLength(50);
  });

  it("prefers entries from existing side when merging with empty imported history", () => {
    const a = validStats({ history: [{ date: 9999, won: true, moves: 5, durationSeconds: 45, isDaily: false }] });
    const b = validStats({ history: [] });
    const result = mergeStats(a, b);
    expect(result.history).toHaveLength(1);
    expect(result.history[0].date).toBe(9999);
  });
});

describe("mergeStats – aggregate field merging", () => {
  it("takes the larger gamesPlayed", () => {
    const a = validStats({ gamesPlayed: 20 });
    const b = validStats({ gamesPlayed: 10 });
    expect(mergeStats(a, b).gamesPlayed).toBe(20);
  });

  it("takes the larger wins", () => {
    const a = validStats({ wins: 5 });
    const b = validStats({ wins: 8 });
    expect(mergeStats(a, b).wins).toBe(8);
  });

  it("takes the larger losses", () => {
    const a = validStats({ losses: 3 });
    const b = validStats({ losses: 1 });
    expect(mergeStats(a, b).losses).toBe(3);
  });

  it("takes the larger currentStreak", () => {
    const a = validStats({ currentStreak: 2 });
    const b = validStats({ currentStreak: 7 });
    expect(mergeStats(a, b).currentStreak).toBe(7);
  });

  it("takes the larger longestStreak", () => {
    const a = validStats({ longestStreak: 5 });
    const b = validStats({ longestStreak: 12 });
    expect(mergeStats(a, b).longestStreak).toBe(12);
  });

  it("takes the smaller (better) bestTime when both are non-null", () => {
    const a = validStats({ bestTime: 90 });
    const b = validStats({ bestTime: 120 });
    expect(mergeStats(a, b).bestTime).toBe(90);
  });

  it("uses imported bestTime when existing bestTime is null", () => {
    const a = validStats({ bestTime: null });
    const b = validStats({ bestTime: 75 });
    expect(mergeStats(a, b).bestTime).toBe(75);
  });

  it("uses existing bestTime when imported bestTime is null", () => {
    const a = validStats({ bestTime: 60 });
    const b = validStats({ bestTime: null });
    expect(mergeStats(a, b).bestTime).toBe(60);
  });

  it("returns null bestTime when both are null", () => {
    const a = validStats({ bestTime: null });
    const b = validStats({ bestTime: null });
    expect(mergeStats(a, b).bestTime).toBeNull();
  });

  it("takes the smaller (better) bestMoves when both are non-null", () => {
    const a = validStats({ bestMoves: 25 });
    const b = validStats({ bestMoves: 40 });
    expect(mergeStats(a, b).bestMoves).toBe(25);
  });

  it("prefers existing avgTime over imported", () => {
    const a = validStats({ avgTime: 100 });
    const b = validStats({ avgTime: 200 });
    expect(mergeStats(a, b).avgTime).toBe(100);
  });

  it("falls back to imported avgTime when existing is null", () => {
    const a = validStats({ avgTime: null });
    const b = validStats({ avgTime: 150 });
    expect(mergeStats(a, b).avgTime).toBe(150);
  });

  it("takes the more recent lastPlayedAt", () => {
    const a = validStats({ lastPlayedAt: 1_000_000 });
    const b = validStats({ lastPlayedAt: 2_000_000 });
    expect(mergeStats(a, b).lastPlayedAt).toBe(2_000_000);
  });

  // ── Invariant: wins + losses ≤ gamesPlayed ──────────────────────────────

  it("adjusts gamesPlayed upward when independently-maximised wins+losses would exceed it", () => {
    // existing: 50 played / 40 wins / 5 losses
    // imported: 60 played / 10 wins / 50 losses
    // naïve max: gamesPlayed=60, wins=40, losses=50 → 40+50=90 > 60 (INVALID)
    // correct:   gamesPlayed=max(60, 40+50)=90, wins=40, losses=50
    const existing = validStats({ gamesPlayed: 50, wins: 40, losses: 5 });
    const imported = validStats({ gamesPlayed: 60, wins: 10, losses: 50 });
    const result = mergeStats(existing, imported);
    expect(result.wins).toBe(40);
    expect(result.losses).toBe(50);
    expect(result.gamesPlayed).toBe(90);
    expect(result.wins + result.losses).toBeLessThanOrEqual(result.gamesPlayed);
  });

  it("does not inflate gamesPlayed when wins+losses already fits within it", () => {
    const a = validStats({ gamesPlayed: 20, wins: 10, losses: 5 });
    const b = validStats({ gamesPlayed: 15, wins: 8, losses: 4 });
    const result = mergeStats(a, b);
    expect(result.gamesPlayed).toBe(20); // max of 20 and 15; wins+losses=14 ≤ 20
    expect(result.wins + result.losses).toBeLessThanOrEqual(result.gamesPlayed);
  });

  it("satisfies the invariant when both sides have identical diverged counts", () => {
    // Two devices that each recorded different outcomes from the same starting point
    const a = validStats({ gamesPlayed: 10, wins: 10, losses: 0 });
    const b = validStats({ gamesPlayed: 10, wins: 0, losses: 10 });
    const result = mergeStats(a, b);
    expect(result.wins + result.losses).toBeLessThanOrEqual(result.gamesPlayed);
  });
});

// ---------------------------------------------------------------------------
// importStatsFromExport merges into existing stats (not replaces)
// ---------------------------------------------------------------------------

describe("importStatsFromExport – merges into existing localStorage stats", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("preserves existing history when importing a file with different history entries", () => {
    // Seed localStorage with an existing record
    const existingEntry = { date: 1000, won: true, moves: 10, durationSeconds: 60, isDaily: false };
    localStorage.setItem(
      "neon-solitaire:stats:klondike",
      JSON.stringify(validStats({ history: [existingEntry] }))
    );

    // Import a file with a different record
    const importedEntry = { date: 2000, won: false, moves: 20, durationSeconds: 30, isDaily: false };
    const data = validExport({ games: { klondike: validStats({ history: [importedEntry] }) } });
    importStatsFromExport(data);

    const saved = loadStats("klondike");
    const dates = saved.history.map((r) => r.date);
    expect(dates).toContain(1000); // existing entry preserved
    expect(dates).toContain(2000); // imported entry added
  });

  it("does not duplicate history entries that appear in both existing and imported", () => {
    const entry = { date: 5000, won: true, moves: 15, durationSeconds: 90, isDaily: false };
    localStorage.setItem(
      "neon-solitaire:stats:klondike",
      JSON.stringify(validStats({ history: [entry] }))
    );
    const data = validExport({ games: { klondike: validStats({ history: [entry] }) } });
    importStatsFromExport(data);

    const saved = loadStats("klondike");
    expect(saved.history.filter((r) => r.date === 5000)).toHaveLength(1);
  });

  it("does not reduce gamesPlayed below the existing value", () => {
    localStorage.setItem(
      "neon-solitaire:stats:klondike",
      JSON.stringify(validStats({ gamesPlayed: 50, wins: 30, losses: 20 }))
    );
    // Import file has fewer games played (e.g., older backup)
    const data = validExport({
      games: { klondike: validStats({ gamesPlayed: 10, wins: 7, losses: 3 }) },
    });
    importStatsFromExport(data);

    const saved = loadStats("klondike");
    expect(saved.gamesPlayed).toBe(50);
    expect(saved.wins).toBe(30);
  });

  it("does not reduce longestStreak below the existing value", () => {
    localStorage.setItem(
      "neon-solitaire:stats:klondike",
      JSON.stringify(validStats({ longestStreak: 15 }))
    );
    const data = validExport({
      games: { klondike: validStats({ longestStreak: 5 }) },
    });
    importStatsFromExport(data);

    expect(loadStats("klondike").longestStreak).toBe(15);
  });

  it("does not replace a better bestTime with a worse one", () => {
    localStorage.setItem(
      "neon-solitaire:stats:klondike",
      JSON.stringify(validStats({ bestTime: 45 }))
    );
    const data = validExport({ games: { klondike: validStats({ bestTime: 200 }) } });
    importStatsFromExport(data);

    expect(loadStats("klondike").bestTime).toBe(45);
  });

  it("imports a better bestTime from the file when it is lower", () => {
    localStorage.setItem(
      "neon-solitaire:stats:klondike",
      JSON.stringify(validStats({ bestTime: 300 }))
    );
    const data = validExport({ games: { klondike: validStats({ bestTime: 50 }) } });
    importStatsFromExport(data);

    expect(loadStats("klondike").bestTime).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// bestRun – persistence, merge, and import validation
// ---------------------------------------------------------------------------

describe("bestRun – recordWin and recordLoss persist the peak run", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("recordWin persists peakRun when it exceeds the stored bestRun", () => {
    recordWin("pyramid", 60, 20, false, 8);
    expect(loadStats("pyramid").bestRun).toBe(8);
  });

  it("recordWin does not lower bestRun when a later game has a smaller peak", () => {
    recordWin("pyramid", 60, 20, false, 8);
    recordWin("pyramid", 60, 20, false, 3);
    expect(loadStats("pyramid").bestRun).toBe(8);
  });

  it("recordLoss persists peakRun when it exceeds the stored bestRun", () => {
    recordLoss("pyramid", 10, false, 5);
    expect(loadStats("pyramid").bestRun).toBe(5);
  });

  it("recordLoss does not lower bestRun when a later loss has a smaller peak", () => {
    recordLoss("pyramid", 10, false, 5);
    recordLoss("pyramid", 10, false, 2);
    expect(loadStats("pyramid").bestRun).toBe(5);
  });
});

describe("mergeStats – bestRun takes the larger value", () => {
  it("takes the larger bestRun from either side", () => {
    const a = validStats({ bestRun: 7 });
    const b = validStats({ bestRun: 12 });
    expect(mergeStats(a, b).bestRun).toBe(12);
  });

  it("keeps existing bestRun when imported is lower", () => {
    const a = validStats({ bestRun: 15 });
    const b = validStats({ bestRun: 3 });
    expect(mergeStats(a, b).bestRun).toBe(15);
  });

  it("handles missing bestRun on legacy import side (treated as 0)", () => {
    const a = validStats({ bestRun: 10 });
    const b = { ...validStats(), bestRun: undefined } as unknown as GameStats;
    // mergeStats uses ?? 0 guard
    expect(mergeStats(a, b).bestRun).toBe(10);
  });
});

describe("importStatsFromExport – bestRun validation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("accepts a valid bestRun value in the import", () => {
    const data = validExport({ games: { klondike: validStats({ bestRun: 6 }) } });
    const count = importStatsFromExport(data);
    expect(count).toBe(1);
    expect(loadStats("klondike").bestRun).toBe(6);
  });

  it("defaults bestRun to 0 when the field is absent (legacy export)", () => {
    const statsWithoutBestRun = { ...validStats() } as Record<string, unknown>;
    delete statsWithoutBestRun.bestRun;
    const data = validExport({ games: { klondike: statsWithoutBestRun as unknown as GameStats } });
    const count = importStatsFromExport(data);
    expect(count).toBe(1);
    expect(loadStats("klondike").bestRun).toBe(0);
  });

  it("skips a game entry whose bestRun is a negative number", () => {
    const data = validExport({
      games: { klondike: validStats({ bestRun: -1 }) },
    });
    const count = importStatsFromExport(data);
    expect(count).toBe(0);
  });

  it("skips a game entry whose bestRun is a non-integer (float)", () => {
    const data = validExport({
      games: { klondike: validStats({ bestRun: 3.7 as unknown as number }) },
    });
    const count = importStatsFromExport(data);
    expect(count).toBe(0);
  });

  it("does not reduce existing bestRun when imported bestRun is lower", () => {
    localStorage.setItem(
      "neon-solitaire:stats:klondike",
      JSON.stringify(validStats({ bestRun: 10 }))
    );
    const data = validExport({ games: { klondike: validStats({ bestRun: 4 }) } });
    importStatsFromExport(data);
    expect(loadStats("klondike").bestRun).toBe(10);
  });
});
