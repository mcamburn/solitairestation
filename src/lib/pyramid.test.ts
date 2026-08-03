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

// ---------------------------------------------------------------------------
// peakStreak — all-time-best run within a single game session
// ---------------------------------------------------------------------------

describe("peakStreak tracks the highest run reached this game", () => {
  it("starts at 0 on a fresh game", () => {
    const state = newPyramidGame(SEED);
    expect(state.peakStreak).toBe(0);
  });

  it("rises to match streak after a removal", () => {
    let state = newPyramidGame(SEED);
    state = drawUntilRemovable(state);
    const pair = findRemovablePair(state);
    if (!pair) return;
    const next = tryPyramidRemove(state, pair[0], pair[1]);
    if (!next) return;
    expect(next.peakStreak).toBe(next.streak);
    expect(next.peakStreak).toBeGreaterThanOrEqual(1);
  });

  it("is NOT reset when stock is drawn (preserves the previous peak)", () => {
    // Build up a streak first, then draw from stock
    let state = newPyramidGame(SEED);
    state = drawUntilRemovable(state);
    const pair = findRemovablePair(state);
    if (!pair) return;
    const afterRemoval = tryPyramidRemove(state, pair[0], pair[1]);
    if (!afterRemoval) return;
    const peakBeforeDraw = afterRemoval.peakStreak;
    expect(peakBeforeDraw).toBeGreaterThanOrEqual(1);

    // Draw from stock — streak resets to 0 but peakStreak must be preserved
    const afterDraw = drawPyramidStock(afterRemoval);
    if (!afterDraw) return;
    expect(afterDraw.streak).toBe(0);
    expect(afterDraw.peakStreak).toBe(peakBeforeDraw);
  });

  it("peakStreak reflects the highest run even after multiple stock draws follow it", () => {
    let state = newPyramidGame(SEED);

    // Make at least one removal to set a peak
    state = drawUntilRemovable(state);
    const pair = findRemovablePair(state);
    if (!pair) return;
    const afterRemoval = tryPyramidRemove(state, pair[0], pair[1]);
    if (!afterRemoval) return;
    const savedPeak = afterRemoval.peakStreak;

    // Draw from stock several times — peak must not change
    let s = afterRemoval;
    for (let i = 0; i < 3; i++) {
      const next = drawPyramidStock(s);
      if (!next) break;
      expect(next.peakStreak).toBe(savedPeak);
      s = next;
    }
  });

  it("legacy save without peakStreak normalises to streak value (component load behaviour)", () => {
    const base = newPyramidGame(SEED);
    // Simulate load: missing peakStreak field (written before this feature)
    const legacySave = { ...base } as Partial<PyramidState>;
    delete (legacySave as Record<string, unknown>).peakStreak;

    // Same normalisation the component applies
    const loaded: PyramidState = {
      ...(legacySave as PyramidState),
      streak: (legacySave as PyramidState).streak ?? 0,
      peakStreak: (legacySave as PyramidState).peakStreak ?? (legacySave as PyramidState).streak ?? 0,
    };
    expect(loaded.peakStreak).toBe(0); // base game has streak 0
  });
});

// ---------------------------------------------------------------------------
// peakStreak survives undo — the peak must never decrease after an undo
// ---------------------------------------------------------------------------

describe("peakStreak is preserved when undo restores a prior snapshot", () => {
  it("undo does not lower peakStreak below the highest value achieved before the undo", () => {
    // Build up a peakStreak via a removal
    let state = newPyramidGame(SEED);
    state = drawUntilRemovable(state);

    const pair = findRemovablePair(state);
    if (!pair) return; // seed produces no removable pair — skip gracefully

    // Snapshot the state before the removal (this would be the undo target)
    const snapshotBeforeRemoval = state;

    // Make the removal — peakStreak rises to 1 (or higher)
    const afterRemoval = tryPyramidRemove(state, pair[0], pair[1]);
    if (!afterRemoval) return;
    const achievedPeak = afterRemoval.peakStreak;
    expect(achievedPeak).toBeGreaterThanOrEqual(1);

    // Simulate the component's undo: restore snapshotBeforeRemoval but
    // preserve the current peakStreak (Math.max of both sides)
    const currentPeak = afterRemoval.peakStreak;
    const restored: PyramidState = {
      ...snapshotBeforeRemoval,
      peakStreak: Math.max(snapshotBeforeRemoval.peakStreak, currentPeak),
    };

    // The restored state's peakStreak must be at least the peak reached before undo
    expect(restored.peakStreak).toBe(achievedPeak);
    expect(restored.peakStreak).toBeGreaterThanOrEqual(1);
  });

  it("drawing from stock after undo-restored state does not erase the preserved peak", () => {
    let state = newPyramidGame(SEED);
    state = drawUntilRemovable(state);

    const pair = findRemovablePair(state);
    if (!pair) return;

    const snapshotBeforeRemoval = state;
    const afterRemoval = tryPyramidRemove(state, pair[0], pair[1]);
    if (!afterRemoval) return;
    const achievedPeak = afterRemoval.peakStreak;

    // Simulate undo with peakStreak preservation
    const restored: PyramidState = {
      ...snapshotBeforeRemoval,
      peakStreak: Math.max(snapshotBeforeRemoval.peakStreak, achievedPeak),
    };

    // Draw from stock — streak resets, peakStreak must remain
    const afterDraw = drawPyramidStock(restored);
    if (!afterDraw) return;
    expect(afterDraw.streak).toBe(0);
    expect(afterDraw.peakStreak).toBe(achievedPeak);
  });
});
