import { type Card, SUITS } from "./solitaire";

export type { Card };

export interface PyramidState {
  // pyramid[row][col]: row 0 = apex (1 card), row 6 = base (7 cards)
  pyramid: (Card | null)[][];
  stock: Card[];
  waste: Card[];
  moves: number;
  won: boolean;
  startedAt: number;
}

export type PyramidSel =
  | { kind: "pyramid"; row: number; col: number }
  | { kind: "waste" };

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

export function newPyramidGame(seed?: number): PyramidState {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `py-${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }
  const shuffled = shuffle(deck, seed ?? Date.now());

  // Build pyramid: row 0 → 1 card, row 6 → 7 cards (28 total)
  const pyramid: (Card | null)[][] = [];
  let idx = 0;
  for (let row = 0; row < 7; row++) {
    const rowArr: (Card | null)[] = [];
    for (let col = 0; col <= row; col++) {
      rowArr.push({ ...shuffled[idx++], faceUp: false });
    }
    pyramid.push(rowArr);
  }

  const state: PyramidState = {
    pyramid,
    stock: shuffled.slice(idx).map(c => ({ ...c, faceUp: false })),
    waste: [],
    moves: 0,
    won: false,
    startedAt: Date.now(),
  };
  return updateFaceUp(state);
}

/**
 * Returns true if the player still has at least one legal move reachable
 * from the current position, including moves that would become available
 * after drawing from stock or recycling the waste pile.
 *
 * Call this only when stock.length === 0 to determine whether the game is
 * stuck in a no-move loop (recycle would just cycle the same cards forever).
 */
export function hasPyramidMoves(state: PyramidState): boolean {
  // Collect ranks of all currently available (face-up, unblocked) pyramid cards
  const availableRanks: number[] = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col <= row; col++) {
      if (isPyramidAvailable(state.pyramid, row, col)) {
        availableRanks.push(state.pyramid[row][col]!.rank);
      }
    }
  }

  // Available pyramid King — can be removed immediately
  if (availableRanks.includes(13)) return true;

  // Available pyramid pair summing to 13
  for (let i = 0; i < availableRanks.length; i++) {
    for (let j = i + 1; j < availableRanks.length; j++) {
      if (availableRanks[i] + availableRanks[j] === 13) return true;
    }
  }

  // All drawable cards: current waste top is accessible now; the rest of the
  // waste pile will become accessible one-by-one after recycling (stock = 0).
  // Also scan remaining stock cards for completeness (caller may pass state
  // while stock > 0, e.g. for the waste-top-only fast path).
  const drawable = [...state.stock, ...state.waste];
  for (const card of drawable) {
    // A drawable King can be removed once it becomes the waste top
    if (card.rank === 13) return true;
    // A drawable card that pairs with any available pyramid card
    if (availableRanks.some(r => r + card.rank === 13)) return true;
  }

  return false;
}
export function clonePyramid(s: PyramidState): PyramidState {
  return {
    ...s,
    pyramid: s.pyramid.map(row => row.map(c => (c ? { ...c } : null))),
    stock: s.stock.map(c => ({ ...c })),
    waste: s.waste.map(c => ({ ...c })),
  };
}

/** A pyramid card is available (playable) when both cards below it are removed */
export function isPyramidAvailable(pyramid: (Card | null)[][], row: number, col: number): boolean {
  if (pyramid[row][col] === null) return false;
  if (row === 6) return true;
  const nextRow = pyramid[row + 1];
  return nextRow[col] === null && nextRow[col + 1] === null;
}

function updateFaceUp(s: PyramidState): PyramidState {
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col <= row; col++) {
      if (s.pyramid[row][col] !== null) {
        s.pyramid[row][col]!.faceUp = isPyramidAvailable(s.pyramid, row, col);
      }
    }
  }
  return s;
}

function getCard(state: PyramidState, sel: PyramidSel): Card | null {
  if (sel.kind === "waste") return state.waste[state.waste.length - 1] ?? null;
  return state.pyramid[sel.row][sel.col];
}

export function drawPyramidStock(state: PyramidState): PyramidState | null {
  if (state.stock.length === 0) {
    // Recycle waste back to stock
    if (state.waste.length === 0) return null;
    const s = clonePyramid(state);
    s.stock = [...s.waste].reverse().map(c => ({ ...c, faceUp: false }));
    s.waste = [];
    s.moves++;
    return s;
  }
  const s = clonePyramid(state);
  const card = s.stock.pop()!;
  s.waste.push({ ...card, faceUp: true });
  s.moves++;
  return s;
}

/**
 * Returns true if the player has at least one legal move remaining.
 *
 * Correctly handles the Pyramid recycle rule: when stock is empty the waste
 * pile can be recycled back, so every card in stock+waste is a future waste
 * top. The game is only truly stuck when no card in stock+waste would create
 * a removal with any currently-available pyramid card (and no pyramid-only
 * pair/King exists either).
 */
export function hasAnyPyramidMove(state: PyramidState): boolean {
  // Collect ranks of all currently available (unblocked) pyramid cards
  const availableRanks: number[] = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col <= row; col++) {
      const c = state.pyramid[row][col];
      if (c && isPyramidAvailable(state.pyramid, row, col)) {
        availableRanks.push(c.rank);
      }
    }
  }

  // Available pyramid King — removable immediately
  if (availableRanks.includes(13)) return true;

  // Available pyramid pair summing to 13
  for (let i = 0; i < availableRanks.length; i++)
    for (let j = i + 1; j < availableRanks.length; j++)
      if (availableRanks[i] + availableRanks[j] === 13) return true;

  // Any card reachable via stock draws or waste recycle creates a match
  const drawable = [...state.stock, ...state.waste];
  for (const card of drawable) {
    if (card.rank === 13) return true; // King waste removal
    if (availableRanks.some(r => r + card.rank === 13)) return true;
  }

  return false;
}

/**
 * Try to remove a card (King alone) or a pair summing to 13.
 * selB is null for a lone King.
 */
export function tryPyramidRemove(
  state: PyramidState,
  selA: PyramidSel,
  selB: PyramidSel | null
): PyramidState | null {
  const cardA = getCard(state, selA);
  if (!cardA) return null;

  // Availability check for pyramid cards
  if (selA.kind === "pyramid" && !isPyramidAvailable(state.pyramid, selA.row, selA.col)) return null;

  if (selB === null) {
    // King alone
    if (cardA.rank !== 13) return null;
    const s = clonePyramid(state);
    if (selA.kind === "pyramid") s.pyramid[selA.row][selA.col] = null;
    else s.waste.pop();
    s.moves++;
    s.won = s.pyramid.every(row => row.every(c => c === null));
    return updateFaceUp(s);
  }

  const cardB = getCard(state, selB);
  if (!cardB) return null;
  if (cardA.rank + cardB.rank !== 13) return null;
  if (selB.kind === "pyramid" && !isPyramidAvailable(state.pyramid, selB.row, selB.col)) return null;

  const s = clonePyramid(state);
  if (selA.kind === "pyramid") s.pyramid[selA.row][selA.col] = null;
  else s.waste.pop();
  if (selB.kind === "pyramid") s.pyramid[selB.row][selB.col] = null;
  else s.waste.pop();
  s.moves++;
  s.won = s.pyramid.every(row => row.every(c => c === null));
  return updateFaceUp(s);
}

/* ---- Hint ---- */

function pyRankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export interface PyramidHint {
  selA: PyramidSel;
  selB: PyramidSel | null;
  description: string;
}

export function findPyramidHint(state: PyramidState): PyramidHint | null {
  const available: { row: number; col: number; rank: number }[] = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col <= row; col++) {
      const card = state.pyramid[row][col];
      if (card && isPyramidAvailable(state.pyramid, row, col)) {
        available.push({ row, col, rank: card.rank });
      }
    }
  }

  const wasteCard = state.waste[state.waste.length - 1];

  // 1. King on pyramid
  const pKing = available.find((a) => a.rank === 13);
  if (pKing) {
    return {
      selA: { kind: "pyramid", row: pKing.row, col: pKing.col },
      selB: null,
      description: "Remove the King from the pyramid",
    };
  }

  // 2. King as waste top
  if (wasteCard?.rank === 13) {
    return {
      selA: { kind: "waste" },
      selB: null,
      description: "Remove the King from the waste pile",
    };
  }

  // 3. Pyramid–pyramid pair summing to 13
  for (let i = 0; i < available.length; i++) {
    for (let j = i + 1; j < available.length; j++) {
      if (available[i].rank + available[j].rank === 13) {
        return {
          selA: { kind: "pyramid", row: available[i].row, col: available[i].col },
          selB: { kind: "pyramid", row: available[j].row, col: available[j].col },
          description: `Pair ${pyRankLabel(available[i].rank)} and ${pyRankLabel(available[j].rank)} on the pyramid`,
        };
      }
    }
  }

  // 4. Pyramid–waste pair
  if (wasteCard) {
    const partner = available.find((a) => a.rank + wasteCard.rank === 13);
    if (partner) {
      return {
        selA: { kind: "waste" },
        selB: { kind: "pyramid", row: partner.row, col: partner.col },
        description: `Pair waste ${pyRankLabel(wasteCard.rank)} with pyramid ${pyRankLabel(partner.rank)}`,
      };
    }
  }

  // 5. Suggest drawing
  if (state.stock.length > 0) {
    return {
      selA: { kind: "waste" },
      selB: null,
      description: "Draw a card from the stock pile",
    };
  }
  if (state.waste.length > 0) {
    return {
      selA: { kind: "waste" },
      selB: null,
      description: "Recycle the waste pile back to stock",
    };
  }

  return null;
}
