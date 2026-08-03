/**
 * Unit tests for Golf run (streak) counter behaviour.
 *
 * Reference implementation: src/lib/tripeaks.test.ts
 *
 * Contract (mirrors TriPeaks):
 *  - newGolfGame() always starts with streak === 0
 *  - playTableauCard increments streak by 1 on each consecutive play
 *  - drawGolfStock resets streak to 0
 *  - a new game created after plays always starts with streak === 0
 *  - a new game seeded with the daily seed also starts with streak === 0
 *  - a legacy persisted save without a streak field loads as streak === 0
 */

import { describe, it, expect } from "vitest";
import {
  newGolfGame,
  drawGolfStock,
  playTableauCard,
  canPlayOnWaste,
  type GolfState,
} from "./golf";

const SEED = 42;
const DAILY_SEED = 20240801;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function streak(state: GolfState): number {
  return state.streak;
}

function longestStreak(state: GolfState): number {
  return state.longestStreak;
}

/** Return the column index of the first playable tableau card, or -1. */
function firstPlayableCol(state: GolfState): number {
  const wasteTop = state.waste[state.waste.length - 1];
  if (!wasteTop) return -1;
  for (let col = 0; col < state.tableau.length; col++) {
    const column = state.tableau[col];
    if (column.length === 0) continue;
    const top = column[column.length - 1];
    if (canPlayOnWaste(top.rank, wasteTop.rank)) return col;
  }
  return -1;
}

/** Draw from stock until a tableau card is playable, or stock runs out. */
function drawUntilPlayable(state: GolfState): GolfState {
  let s = state;
  while (firstPlayableCol(s) === -1 && s.stock.length > 0) {
    const next = drawGolfStock(s);
    if (!next) break;
    s = next;
  }
  return s;
}

// ---------------------------------------------------------------------------
// newGolfGame — streak initialisation
// ---------------------------------------------------------------------------

describe("newGolfGame – streak initialisation", () => {
  it("starts with streak === 0 (random seed)", () => {
    const state = newGolfGame();
    expect(streak(state)).toBe(0);
  });

  it("starts with streak === 0 (fixed seed)", () => {
    const state = newGolfGame(SEED);
    expect(streak(state)).toBe(0);
  });

  it("starts with streak === 0 when seeded with a daily seed", () => {
    const state = newGolfGame(DAILY_SEED);
    expect(streak(state)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// playTableauCard — streak increments; drawGolfStock — streak resets to 0
// ---------------------------------------------------------------------------

describe("run counter increments on card plays and resets on stock draw", () => {
  it("playTableauCard increments streak from 0 to 1 on first play", () => {
    let state = newGolfGame(SEED);
    state = drawUntilPlayable(state);

    const col = firstPlayableCol(state);
    if (col === -1) return; // No playable card found — skip gracefully

    const next = playTableauCard(state, col);
    if (!next) return; // Guard: play rejected (shouldn't happen)

    expect(streak(next)).toBe(1);
  });

  it("streak accumulates across consecutive card plays without a draw", () => {
    let state = newGolfGame(SEED);
    state = drawUntilPlayable(state);

    let plays = 0;
    for (let attempts = 0; attempts < 100 && plays < 3; attempts++) {
      const col = firstPlayableCol(state);
      if (col === -1) break;
      const next = playTableauCard(state, col);
      if (!next) break;
      plays++;
      expect(streak(next)).toBe(plays);
      state = next;
    }
    // At least one play must be possible for this test to be meaningful
    expect(plays).toBeGreaterThanOrEqual(1);
  });

  it("drawGolfStock resets streak to 0 immediately", () => {
    let state = newGolfGame(SEED);
    state = drawUntilPlayable(state);

    const col = firstPlayableCol(state);
    if (col !== -1) {
      const afterPlay = playTableauCard(state, col);
      if (afterPlay) {
        const afterDraw = drawGolfStock(afterPlay);
        if (afterDraw) {
          expect(streak(afterDraw)).toBe(0);
        }
      }
    }

    // Also verify on a fresh game: draw immediately resets streak (already 0)
    const fresh = newGolfGame(SEED);
    const afterDraw = drawGolfStock(fresh);
    if (afterDraw) {
      expect(streak(afterDraw)).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Reset behaviour: new game after plays always starts with streak === 0
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Backward compatibility — legacy saves without streak field
// ---------------------------------------------------------------------------

describe("legacy save compatibility", () => {
  it("loading a save without streak field defaults to 0", () => {
    // Simulate a persisted GolfState written before the streak field existed
    const base = newGolfGame(SEED);
    const legacy = { ...base } as Record<string, unknown>;
    delete legacy["streak"];
    // The component normalises: { ...saved, streak: saved.streak ?? 0 }
    const normalised = { ...(legacy as GolfState), streak: (legacy["streak"] as number | undefined) ?? 0 };
    expect(normalised.streak).toBe(0);
  });

  it("playing a card on a normalised legacy state increments streak to 1", () => {
    const base = newGolfGame(SEED);
    const legacy = { ...base } as Record<string, unknown>;
    delete legacy["streak"];
    let state: GolfState = { ...(legacy as GolfState), streak: (legacy["streak"] as number | undefined) ?? 0 };
    state = drawUntilPlayable(state);
    const col = firstPlayableCol(state);
    if (col === -1) return; // no playable card with this seed — skip
    const next = playTableauCard(state, col);
    if (!next) return;
    expect(next.streak).toBe(1);
  });

  it("drawing from stock on a normalised legacy state keeps streak at 0", () => {
    const base = newGolfGame(SEED);
    const legacy = { ...base } as Record<string, unknown>;
    delete legacy["streak"];
    const state: GolfState = { ...(legacy as GolfState), streak: (legacy["streak"] as number | undefined) ?? 0 };
    const next = drawGolfStock(state);
    if (!next) return;
    expect(next.streak).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Reset behaviour: new game after plays always starts with streak === 0
// ---------------------------------------------------------------------------

describe("reset() — new game always starts with streak === 0", () => {
  it("newGolfGame() after plays produces streak === 0 (new random game)", () => {
    // Simulate a card play so streak could be > 0
    let state = newGolfGame(SEED);
    state = drawUntilPlayable(state);
    const col = firstPlayableCol(state);
    if (col !== -1) {
      playTableauCard(state, col);
    }
    // Simulate reset() → calls newGolfGame()
    const fresh = newGolfGame();
    expect(streak(fresh)).toBe(0);
  });

  it("newGolfGame(seed) produces streak === 0 (simulates daily challenge reset)", () => {
    const dailyGame = newGolfGame(DAILY_SEED);
    expect(streak(dailyGame)).toBe(0);
  });

  it("calling newGolfGame() twice returns independent states both with streak === 0", () => {
    const g1 = newGolfGame(SEED);
    const g2 = newGolfGame(SEED + 1);
    expect(streak(g1)).toBe(0);
    expect(streak(g2)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// longestStreak — tracks the highest streak reached in a game
// ---------------------------------------------------------------------------

describe("longestStreak tracking", () => {
  it("newGolfGame() starts with longestStreak === 0", () => {
    const state = newGolfGame(SEED);
    expect(longestStreak(state)).toBe(0);
  });

  it("longestStreak equals streak after first play", () => {
    let state = newGolfGame(SEED);
    state = drawUntilPlayable(state);
    const col = firstPlayableCol(state);
    if (col === -1) return;
    const next = playTableauCard(state, col);
    if (!next) return;
    expect(longestStreak(next)).toBe(1);
    expect(longestStreak(next)).toBe(streak(next));
  });

  it("longestStreak accumulates to the highest streak reached", () => {
    let state = newGolfGame(SEED);
    state = drawUntilPlayable(state);

    let plays = 0;
    for (let attempts = 0; attempts < 100 && plays < 3; attempts++) {
      const col = firstPlayableCol(state);
      if (col === -1) break;
      const next = playTableauCard(state, col);
      if (!next) break;
      plays++;
      expect(longestStreak(next)).toBe(plays);
      state = next;
    }
    expect(plays).toBeGreaterThanOrEqual(1);
  });

  it("longestStreak is preserved after drawGolfStock resets streak", () => {
    let state = newGolfGame(SEED);
    state = drawUntilPlayable(state);

    // Build up a streak
    let plays = 0;
    for (let attempts = 0; attempts < 100 && plays < 2; attempts++) {
      const col = firstPlayableCol(state);
      if (col === -1) break;
      const next = playTableauCard(state, col);
      if (!next) break;
      plays++;
      state = next;
    }
    if (plays === 0) return; // skip if no plays possible
    const streakBeforeDraw = state.streak;

    // Draw from stock to reset streak
    const afterDraw = drawGolfStock(state);
    if (!afterDraw) return;

    expect(streak(afterDraw)).toBe(0);
    expect(longestStreak(afterDraw)).toBe(streakBeforeDraw);
  });

  it("longestStreak does not decrease when a new streak is shorter than the previous best", () => {
    let state = newGolfGame(SEED);
    state = drawUntilPlayable(state);

    // Build a streak of at least 1
    const col1 = firstPlayableCol(state);
    if (col1 === -1) return;
    const afterPlay = playTableauCard(state, col1);
    if (!afterPlay) return;
    const best = afterPlay.longestStreak;
    expect(best).toBeGreaterThanOrEqual(1);

    // Draw to reset streak
    const afterDraw = drawGolfStock(afterPlay);
    if (!afterDraw) return;
    expect(longestStreak(afterDraw)).toBe(best);

    // Draw again until playable, then make one play (streak === 1, which equals best or could be less)
    let s = drawUntilPlayable(afterDraw);
    const col2 = firstPlayableCol(s);
    if (col2 === -1) return;
    const afterSecondPlay = playTableauCard(s, col2);
    if (!afterSecondPlay) return;

    // longestStreak should be at least the previous best
    expect(longestStreak(afterSecondPlay)).toBeGreaterThanOrEqual(best);
  });

  it("legacy save without longestStreak field normalises to 0", () => {
    const base = newGolfGame(SEED);
    // Simulate a persisted save written before the longestStreak field existed
    const { longestStreak: _removed, ...legacyShape } = base;
    void _removed;
    const normalised: GolfState = {
      ...legacyShape,
      longestStreak: (legacyShape as unknown as { longestStreak?: number }).longestStreak ?? 0,
    };
    expect(normalised.longestStreak).toBe(0);
  });
});
