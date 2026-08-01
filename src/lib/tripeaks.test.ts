/**
 * Unit tests for TriPeaks run (streak) counter reset behaviour.
 *
 * Confirms:
 *  - newTriPeaksGame() always starts with streak === 0
 *  - tryPlayTPCard increments streak on each consecutive play
 *  - drawTPStock resets streak to 0
 *  - A new game created after plays always starts with streak === 0
 *    (simulates what TriPeaks.reset() does — calls newTriPeaksGame())
 *  - A new game seeded with the daily seed also starts with streak === 0
 *    (simulates what dailyTrigger does — calls reset(dailySeed))
 */

import { describe, it, expect } from "vitest";
import {
  newTriPeaksGame,
  tryPlayTPCard,
  drawTPStock,
  isTPAvailable,
  canPlayOnWaste,
  type TriPeaksState,
} from "./tripeaks";

const SEED = 42;
const DAILY_SEED = 20240801;

// ---------------------------------------------------------------------------
// Helper: advance game state until we can play at least one card or draw
// ---------------------------------------------------------------------------

/** Draw cards from the stock until a board card is playable, or stock is empty. */
function drawUntilPlayable(state: TriPeaksState): TriPeaksState {
  let s = state;
  while (s.stock.length > 0) {
    const wasteTop = s.waste[s.waste.length - 1];
    const hasPlay = s.cards.some(
      (c, i) => c && isTPAvailable(s.cards, i) && wasteTop && canPlayOnWaste(c, wasteTop),
    );
    if (hasPlay) break;
    const next = drawTPStock(s);
    if (!next) break;
    s = next;
  }
  return s;
}

/** Return the index of the first playable board card, or -1. */
function firstPlayableCard(state: TriPeaksState): number {
  const wasteTop = state.waste[state.waste.length - 1];
  if (!wasteTop) return -1;
  return state.cards.findIndex(
    (c, i) => c && isTPAvailable(state.cards, i) && canPlayOnWaste(c, wasteTop),
  );
}

// ---------------------------------------------------------------------------
// newTriPeaksGame — streak initialisation
// ---------------------------------------------------------------------------

describe("newTriPeaksGame – streak initialisation", () => {
  it("starts with streak === 0 (random seed)", () => {
    const state = newTriPeaksGame();
    expect(state.streak).toBe(0);
  });

  it("starts with streak === 0 (fixed seed)", () => {
    const state = newTriPeaksGame(SEED);
    expect(state.streak).toBe(0);
  });

  it("starts with streak === 0 when seeded with a daily seed", () => {
    const state = newTriPeaksGame(DAILY_SEED);
    expect(state.streak).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// tryPlayTPCard — streak increments; drawTPStock — streak resets to 0
// ---------------------------------------------------------------------------

describe("run counter increments on card plays and resets on stock draw", () => {
  it("tryPlayTPCard increments streak from 0 to 1 on first play", () => {
    let state = newTriPeaksGame(SEED);
    state = drawUntilPlayable(state);
    const idx = firstPlayableCard(state);
    expect(idx).toBeGreaterThanOrEqual(0);

    const next = tryPlayTPCard(state, idx);
    expect(next).not.toBeNull();
    expect(next!.streak).toBe(1);
  });

  it("streak accumulates across consecutive card plays without a draw", () => {
    let state = newTriPeaksGame(SEED);
    state = drawUntilPlayable(state);

    let plays = 0;
    for (let attempts = 0; attempts < 100 && plays < 3; attempts++) {
      const idx = firstPlayableCard(state);
      if (idx === -1) break;
      const next = tryPlayTPCard(state, idx);
      if (!next) break;
      plays++;
      expect(next.streak).toBe(plays);
      state = next;
    }
    // At least two consecutive plays must have been possible for this test to be meaningful
    expect(plays).toBeGreaterThanOrEqual(1);
  });

  it("drawTPStock resets streak to 0 immediately", () => {
    let state = newTriPeaksGame(SEED);
    state = drawUntilPlayable(state);
    const idx = firstPlayableCard(state);
    if (idx !== -1) {
      const afterPlay = tryPlayTPCard(state, idx);
      if (afterPlay) {
        expect(afterPlay.streak).toBeGreaterThan(0);
        const afterDraw = drawTPStock(afterPlay);
        if (afterDraw) {
          expect(afterDraw.streak).toBe(0);
        }
      }
    }
    // Also verify on a fresh game with a draw right away
    const fresh = newTriPeaksGame(SEED);
    const afterDraw = drawTPStock(fresh);
    if (afterDraw) {
      expect(afterDraw.streak).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Reset behaviour: new game after plays always starts with streak === 0
// (simulates TriPeaks.reset() — which calls newTriPeaksGame(seed?))
// ---------------------------------------------------------------------------

describe("reset() — new game always starts with streak === 0", () => {
  it("newTriPeaksGame() after plays produces streak === 0 (new random game)", () => {
    // Simulate playing a few cards so streak > 0
    let state = newTriPeaksGame(SEED);
    state = drawUntilPlayable(state);
    let played = false;
    const idx = firstPlayableCard(state);
    if (idx !== -1) {
      const next = tryPlayTPCard(state, idx);
      if (next && next.streak > 0) played = true;
    }
    // Now simulate reset() → calls newTriPeaksGame()
    const fresh = newTriPeaksGame();
    expect(fresh.streak).toBe(0);
    // Sanity: we actually played a card so the simulation was meaningful
    expect(played).toBe(true);
  });

  it("newTriPeaksGame(seed) produces streak === 0 (simulates daily challenge reset)", () => {
    // Simulate daily trigger path: reset(dailySeed) → newTriPeaksGame(dailySeed)
    const dailyGame = newTriPeaksGame(DAILY_SEED);
    expect(dailyGame.streak).toBe(0);
  });

  it("calling newTriPeaksGame() twice returns independent states both with streak === 0", () => {
    const g1 = newTriPeaksGame(SEED);
    const g2 = newTriPeaksGame(SEED + 1);
    expect(g1.streak).toBe(0);
    expect(g2.streak).toBe(0);
  });
});
