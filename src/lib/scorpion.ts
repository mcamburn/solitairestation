import { type Card, SUITS, rankLabel, suitGlyph } from "./solitaire";

export type { Card };

export interface ScorpionState {
  tableau: Card[][];
  stock: Card[]; // 3 cards; deal one to each of first 3 columns when clicked
  completed: number; // number of K-to-A same-suit sequences removed (0-4 to win)
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

export function newScorpionGame(seed?: number): ScorpionState {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `sc-${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }
  const shuffled = shuffle(deck, seed ?? Date.now());

  // cols 0-3: 3 face-down + 4 face-up = 7 cards each (28 total)
  // cols 4-6: 7 face-up = 7 cards each (21 total)
  // total tableau: 49; remaining 3 = stock
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  let idx = 0;

  for (let col = 0; col < 4; col++) {
    for (let i = 0; i < 7; i++) {
      const c = { ...shuffled[idx++] };
      c.faceUp = i >= 3; // first 3 face-down, last 4 face-up
      tableau[col].push(c);
    }
  }

  for (let col = 4; col < 7; col++) {
    for (let i = 0; i < 7; i++) {
      const c = { ...shuffled[idx++] };
      c.faceUp = true;
      tableau[col].push(c);
    }
  }

  // Remaining 3 cards form the stock
  const stock: Card[] = shuffled.slice(idx).map(c => ({ ...c, faceUp: false }));

  return {
    tableau,
    stock,
    completed: 0,
    moves: 0,
    won: false,
    startedAt: Date.now(),
  };
}

export function cloneScorpion(s: ScorpionState): ScorpionState {
  return {
    ...s,
    tableau: s.tableau.map(col => col.map(c => ({ ...c }))),
    stock: s.stock.map(c => ({ ...c })),
  };
}

/** Flip the new top card of a column face-up if it was face-down */
function flipTop(col: Card[]): void {
  if (col.length > 0 && !col[col.length - 1].faceUp) {
    col[col.length - 1].faceUp = true;
  }
}

/**
 * Check and remove completed K-to-A same-suit sequences from the bottom of columns.
 */
function removeCompleted(s: ScorpionState): ScorpionState {
  let changed = true;
  while (changed) {
    changed = false;
    for (let col = 0; col < 7; col++) {
      const pile = s.tableau[col];
      if (pile.length < 13) continue;
      const tail = pile.slice(-13);
      // Must start with King and go down to Ace, same suit, all face-up
      let valid = tail[0].rank === 13 && tail[0].faceUp;
      for (let i = 1; i < 13 && valid; i++) {
        valid = tail[i].faceUp && tail[i].suit === tail[0].suit && tail[i].rank === tail[i - 1].rank - 1;
      }
      if (valid) {
        s.completed++;
        s.tableau[col] = pile.slice(0, -13);
        flipTop(s.tableau[col]);
        changed = true;
      }
    }
  }
  s.won = s.completed >= 4;
  return s;
}

/**
 * Scorpion placement rule:
 * Move group (starting at fromIndex) onto destTop if:
 * - destTop's rank is exactly 1 higher AND same suit as the bottom card of the moving group
 * - OR destination column is empty (any card/group can go there)
 */
export function canScorpionPlace(movingBottom: Card, destTop: Card | undefined): boolean {
  if (!destTop) return true; // empty column accepts anything
  return (
    movingBottom.suit === destTop.suit &&
    movingBottom.rank === destTop.rank - 1
  );
}

/**
 * Move cards from tableau[fromCol] starting at fromIndex to tableau[toCol].
 * fromIndex must point to a face-up card.
 */
export function tryScorpionMove(
  state: ScorpionState,
  fromCol: number,
  fromIndex: number,
  toCol: number
): ScorpionState | null {
  if (fromCol === toCol) return null;
  const srcPile = state.tableau[fromCol];
  if (fromIndex < 0 || fromIndex >= srcPile.length) return null;

  const movingCard = srcPile[fromIndex];
  if (!movingCard.faceUp) return null;

  const destPile = state.tableau[toCol];
  const destTop = destPile[destPile.length - 1];

  if (!canScorpionPlace(movingCard, destTop)) return null;

  const s = cloneScorpion(state);
  const group = s.tableau[fromCol].splice(fromIndex);
  s.tableau[toCol].push(...group);
  flipTop(s.tableau[fromCol]);
  s.moves++;
  return removeCompleted(s);
}

/** Deal stock: one card face-up to each of the first 3 columns. Only once. */
export function dealScorpionStock(state: ScorpionState): ScorpionState | null {
  if (state.stock.length === 0) return null;
  const s = cloneScorpion(state);
  for (let col = 0; col < 3; col++) {
    if (s.stock.length === 0) break;
    const c = s.stock.pop()!;
    c.faceUp = true;
    s.tableau[col].push(c);
  }
  s.moves++;
  return removeCompleted(s);
}

/* ---- Hint ---- */

function describeCard(c: Card): string {
  return `${rankLabel(c.rank)}${suitGlyph(c.suit)}`;
}

export interface ScorpionHint {
  fromCol: number;
  fromIndex: number;
  toCol: number; // -1 = deal stock
  description: string;
}

export function findScorpionHint(state: ScorpionState): ScorpionHint | null {
  // 1. Moves that reveal face-down cards
  for (let fromCol = 0; fromCol < 7; fromCol++) {
    const srcPile = state.tableau[fromCol];
    const firstUp = srcPile.findIndex(c => c.faceUp);
    if (firstUp <= 0) continue; // no face-down cards below
    const movingCard = srcPile[firstUp];
    for (let toCol = 0; toCol < 7; toCol++) {
      if (toCol === fromCol) continue;
      const destPile = state.tableau[toCol];
      const destTop = destPile[destPile.length - 1];
      if (canScorpionPlace(movingCard, destTop)) {
        return {
          fromCol,
          fromIndex: firstUp,
          toCol,
          description: `Move ${describeCard(movingCard)} from col ${fromCol + 1} to col ${toCol + 1} — reveals hidden card`,
        };
      }
    }
  }

  // 2. Any face-up group move
  for (let fromCol = 0; fromCol < 7; fromCol++) {
    const srcPile = state.tableau[fromCol];
    const firstUp = srcPile.findIndex(c => c.faceUp);
    if (firstUp < 0) continue;
    const movingCard = srcPile[firstUp];
    for (let toCol = 0; toCol < 7; toCol++) {
      if (toCol === fromCol) continue;
      const destPile = state.tableau[toCol];
      const destTop = destPile[destPile.length - 1];
      if (canScorpionPlace(movingCard, destTop)) {
        return {
          fromCol,
          fromIndex: firstUp,
          toCol,
          description: `Move ${describeCard(movingCard)} from col ${fromCol + 1} to col ${toCol + 1}`,
        };
      }
    }
  }

  // 3. Suggest dealing stock
  if (state.stock.length > 0) {
    return {
      fromCol: -1,
      fromIndex: -1,
      toCol: -1,
      description: "Deal 3 cards from the stock to the first 3 columns",
    };
  }

  return null;
}
