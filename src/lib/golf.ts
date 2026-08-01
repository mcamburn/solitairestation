import { type Card, SUITS } from "./solitaire";

export type { Card };

export interface GolfState {
  tableau: Card[][];   // 7 columns, 5 cards each (all face-up)
  stock: Card[];       // 16 remaining cards, face-down
  waste: Card[];       // started with 1 card, grows as stock is drawn or tableau cards played
  moves: number;
  won: boolean;
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

export function newGolfGame(seed?: number): GolfState {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `golf-${suit}-${rank}`, suit, rank, faceUp: true });
    }
  }
  const shuffled = shuffle(deck, seed ?? Date.now());

  // 7 columns × 5 cards = 35 cards, all face-up
  const tableau: Card[][] = Array.from({ length: 7 }, (_, col) =>
    shuffled.slice(col * 5, col * 5 + 5).map(c => ({ ...c, faceUp: true }))
  );

  // 1 card to waste, 16 to stock (face-down)
  const wasteCard = { ...shuffled[35], faceUp: true };
  const stock = shuffled.slice(36).map(c => ({ ...c, faceUp: false }));

  return {
    tableau,
    stock,
    waste: [wasteCard],
    moves: 0,
    won: false,
    startedAt: Date.now(),
  };
}

export function cloneGolf(s: GolfState): GolfState {
  return {
    ...s,
    tableau: s.tableau.map(col => col.map(c => ({ ...c }))),
    stock: s.stock.map(c => ({ ...c })),
    waste: s.waste.map(c => ({ ...c })),
  };
}

/** Can the given rank be played onto the waste top? ±1, no wrapping (A≠K). */
export function canPlayOnWaste(cardRank: number, wasteTopRank: number): boolean {
  return Math.abs(cardRank - wasteTopRank) === 1;
}

/** Play the top card of a tableau column onto the waste pile. Returns null if illegal. */
export function playTableauCard(state: GolfState, col: number): GolfState | null {
  const column = state.tableau[col];
  if (column.length === 0) return null;
  const card = column[column.length - 1];
  const wasteTop = state.waste[state.waste.length - 1];
  if (!wasteTop) return null;
  if (!canPlayOnWaste(card.rank, wasteTop.rank)) return null;

  const s = cloneGolf(state);
  s.tableau[col] = s.tableau[col].slice(0, -1);
  s.waste.push({ ...card, faceUp: true });
  s.moves++;
  // Win: all tableau columns empty
  s.won = s.tableau.every(c => c.length === 0);
  return s;
}

/** Flip the top stock card onto the waste. Returns null if stock is empty. */
export function drawGolfStock(state: GolfState): GolfState | null {
  if (state.stock.length === 0) return null;
  const s = cloneGolf(state);
  const card = s.stock.pop()!;
  s.waste.push({ ...card, faceUp: true });
  s.moves++;
  return s;
}

/** Count total cards remaining in tableau (penalty score). */
export function tableauCardCount(state: GolfState): number {
  return state.tableau.reduce((sum, col) => sum + col.length, 0);
}

/** Returns true if the game is over (won or no valid moves and stock exhausted). */
export function isGolfGameOver(state: GolfState): boolean {
  if (state.won) return true;
  if (state.stock.length > 0) return false;
  const wasteTop = state.waste[state.waste.length - 1];
  if (!wasteTop) return true;
  return !state.tableau.some(col => {
    const top = col[col.length - 1];
    return top && canPlayOnWaste(top.rank, wasteTop.rank);
  });
}

export interface GolfHint {
  col: number;
  description: string;
}

export function findGolfHint(state: GolfState): GolfHint | null {
  const wasteTop = state.waste[state.waste.length - 1];
  if (!wasteTop) return null;
  for (let col = 0; col < state.tableau.length; col++) {
    const column = state.tableau[col];
    if (column.length === 0) continue;
    const top = column[column.length - 1];
    if (canPlayOnWaste(top.rank, wasteTop.rank)) {
      return { col, description: `Play column ${col + 1} top card onto waste` };
    }
  }
  return null;
}
