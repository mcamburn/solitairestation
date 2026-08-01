import { type Card, SUITS } from "./solitaire";

export type { Card };

/**
 * Clock Patience
 * 52 cards → 13 piles of 4, all face-down.
 * Piles 1-12: positions on clock face (rank 1=Ace=1 o'clock … rank 12=Queen=12 o'clock).
 * Pile 13 (index 12): center King pile.
 *
 * Algorithm:
 *  1. Start by flipping top card of pile 13 (King pile, index 12).
 *  2. Place it face-up at bottom of its rank's pile (rank 1→pile index 0, rank 13→pile index 12).
 *  3. Flip next top card from that same pile and repeat.
 *  4. LOSE if all 4 Kings face-up before others are done.
 *  5. WIN if all 48 non-King cards are face-up (very rare).
 */

export interface ClockState {
  piles: Card[][];   // index 0-11 = positions 1-12 on clock face; index 12 = King (center)
  currentPile: number; // the pile we just placed a card into (next flip comes from here)
  moves: number;
  won: boolean;
  lost: boolean;
  startedAt: number;
}

function shuffle<T>(arr: T[], seed = Date.now()): T[] {
  let s = seed;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function newClockGame(seed?: number): ClockState {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `clk-${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }
  const shuffled = shuffle(deck, seed ?? Date.now());

  // Deal into 13 piles of 4 (all face-down)
  const piles: Card[][] = Array.from({ length: 13 }, (_, i) =>
    shuffled.slice(i * 4, i * 4 + 4).map(c => ({ ...c, faceUp: false }))
  );

  return {
    piles,
    currentPile: 12, // start with King pile (index 12)
    moves: 0,
    won: false,
    lost: false,
    startedAt: Date.now(),
  };
}

export function cloneClock(s: ClockState): ClockState {
  return {
    ...s,
    piles: s.piles.map(pile => pile.map(c => ({ ...c }))),
  };
}

/**
 * Perform one step of the Clock Patience algorithm:
 *  - Flip the top face-down card from currentPile
 *  - Move it face-up to the bottom of the pile for its rank
 *  - Update currentPile to that rank's pile
 * Returns null if no face-down cards left in currentPile (shouldn't happen in normal play).
 */
export function clockStep(state: ClockState): ClockState | null {
  if (state.won || state.lost) return null;

  const s = cloneClock(state);
  const pile = s.piles[s.currentPile];

  // Find the top face-down card (last in array that is face-down)
  const faceDownIdx = pile.map((c, i) => (!c.faceUp ? i : -1)).filter(i => i >= 0);
  if (faceDownIdx.length === 0) return null;

  // Top face-down card = last face-down card in the pile
  const topIdx = faceDownIdx[faceDownIdx.length - 1];
  const card = { ...pile[topIdx], faceUp: true };
  // Remove it from currentPile
  s.piles[s.currentPile] = pile.filter((_, i) => i !== topIdx);

  // Destination pile: rank 1 → index 0, rank 13 → index 12
  const destPile = card.rank - 1;
  // Place face-up at the "bottom" means we insert before the face-down cards
  // Convention: face-up cards at the beginning, face-down at the end
  const dest = s.piles[destPile];
  const firstFaceDownInDest = dest.findIndex(c => !c.faceUp);
  if (firstFaceDownInDest === -1) {
    dest.push(card);
  } else {
    dest.splice(firstFaceDownInDest, 0, card);
  }

  s.currentPile = destPile;
  s.moves++;

  // Check lose: all 4 Kings (rank 13) are face-up → pile index 12 has 4 face-up cards
  const kingPile = s.piles[12];
  const faceUpKings = kingPile.filter(c => c.faceUp).length;
  if (faceUpKings >= 4) {
    // Check if all other cards are also face-up (win condition)
    const allNonKingsFaceUp = s.piles
      .slice(0, 12)
      .every(p => p.every(c => c.faceUp));
    if (allNonKingsFaceUp) {
      s.won = true;
    } else {
      s.lost = true;
    }
    return s;
  }

  // Check win: all 48 non-King cards face-up
  const allNonKingsFaceUp = s.piles
    .slice(0, 12)
    .every(p => p.every(c => c.faceUp));
  if (allNonKingsFaceUp) {
    s.won = true;
  }

  return s;
}

/** Returns true if there are still moves to make (face-down cards remain). */
export function clockHasNextCard(state: ClockState): boolean {
  if (state.won || state.lost) return false;
  const pile = state.piles[state.currentPile];
  return pile.some(c => !c.faceUp);
}

/** Count face-down cards remaining across all piles. */
export function clockFaceDownCount(state: ClockState): number {
  return state.piles.reduce((sum, pile) => sum + pile.filter(c => !c.faceUp).length, 0);
}
