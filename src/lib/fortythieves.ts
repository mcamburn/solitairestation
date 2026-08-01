import { type Card, SUITS } from "./solitaire";

export type { Card };

export interface FortyThievesState {
  tableau: Card[][];      // 10 columns, each starts with 4 cards
  foundations: Card[][];  // 8 piles (2 per suit)
  stock: Card[];          // remaining 64 cards
  waste: Card[];          // drawn cards, top is playable
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

export function newFortyThievesGame(seed?: number): FortyThievesState {
  // Two decks, 104 cards
  const deck: Card[] = [];
  for (let d = 0; d < 2; d++) {
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 13; rank++) {
        deck.push({ id: `ft-${d}-${suit}-${rank}`, suit, rank, faceUp: true });
      }
    }
  }
  const shuffled = shuffle(deck, seed ?? Date.now());

  // 10 tableau columns, 4 cards each (40 cards), all face-up
  const tableau: Card[][] = Array.from({ length: 10 }, () => []);
  for (let col = 0; col < 10; col++) {
    for (let row = 0; row < 4; row++) {
      tableau[col].push({ ...shuffled[col * 4 + row], faceUp: true });
    }
  }

  // Remaining 64 cards go to stock, face-down
  const stock: Card[] = shuffled.slice(40).map(c => ({ ...c, faceUp: false }));

  return {
    tableau,
    foundations: Array.from({ length: 8 }, () => []),
    stock,
    waste: [],
    moves: 0,
    won: false,
    startedAt: Date.now(),
  };
}

export function cloneFortyThieves(s: FortyThievesState): FortyThievesState {
  return {
    ...s,
    tableau: s.tableau.map(col => col.map(c => ({ ...c }))),
    foundations: s.foundations.map(p => p.map(c => ({ ...c }))),
    stock: s.stock.map(c => ({ ...c })),
    waste: s.waste.map(c => ({ ...c })),
  };
}

/** Can a card be placed on a tableau column? Same-suit, descending. */
export function canPlaceFTTableau(moving: Card, destTop: Card | undefined): boolean {
  if (!destTop) return true; // empty column accepts any single card
  return moving.suit === destTop.suit && moving.rank === destTop.rank - 1;
}

/** Can a card be placed on a foundation pile? */
export function canPlaceFTFoundation(moving: Card, pile: Card[]): boolean {
  if (pile.length === 0) return moving.rank === 1; // Ace starts
  const top = pile[pile.length - 1];
  return moving.suit === top.suit && moving.rank === top.rank + 1;
}

/** Draw one card from stock to waste. */
export function ftDrawFromStock(state: FortyThievesState): FortyThievesState | null {
  if (state.stock.length === 0) return null;
  const s = cloneFortyThieves(state);
  const card = s.stock.pop()!;
  card.faceUp = true;
  s.waste.push(card);
  s.moves++;
  return s;
}

export type FTSource =
  | { kind: "waste" }
  | { kind: "tableau"; col: number };

/** Try to move top card from source to a foundation pile. */
export function ftMoveToFoundation(state: FortyThievesState, src: FTSource): FortyThievesState | null {
  const card = getTopCard(state, src);
  if (!card) return null;

  for (let i = 0; i < 8; i++) {
    if (canPlaceFTFoundation(card, state.foundations[i])) {
      const s = cloneFortyThieves(state);
      removeTopCard(s, src);
      s.foundations[i].push({ ...card });
      s.moves++;
      s.won = s.foundations.every(p => p.length === 13);
      return s;
    }
  }
  return null;
}

/** Try to move top card from source to a tableau column. */
export function ftMoveToTableau(state: FortyThievesState, src: FTSource, destCol: number): FortyThievesState | null {
  if (src.kind === "tableau" && src.col === destCol) return null;
  const card = getTopCard(state, src);
  if (!card) return null;
  const destTop = state.tableau[destCol][state.tableau[destCol].length - 1];
  if (!canPlaceFTTableau(card, destTop)) return null;
  const s = cloneFortyThieves(state);
  removeTopCard(s, src);
  s.tableau[destCol].push({ ...card });
  s.moves++;
  return s;
}

function getTopCard(state: FortyThievesState, src: FTSource): Card | null {
  if (src.kind === "waste") {
    return state.waste.length > 0 ? state.waste[state.waste.length - 1] : null;
  }
  const col = state.tableau[src.col];
  return col.length > 0 ? col[col.length - 1] : null;
}

function removeTopCard(s: FortyThievesState, src: FTSource) {
  if (src.kind === "waste") {
    s.waste.pop();
  } else {
    s.tableau[src.col].pop();
  }
}

export interface FTHint {
  src: FTSource;
  destKind: "foundation" | "tableau";
  destIndex?: number;
  description: string;
}

function rankLabel(r: number): string {
  if (r === 1) return "A";
  if (r === 11) return "J";
  if (r === 12) return "Q";
  if (r === 13) return "K";
  return String(r);
}

function suitGlyph(s: string): string {
  return ({ spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣" } as Record<string, string>)[s] ?? s;
}

function descCard(c: Card): string {
  return `${rankLabel(c.rank)}${suitGlyph(c.suit)}`;
}

export function findFTHint(state: FortyThievesState): FTHint | null {
  const sources: FTSource[] = [];
  if (state.waste.length > 0) sources.push({ kind: "waste" });
  for (let c = 0; c < 10; c++) {
    if (state.tableau[c].length > 0) sources.push({ kind: "tableau", col: c });
  }

  // 1. To foundation
  for (const src of sources) {
    const card = getTopCard(state, src);
    if (!card) continue;
    for (let i = 0; i < 8; i++) {
      if (canPlaceFTFoundation(card, state.foundations[i])) {
        return { src, destKind: "foundation", destIndex: i, description: `Move ${descCard(card)} to foundation` };
      }
    }
  }

  // 2. To tableau (prefer non-empty)
  for (const src of sources) {
    const card = getTopCard(state, src);
    if (!card) continue;
    for (let c = 0; c < 10; c++) {
      if (src.kind === "tableau" && src.col === c) continue;
      const top = state.tableau[c][state.tableau[c].length - 1];
      if (top && canPlaceFTTableau(card, top)) {
        return { src, destKind: "tableau", destIndex: c, description: `Move ${descCard(card)} onto ${descCard(top)}` };
      }
    }
  }

  // 3. To empty tableau
  for (const src of sources) {
    const card = getTopCard(state, src);
    if (!card) continue;
    for (let c = 0; c < 10; c++) {
      if (src.kind === "tableau" && src.col === c) continue;
      if (state.tableau[c].length === 0) {
        return { src, destKind: "tableau", destIndex: c, description: `Move ${descCard(card)} to empty column` };
      }
    }
  }

  // 4. Draw from stock
  if (state.stock.length > 0) {
    return { src: { kind: "waste" }, destKind: "tableau", description: "Draw a card from the stock" };
  }

  return null;
}
