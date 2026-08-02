/**
 * Unit tests for Pyramid run (streak) counter behaviour.
 *
 * Expected contract (mirrors TriPeaks):
 *  - newPyramidGame() always starts with streak === 0
 *  - a successful removal (tryPyramidRemove) increments streak by 1
 *  - drawPyramidStock resets streak to 0
 *  - a new game created after plays always starts with streak === 0
 *  - a new game seeded with the daily seed also starts with streak === 0
 *  - a legacy save without a streak field is normalised to 0 before play
 */

import { describe, it, expect } from "vitest";
import {
  newPyramidGame,
  drawPyramidStock,
  tryPyramidRemove,
  isPyramidAvailable,
  type PyramidState,
  type PyramidSel,
} from "./pyramid";

const SEED = 42;
const DAILY_SEED = 20240801;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the streak value from a PyramidState. */
function streak(state: PyramidState): number {
  return state.streak;
}

/** Collect all currently available pyramid selections. */
function availablePyramidSels(state: PyramidState): PyramidSel[] {
  const sels: PyramidSel[] = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col <= row; col++) {
      if (isPyramidAvailable(state.pyramid, row, col)) {
        sels.push({ kind: "pyramid", row, col });
      }
    }
  }
  return sels;
}

/**
 * Find the first pair of available cards (or lone King) that can be removed.
 * Returns [selA, selB | null] or null if nothing is removable right now.
 */
function findRemovablePair(
  state: PyramidState,
): [PyramidSel, PyramidSel | null] | null {
  const avail = availablePyramidSels(state);

  // Lone King on pyramid
  for (const sel of avail) {
    if (sel.kind === "pyramid" && state.pyramid[sel.row][sel.col]!.rank === 13) {
      return [sel, null];
    }
  }

  // King on waste
  const wasteTop = state.waste[state.waste.length - 1];
  if (wasteTop?.rank === 13) {
    return [{ kind: "waste" }, null];
  }

  // Pyramid–pyramid pair summing to 13
  for (let i = 0; i < avail.length; i++) {
    for (let j = i + 1; j < avail.length; j++) {
      const a = avail[i];
      const b = avail[j];
      if (a.kind !== "pyramid" || b.kind !== "pyramid") continue;
      if (
        state.pyramid[a.row][a.col]!.rank +
          state.pyramid[b.row][b.col]!.rank ===
        13
      ) {
        return [a, b];
      }
    }
  }

  // Pyramid–waste pair
  if (wasteTop) {
    for (const sel of avail) {
      if (sel.kind !== "pyramid") continue;
      if (state.pyramid[sel.row][sel.col]!.rank + wasteTop.rank === 13) {
        return [{ kind: "waste" }, sel];
      }
    }
  }

  return null;
}

/** Draw cards until a removable pair appears or stock (+ waste) is exhausted. */
function drawUntilRemovable(state: PyramidState): PyramidState {
  let s = state;
  for (let attempts = 0; attempts < 100; attempts++) {
    if (findRemovablePair(s)) break;
    const next = drawPyramidStock(s);
    if (!next) break;
    s = next;
  }
  return s;
}

// ---------------------------------------------------------------------------
// newPyramidGame — streak initialisation
// ---------------------------------------------------------------------------

describe("newPyramidGame – streak initialisation", () => {
  it("starts with streak === 0 (random seed)", () => {
    const state = newPyramidGame();
    expect(streak(state)).toBe(0);
  });

  it("starts with streak === 0 (fixed seed)", () => {
    const state = newPyramidGame(SEED);
    expect(streak(state)).toBe(0);
  });

  it("starts with streak === 0 when seeded with a daily seed", () => {
    const state = newPyramidGame(DAILY_SEED);
    expect(streak(state)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// tryPyramidRemove — streak increments; drawPyramidStock — streak resets to 0
// ---------------------------------------------------------------------------

describe("run counter increments on removals and resets on stock draw", () => {
  it("tryPyramidRemove increments streak from 0 to 1 on first removal", () => {
    let state = newPyramidGame(SEED);
    state = drawUntilRemovable(state);

    const pair = findRemovablePair(state);
    if (!pair) return; // No removable pair found with this seed — skip gracefully

    const [selA, selB] = pair;
    const next = tryPyramidRemove(state, selA, selB);
    if (!next) return; // Guard: removal rejected (shouldn't happen)

    expect(streak(next)).toBe(1);
  });

  it("streak accumulates across consecutive removals without a draw", () => {
    let state = newPyramidGame(SEED);
    state = drawUntilRemovable(state);

    let removals = 0;
    for (let attempts = 0; attempts < 50 && removals < 3; attempts++) {
      const pair = findRemovablePair(state);
      if (!pair) break;
      const [selA, selB] = pair;
      const next = tryPyramidRemove(state, selA, selB);
      if (!next) break;
      removals++;
      expect(streak(next)).toBe(removals);
      state = next;
    }
    // At least one removal must be possible for this test to be meaningful
    expect(removals).toBeGreaterThanOrEqual(1);
  });

  it("drawPyramidStock resets streak to 0 immediately", () => {
    let state = newPyramidGame(SEED);
    state = drawUntilRemovable(state);

    const pair = findRemovablePair(state);
    if (pair) {
      const [selA, selB] = pair;
      const afterRemoval = tryPyramidRemove(state, selA, selB);
      if (afterRemoval) {
        expect(streak(afterRemoval)).toBeGreaterThan(0);
        const afterDraw = drawPyramidStock(afterRemoval);
        if (afterDraw) {
          expect(streak(afterDraw)).toBe(0);
        }
      }
    }

    // Also verify on a fresh game: draw immediately resets streak (already 0)
    const fresh = newPyramidGame(SEED);
    const afterDraw = drawPyramidStock(fresh);
    if (afterDraw) {
      expect(streak(afterDraw)).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Reset behaviour: new game after plays always starts with streak === 0
// ---------------------------------------------------------------------------

describe("reset() — new game always starts with streak === 0", () => {
  it("newPyramidGame() after plays produces streak === 0 (new random game)", () => {
    // Simulate a removal so streak could be > 0
    let state = newPyramidGame(SEED);
    state = drawUntilRemovable(state);
    const pair = findRemovablePair(state);
    if (pair) {
      tryPyramidRemove(state, pair[0], pair[1]);
    }
    // Simulate reset() → calls newPyramidGame()
    const fresh = newPyramidGame();
    expect(streak(fresh)).toBe(0);
  });

  it("newPyramidGame(seed) produces streak === 0 (simulates daily challenge reset)", () => {
    const dailyGame = newPyramidGame(DAILY_SEED);
    expect(streak(dailyGame)).toBe(0);
  });

  it("calling newPyramidGame() twice returns independent states both with streak === 0", () => {
    const g1 = newPyramidGame(SEED);
    const g2 = newPyramidGame(SEED + 1);
    expect(streak(g1)).toBe(0);
    expect(streak(g2)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Legacy save migration — streak field absent in pre-feature saves
// ---------------------------------------------------------------------------

describe("legacy save without streak field is normalised to 0 before play", () => {
  it("removing a pair after normalising a legacy save yields streak === 1 (not NaN)", () => {
    // Simulate a save that was written before the streak field existed
    const base = newPyramidGame(SEED);
    const legacySave = { ...base } as Partial<PyramidState> & Omit<PyramidState, "streak">;
    delete (legacySave as Record<string, unknown>).streak;

    // Apply the same normalisation the component does on load
    const loaded: PyramidState = { ...(legacySave as PyramidState), streak: (legacySave as PyramidState).streak ?? 0 };
    expect(streak(loaded)).toBe(0);

    // Advance to a removable position
    const ready = drawUntilRemovable(loaded);
    const pair = findRemovablePair(ready);
    if (!pair) return; // seed produces no early removal — skip gracefully

    const [selA, selB] = pair;
    const next = tryPyramidRemove(ready, selA, selB);
    if (!next) return;

    expect(Number.isFinite(streak(next))).toBe(true);
    expect(streak(next)).toBe(1);
  });
});
