import { type Card, SUITS, suitColor, rankLabel, suitGlyph } from "./solitaire";

export type { Card };

export interface YukonState {
  tableau: Card[][];
  foundations: Card[][]; // 4 piles, build up by suit from Ace
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

export function newYukonGame(seed?: number): YukonState {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `yk-${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }
  const shuffled = shuffle(deck, seed ?? Date.now());

  // Standard Klondike diagonal:
  // col i (0-indexed) gets i+1 cards, the bottom i face-down and top 1 face-up
  // Then the remaining 24 cards are distributed 4 each to cols 1-6 (0-indexed), all face-up
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  let idx = 0;

  // Diagonal deal: col i gets i+1 cards
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const c = { ...shuffled[idx++] };
      c.faceUp = row === col; // only top card face-up
      tableau[col].push(c);
    }
  }

  // Distribute remaining 24 cards: 4 to each of cols 1-6 (0-indexed), face-up
  // idx is now at 28 (1+2+3+4+5+6+7 = 28), remaining = 52-28 = 24
  for (let extra = 0; extra < 4; extra++) {
    for (let col = 1; col < 7; col++) {
      const c = { ...shuffled[idx++] };
      c.faceUp = true;
      tableau[col].push(c);
    }
  }

  return {
    tableau,
    foundations: [[], [], [], []],
    moves: 0,
    won: false,
    startedAt: Date.now(),
  };
}

export function cloneYukon(s: YukonState): YukonState {
  return {
    ...s,
    tableau: s.tableau.map(col => col.map(c => ({ ...c }))),
    foundations: s.foundations.map(p => p.map(c => ({ ...c }))),
  };
}

/** Flip the new top card of a tableau column face-up if it's face-down */
function flipTop(col: Card[]): void {
  if (col.length > 0 && !col[col.length - 1].faceUp) {
    col[col.length - 1].faceUp = true;
  }
}

function checkWin(s: YukonState): YukonState {
  s.won = s.foundations.every(p => p.length === 13);
  return s;
}

/**
 * In Yukon, you can move any face-up card plus ALL cards on top of it,
 * regardless of whether they form a sequence. The only rule is:
 * the BOTTOM card of the group must be one rank lower and opposite color
 * from the destination column's top card.
 * Empty columns accept only Kings.
 */
export function canYukonPlace(movingBottom: Card, destTop: Card | undefined): boolean {
  if (!destTop) return movingBottom.rank === 13; // empty: only King
  return (
    suitColor(movingBottom.suit) !== suitColor(destTop.suit) &&
    movingBottom.rank === destTop.rank - 1
  );
}

export function canPlaceOnFoundation(moving: Card, pile: Card[]): boolean {
  if (pile.length === 0) return moving.rank === 1;
  const top = pile[pile.length - 1];
  return moving.suit === top.suit && moving.rank === top.rank + 1;
}

/**
 * Move cards from tableau[fromCol] starting at fromIndex to tableau[toCol].
 * The group must have at least one face-up card at fromIndex.
 */
export function tryYukonTableauMove(
  state: YukonState,
  fromCol: number,
  fromIndex: number,
  toCol: number
): YukonState | null {
  if (fromCol === toCol) return null;
  const srcPile = state.tableau[fromCol];
  if (fromIndex < 0 || fromIndex >= srcPile.length) return null;

  const movingCard = srcPile[fromIndex];
  if (!movingCard.faceUp) return null; // can only move face-up cards

  const destPile = state.tableau[toCol];
  const destTop = destPile[destPile.length - 1];

  if (!canYukonPlace(movingCard, destTop)) return null;

  const s = cloneYukon(state);
  const group = s.tableau[fromCol].splice(fromIndex);
  s.tableau[toCol].push(...group);
  flipTop(s.tableau[fromCol]);
  s.moves++;
  return checkWin(s);
}

/** Move a single top card from tableau to foundation */
export function tryYukonToFoundation(
  state: YukonState,
  fromCol: number,
  pileIndex?: number
): YukonState | null {
  const srcPile = state.tableau[fromCol];
  if (srcPile.length === 0) return null;
  const card = srcPile[srcPile.length - 1];
  if (!card.faceUp) return null;

  const tryPile = (i: number): YukonState | null => {
    if (!canPlaceOnFoundation(card, state.foundations[i])) return null;
    const s = cloneYukon(state);
    s.tableau[fromCol].pop();
    flipTop(s.tableau[fromCol]);
    s.foundations[i].push({ ...card });
    s.moves++;
    return checkWin(s);
  };

  if (pileIndex !== undefined) return tryPile(pileIndex);
  for (let i = 0; i < 4; i++) {
    const r = tryPile(i);
    if (r) return r;
  }
  return null;
}

/* ---- Hint ---- */

function describeCard(c: Card): string {
  return `${rankLabel(c.rank)}${suitGlyph(c.suit)}`;
}

export interface YukonHint {
  fromCol: number;
  fromIndex: number;
  toCol: number; // -1 = foundation
  description: string;
}

export function findYukonHint(state: YukonState): YukonHint | null {
  // 1. Top tableau card to foundation
  for (let col = 0; col < 7; col++) {
    const pile = state.tableau[col];
    if (pile.length === 0) continue;
    const top = pile[pile.length - 1];
    if (!top.faceUp) continue;
    for (let fi = 0; fi < 4; fi++) {
      if (canPlaceOnFoundation(top, state.foundations[fi])) {
        return {
          fromCol: col,
          fromIndex: pile.length - 1,
          toCol: -1,
          description: `Move ${describeCard(top)} to the foundation`,
        };
      }
    }
  }

  // 2. Tableau moves that reveal face-down cards (prefer these)
  for (let fromCol = 0; fromCol < 7; fromCol++) {
    const srcPile = state.tableau[fromCol];
    // Find first face-up card
    const firstUp = srcPile.findIndex(c => c.faceUp);
    if (firstUp <= 0) continue; // no face-down cards would be revealed
    const movingCard = srcPile[firstUp];
    for (let toCol = 0; toCol < 7; toCol++) {
      if (toCol === fromCol) continue;
      const destPile = state.tableau[toCol];
      const destTop = destPile[destPile.length - 1];
      if (canYukonPlace(movingCard, destTop)) {
        return {
          fromCol,
          fromIndex: firstUp,
          toCol,
          description: `Move ${describeCard(movingCard)} from col ${fromCol + 1} to col ${toCol + 1} — reveals hidden card`,
        };
      }
    }
  }

  // 3. Any tableau-to-tableau move
  for (let fromCol = 0; fromCol < 7; fromCol++) {
    const srcPile = state.tableau[fromCol];
    const firstUp = srcPile.findIndex(c => c.faceUp);
    if (firstUp < 0) continue;
    const movingCard = srcPile[firstUp];
    // Skip moving a lone King to an empty column — usually pointless
    if (movingCard.rank === 13 && firstUp === 0) continue;
    for (let toCol = 0; toCol < 7; toCol++) {
      if (toCol === fromCol) continue;
      const destPile = state.tableau[toCol];
      const destTop = destPile[destPile.length - 1];
      if (canYukonPlace(movingCard, destTop)) {
        return {
          fromCol,
          fromIndex: firstUp,
          toCol,
          description: `Move ${describeCard(movingCard)} from col ${fromCol + 1} to col ${toCol + 1}`,
        };
      }
    }
  }

  return null;
}
