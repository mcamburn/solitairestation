import { type Card, SUITS } from "./solitaire";

export type { Card };

/**
 * TriPeaks layout — 28 pyramid cards + 24 in stock
 *
 * Visual grid (x in card-width units, row 0 = top):
 *
 *      [0]         [1]         [2]      ← row 0 (peak tips)
 *    [3] [4]     [5] [6]     [7] [8]   ← row 1
 *  [9][10][11] [12][13][14] [15][16][17]← row 2
 * [18][19][20][21][22][23][24][25][26][27]← row 3 (base, 10 cards)
 */

// x position (in card-width units) and row for each of the 28 cards
export const CARD_POS: Array<{ x: number; row: number }> = [
  { x: 1.5, row: 0 }, // 0  peak 1 tip
  { x: 4.5, row: 0 }, // 1  peak 2 tip
  { x: 7.5, row: 0 }, // 2  peak 3 tip
  { x: 1,   row: 1 }, // 3
  { x: 2,   row: 1 }, // 4
  { x: 4,   row: 1 }, // 5
  { x: 5,   row: 1 }, // 6
  { x: 7,   row: 1 }, // 7
  { x: 8,   row: 1 }, // 8
  { x: 0.5, row: 2 }, // 9
  { x: 1.5, row: 2 }, // 10
  { x: 2.5, row: 2 }, // 11
  { x: 3.5, row: 2 }, // 12
  { x: 4.5, row: 2 }, // 13
  { x: 5.5, row: 2 }, // 14
  { x: 6.5, row: 2 }, // 15
  { x: 7.5, row: 2 }, // 16
  { x: 8.5, row: 2 }, // 17
  { x: 0,   row: 3 }, // 18 base
  { x: 1,   row: 3 }, // 19
  { x: 2,   row: 3 }, // 20
  { x: 3,   row: 3 }, // 21
  { x: 4,   row: 3 }, // 22
  { x: 5,   row: 3 }, // 23
  { x: 6,   row: 3 }, // 24
  { x: 7,   row: 3 }, // 25
  { x: 8,   row: 3 }, // 26
  { x: 9,   row: 3 }, // 27
];

// Cards that must be removed before card i becomes available
const COVERS: number[][] = [
  /* 0 */ [3, 4],
  /* 1 */ [5, 6],
  /* 2 */ [7, 8],
  /* 3 */ [9, 10],
  /* 4 */ [10, 11],
  /* 5 */ [12, 13],
  /* 6 */ [13, 14],
  /* 7 */ [15, 16],
  /* 8 */ [16, 17],
  /* 9 */ [18, 19],
  /* 10 */ [19, 20],
  /* 11 */ [20, 21],
  /* 12 */ [21, 22],
  /* 13 */ [22, 23],
  /* 14 */ [23, 24],
  /* 15 */ [24, 25],
  /* 16 */ [25, 26],
  /* 17 */ [26, 27],
  // 18-27: base row — no covers
];

export interface TriPeaksState {
  cards: (Card | null)[]; // 28 pyramid cards; null = removed
  stock: Card[];
  waste: Card[];
  moves: number;
  won: boolean;
  startedAt: number;
  streak: number; // consecutive plays without drawing
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

function refreshFaceUp(cards: (Card | null)[]): (Card | null)[] {
  return cards.map((c, i) => {
    if (!c) return null;
    return { ...c, faceUp: isTPAvailable(cards, i) };
  });
}

export function newTriPeaksGame(seed?: number): TriPeaksState {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `tp-${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }
  const shuffled = shuffle(deck, seed ?? Date.now());
  const rawCards: (Card | null)[] = shuffled.slice(0, 28).map((c, i) => ({
    ...c,
    faceUp: i >= 18, // base row starts face-up
  }));
  const cards = refreshFaceUp(rawCards);
  const stock = shuffled.slice(28).map(c => ({ ...c, faceUp: false }));
  return { cards, stock, waste: [], moves: 0, won: false, startedAt: Date.now(), streak: 0 };
}

/**
 * Returns true if the player still has at least one legal move.
 * Used to detect an unsolvable/stuck position.
 * Assumes stock is empty (caller should check stock.length === 0).
 */
export function hasTPMoves(state: TriPeaksState): boolean {
  const wasteTop = state.waste[state.waste.length - 1];
  if (!wasteTop) return false;
  return state.cards.some(
    (c, i) => c !== null && isTPAvailable(state.cards, i) && canPlayOnWaste(c, wasteTop)
  );
}
export function cloneTriPeaks(s: TriPeaksState): TriPeaksState {
  return {
    ...s,
    cards: s.cards.map(c => (c ? { ...c } : null)),
    stock: s.stock.map(c => ({ ...c })),
    waste: s.waste.map(c => ({ ...c })),
  };
}

export function isTPAvailable(cards: (Card | null)[], idx: number): boolean {
  if (!cards[idx]) return false;
  const covers = COVERS[idx];
  if (!covers) return true; // base row
  return covers.every(c => cards[c] === null);
}

/** Card can be played if its rank is ±1 from the waste top (A wraps with K) */
export function canPlayOnWaste(card: Card, wasteTop: Card | undefined): boolean {
  if (!wasteTop) return false;
  const diff = Math.abs(card.rank - wasteTop.rank);
  return diff === 1 || diff === 12; // K-A wrap
}

export function tryPlayTPCard(state: TriPeaksState, idx: number): TriPeaksState | null {
  if (!isTPAvailable(state.cards, idx)) return null;
  const card = state.cards[idx]!;
  if (!canPlayOnWaste(card, state.waste[state.waste.length - 1])) return null;

  const s = cloneTriPeaks(state);
  s.cards[idx] = null;
  s.waste.push({ ...card, faceUp: true });
  s.cards = refreshFaceUp(s.cards);
  s.moves++;
  s.streak++;
  s.won = s.cards.every(c => c === null);
  return s;
}

/**
 * Returns true if the player has at least one legal move remaining.
 * Stuck = stock empty AND no available board card plays on the current waste top.
 */
export function hasAnyTPMove(state: TriPeaksState): boolean {
  if (state.stock.length > 0) return true;
  const wasteTop = state.waste[state.waste.length - 1];
  if (!wasteTop) return false;
  for (let i = 0; i < 28; i++) {
    const c = state.cards[i];
    if (c && isTPAvailable(state.cards, i) && canPlayOnWaste(c, wasteTop)) return true;
  }
  return false;
}

export function drawTPStock(state: TriPeaksState): TriPeaksState | null {
  if (state.stock.length === 0) return null;
  const s = cloneTriPeaks(state);
  const card = s.stock.pop()!;
  s.waste.push({ ...card, faceUp: true });
  s.moves++;
  s.streak = 0;
  return s;
}

/* ---- Hint ---- */

function tpRankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export interface TPHint {
  /** Board card index to highlight, or -1 to suggest drawing from stock */
  cardIdx: number;
  description: string;
}

export function findTPHint(state: TriPeaksState): TPHint | null {
  const wasteTop = state.waste[state.waste.length - 1];
  if (wasteTop) {
    for (let i = 0; i < 28; i++) {
      const card = state.cards[i];
      if (card && isTPAvailable(state.cards, i) && canPlayOnWaste(card, wasteTop)) {
        return {
          cardIdx: i,
          description: `Play ${tpRankLabel(card.rank)} onto the waste pile`,
        };
      }
    }
  }
  if (state.stock.length > 0) {
    return { cardIdx: -1, description: "Draw a card from the stock pile" };
  }
  return null;
}
