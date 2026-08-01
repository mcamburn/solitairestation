import { type Card, SUITS, suitColor } from "./solitaire";

export type { Card };

export type FCSrc =
  | { kind: "tableau"; col: number; index: number }
  | { kind: "freecell"; cell: number };

export type FCDest =
  | { kind: "tableau"; col: number }
  | { kind: "freecell"; cell: number }
  | { kind: "foundation"; pile: number };

export interface FreeCellState {
  tableau: Card[][];           // 8 columns, all face-up
  freeCells: (Card | null)[];  // 4 cells
  foundations: Card[][];       // 4 piles (suit determined by first ace placed)
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

export function newFreeCellGame(seed?: number): FreeCellState {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `fc-${suit}-${rank}`, suit, rank, faceUp: true });
    }
  }
  const shuffled = shuffle(deck, seed ?? Date.now());
  // Cols 0-3: 7 cards each, cols 4-7: 6 cards each (total 52)
  const tableau: Card[][] = Array.from({ length: 8 }, () => []);
  shuffled.forEach((c, i) => tableau[i % 8].push({ ...c }));
  return {
    tableau,
    freeCells: [null, null, null, null],
    foundations: [[], [], [], []],
    moves: 0,
    won: false,
    startedAt: Date.now(),
  };
}

export function cloneFreeCell(s: FreeCellState): FreeCellState {
  return {
    ...s,
    tableau: s.tableau.map(col => col.map(c => ({ ...c }))),
    freeCells: s.freeCells.map(c => (c ? { ...c } : null)),
    foundations: s.foundations.map(p => p.map(c => ({ ...c }))),
  };
}

export function getMovingFCCards(state: FreeCellState, src: FCSrc): Card[] {
  if (src.kind === "freecell") {
    const c = state.freeCells[src.cell];
    return c ? [c] : [];
  }
  return state.tableau[src.col].slice(src.index);
}

/** True when cards form an alternating-color descending sequence */
export function isValidFCSequence(cards: Card[]): boolean {
  for (let i = 0; i < cards.length - 1; i++) {
    if (suitColor(cards[i].suit) === suitColor(cards[i + 1].suit)) return false;
    if (cards[i].rank !== cards[i + 1].rank + 1) return false;
  }
  return true;
}

function maxMoveSize(state: FreeCellState, destIsEmpty?: boolean): number {
  const emptyCells = state.freeCells.filter(c => c === null).length;
  const emptyCols = state.tableau.filter(col => col.length === 0).length;
  const bonus = destIsEmpty ? Math.max(emptyCols - 1, 0) : emptyCols;
  return (emptyCells + 1) * Math.pow(2, bonus);
}

export function canFCMove(state: FreeCellState, src: FCSrc, dest: FCDest): boolean {
  const cards = getMovingFCCards(state, src);
  if (cards.length === 0) return false;

  if (dest.kind === "freecell") {
    return cards.length === 1 && state.freeCells[dest.cell] === null;
  }

  if (dest.kind === "foundation") {
    if (cards.length !== 1) return false;
    const card = cards[0];
    const pile = state.foundations[dest.pile];
    if (pile.length === 0) return card.rank === 1;
    const top = pile[pile.length - 1];
    return card.suit === top.suit && card.rank === top.rank + 1;
  }

  // Tableau
  if (!isValidFCSequence(cards)) return false;
  const destCol = state.tableau[dest.col];
  const destEmpty = destCol.length === 0;
  if (cards.length > maxMoveSize(state, destEmpty)) return false;
  if (destEmpty) return true;
  const destTop = destCol[destCol.length - 1];
  return suitColor(cards[0].suit) !== suitColor(destTop.suit) && cards[0].rank === destTop.rank - 1;
}

export function tryFCMove(state: FreeCellState, src: FCSrc, dest: FCDest): FreeCellState | null {
  if (!canFCMove(state, src, dest)) return null;
  const cards = getMovingFCCards(state, src);
  const s = cloneFreeCell(state);

  // Remove from source
  if (src.kind === "freecell") {
    s.freeCells[src.cell] = null;
  } else {
    s.tableau[src.col].splice(src.index, cards.length);
  }

  // Place at dest
  if (dest.kind === "freecell") {
    s.freeCells[dest.cell] = { ...cards[0] };
  } else if (dest.kind === "foundation") {
    s.foundations[dest.pile].push({ ...cards[0] });
  } else {
    s.tableau[dest.col].push(...cards.map(c => ({ ...c })));
  }

  s.moves++;
  s.won = s.foundations.every(p => p.length === 13);
  return s;
}

/** Double-click convenience: auto-move top card to any valid foundation */
export function autoFCToFoundation(state: FreeCellState, src: FCSrc): FreeCellState | null {
  const cards = getMovingFCCards(state, src);
  if (cards.length !== 1) return null;
  for (let i = 0; i < 4; i++) {
    const r = tryFCMove(state, src, { kind: "foundation", pile: i });
    if (r) return r;
  }
  return null;
}

/* ---- Hint ---- */

function fcRankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export interface FreeCellHint {
  src: FCSrc;
  description: string;
}

export function findFreeCellHint(state: FreeCellState): FreeCellHint | null {
  // Build all single-card sources (top of each tableau column + freecells)
  const singleSrcs: FCSrc[] = [];
  for (let col = 0; col < 8; col++) {
    const pile = state.tableau[col];
    if (pile.length > 0) singleSrcs.push({ kind: "tableau", col, index: pile.length - 1 });
  }
  for (let cell = 0; cell < 4; cell++) {
    if (state.freeCells[cell] !== null) singleSrcs.push({ kind: "freecell", cell });
  }

  // 1. Foundation moves (highest priority)
  for (const src of singleSrcs) {
    for (let pile = 0; pile < 4; pile++) {
      if (canFCMove(state, src, { kind: "foundation", pile })) {
        const cards = getMovingFCCards(state, src);
        return { src, description: `Move ${fcRankLabel(cards[0].rank)} to foundation` };
      }
    }
  }

  // 2. Tableau-to-tableau (include multi-card sequences)
  const allSrcs: FCSrc[] = [];
  for (let col = 0; col < 8; col++) {
    const pile = state.tableau[col];
    for (let index = 0; index < pile.length; index++) {
      allSrcs.push({ kind: "tableau", col, index });
    }
  }
  for (let cell = 0; cell < 4; cell++) {
    if (state.freeCells[cell] !== null) allSrcs.push({ kind: "freecell", cell });
  }

  for (const src of allSrcs) {
    for (let col = 0; col < 8; col++) {
      const srcCol = src.kind === "tableau" ? src.col : -1;
      if (srcCol === col) continue;
      const dest: FCDest = { kind: "tableau", col };
      if (canFCMove(state, src, dest)) {
        const cards = getMovingFCCards(state, src);
        const destPile = state.tableau[col];
        return {
          src,
          description:
            destPile.length === 0
              ? `Move ${fcRankLabel(cards[0].rank)} to empty column`
              : `Move ${fcRankLabel(cards[0].rank)} onto ${fcRankLabel(destPile[destPile.length - 1].rank)}`,
        };
      }
    }
  }

  // 3. Park in a free cell
  for (const src of singleSrcs) {
    for (let cell = 0; cell < 4; cell++) {
      if (canFCMove(state, src, { kind: "freecell", cell })) {
        const cards = getMovingFCCards(state, src);
        return { src, description: `Park ${fcRankLabel(cards[0].rank)} in a free cell` };
      }
    }
  }

  return null;
}
