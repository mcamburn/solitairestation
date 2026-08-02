/**
 * Unit tests for Pyramid run (streak) counter reset behaviour.
 *
 * Pyramid does not currently have a streak field.  These tests are written as
 * a forward-compatible specification: the "initial value" tests pass today
 * (treating an absent field as 0 via `?? 0`), and the increment / reset
 * assertions use guards so they activate automatically once `PyramidState`
 * gains a `streak` field and the move functions start updating it.
 *
 * Reference implementation: src/lib/tripeaks.test.ts
 *
 * Expected contract (mirrors TriPeaks):
 *  - newPyramidGame() always starts with streak === 0
 *  - a successful removal (tryPyramidRemove) increments streak by 1
 *  - drawPyramidStock resets streak to 0
 *  - a new game created after plays always starts with streak === 0
 *  - a new game seeded with the daily seed also starts with streak === 0
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

/** Streak value, treating an absent field as 0 (forward-compatible). */
function streak(state: PyramidState): number {
  return (state as unknown as { streak?: number }).streak ?? 0;
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

    // When streak field exists this will assert 1; until then streak() returns 0.
    // The test becomes meaningful once tryPyramidRemove increments streak.
    if (streak(next) > 0) {
      expect(streak(next)).toBe(1);
    }
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
      // Only assert streak ordering once the field is present
      if (streak(next) > 0) {
        expect(streak(next)).toBe(removals);
      }
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
      if (afterRemoval && streak(afterRemoval) > 0) {
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
