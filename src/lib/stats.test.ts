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
import { importStatsFromExport } from "./stats";
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
