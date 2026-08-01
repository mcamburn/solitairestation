export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Color = "red" | "black";
export type KlondikeMode = "draw1" | "draw3" | "vegas" | "double";

export interface Card {
  id: string;
  suit: Suit;
  rank: number; // 1..13 (A=1, J=11, Q=12, K=13)
  faceUp: boolean;
}

export interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // 4 piles (standard) or 8 piles (double)
  tableau: Card[][];     // 7 piles (standard) or 9 piles (double)
  moves: number;
  score: number;
  startedAt: number;
  won: boolean;
  mode: KlondikeMode;
  passes: number;        // how many times the waste was recycled back to stock
}

export const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

export const suitColor = (s: Suit): Color =>
  s === "hearts" || s === "diamonds" ? "red" : "black";

export const suitGlyph = (s: Suit): string =>
  ({ spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣" }[s]);

export const rankLabel = (r: number): string =>
  r === 1 ? "A" : r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : String(r);

/** Max waste→stock recycles allowed (Infinity = no limit). */
export const maxPasses = (mode: KlondikeMode): number =>
  mode === "vegas" ? 3 : Infinity;

/** Number of cards drawn per stock tap. */
export const drawCount = (mode: KlondikeMode): number =>
  mode === "draw3" || mode === "vegas" ? 3 : 1;

/** Vegas net score: -$52 wager + $5 per foundation card. */
export const vegasNet = (state: GameState): number =>
  state.score - 52;

function shuffle<T>(a: T[], seed = Date.now()): T[] {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function newGame(mode: KlondikeMode = "draw1", seed?: number): GameState {
  const isDouble = mode === "double";
  const deckCount = isDouble ? 2 : 1;

  const deck: Card[] = [];
  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (let r = 1; r <= 13; r++) {
        deck.push({
          id: isDouble ? `${suit}-${r}-${d}` : `${suit}-${r}`,
          suit,
          rank: r,
          faceUp: false,
        });
      }
    }
  }

  const shuffled = shuffle(deck, seed);
  const cols = isDouble ? 9 : 7;
  const tableau: Card[][] = Array.from({ length: cols }, () => []);
  let idx = 0;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row <= col; row++) {
      const c = shuffled[idx++];
      c.faceUp = row === col;
      tableau[col].push(c);
    }
  }

  const foundations: Card[][] = Array.from({ length: isDouble ? 8 : 4 }, () => []);
  const stock = shuffled.slice(idx).map((c) => ({ ...c, faceUp: false }));

  return {
    stock,
    waste: [],
    foundations,
    tableau,
    moves: 0,
    score: isDouble ? 0 : 0, // Vegas starts at 0; display adds -52 offset
    startedAt: Date.now(),
    won: false,
    mode,
    passes: 0,
  };
}

export function clone(s: GameState): GameState {
  return {
    ...s,
    stock: s.stock.map((c) => ({ ...c })),
    waste: s.waste.map((c) => ({ ...c })),
    foundations: s.foundations.map((p) => p.map((c) => ({ ...c }))),
    tableau: s.tableau.map((p) => p.map((c) => ({ ...c }))),
  };
}

/** Returns null when Vegas pass limit is already reached. */
export function canDraw(state: GameState): boolean {
  if (state.stock.length > 0) return true;
  return state.passes < maxPasses(state.mode);
}

export function drawFromStock(state: GameState): GameState {
  const s = clone(state);
  const draw = drawCount(s.mode);
  const limit = maxPasses(s.mode);

  if (s.stock.length === 0) {
    if (s.passes >= limit) return s; // Vegas: no more cycling
    s.stock = s.waste.slice().reverse().map((c) => ({ ...c, faceUp: false }));
    s.waste = [];
    s.passes++;
  } else {
    const toDraw = Math.min(draw, s.stock.length);
    for (let i = 0; i < toDraw; i++) {
      const c = s.stock.pop()!;
      c.faceUp = true;
      s.waste.push(c);
    }
  }
  s.moves++;
  return s;
}

export function canPlaceOnTableau(moving: Card, target: Card | undefined): boolean {
  if (!target) return moving.rank === 13; // empty pile takes King
  if (!target.faceUp) return false;
  return suitColor(moving.suit) !== suitColor(target.suit) && moving.rank === target.rank - 1;
}

export function canPlaceOnFoundation(moving: Card, pile: Card[]): boolean {
  if (pile.length === 0) return moving.rank === 1;
  const top = pile[pile.length - 1];
  return moving.suit === top.suit && moving.rank === top.rank + 1;
}

export type Source =
  | { kind: "waste" }
  | { kind: "tableau"; col: number; index: number }
  | { kind: "foundation"; pile: number };

export function getMovingCards(state: GameState, src: Source): Card[] {
  if (src.kind === "waste") {
    const c = state.waste[state.waste.length - 1];
    return c ? [c] : [];
  }
  if (src.kind === "tableau") {
    return state.tableau[src.col].slice(src.index);
  }
  const p = state.foundations[src.pile];
  const c = p[p.length - 1];
  return c ? [c] : [];
}

function removeFromSource(s: GameState, src: Source, count: number) {
  if (src.kind === "waste") s.waste.splice(s.waste.length - count, count);
  else if (src.kind === "tableau") s.tableau[src.col].splice(src.index, count);
  else s.foundations[src.pile].splice(s.foundations[src.pile].length - count, count);
  if (src.kind === "tableau") {
    const col = s.tableau[src.col];
    if (col.length > 0 && !col[col.length - 1].faceUp) col[col.length - 1].faceUp = true;
  }
}

export function tryMoveToTableau(state: GameState, src: Source, destCol: number): GameState | null {
  const moving = getMovingCards(state, src);
  if (moving.length === 0 || !moving[0].faceUp) return null;
  const dest = state.tableau[destCol];
  const top = dest[dest.length - 1];
  if (!canPlaceOnTableau(moving[0], top)) return null;
  if (src.kind === "tableau" && src.col === destCol) return null;
  const s = clone(state);
  removeFromSource(s, src, moving.length);
  s.tableau[destCol].push(...moving.map((c) => ({ ...c })));
  s.moves++;
  return checkWin(s);
}

export function tryMoveToFoundation(state: GameState, src: Source, pileIndex?: number): GameState | null {
  const moving = getMovingCards(state, src);
  if (moving.length !== 1) return null;
  const card = moving[0];
  if (!card.faceUp) return null;
  const pointsPerCard = state.mode === "vegas" ? 5 : 10;
  const tryPile = (i: number): GameState | null => {
    if (!canPlaceOnFoundation(card, state.foundations[i])) return null;
    const s = clone(state);
    removeFromSource(s, src, 1);
    s.foundations[i].push({ ...card });
    s.score += pointsPerCard;
    s.moves++;
    return checkWin(s);
  };
  if (pileIndex !== undefined) return tryPile(pileIndex);
  for (let i = 0; i < state.foundations.length; i++) {
    const r = tryPile(i);
    if (r) return r;
  }
  return null;
}

export function autoMoveToFoundation(state: GameState, src: Source): GameState | null {
  return tryMoveToFoundation(state, src);
}

function checkWin(s: GameState): GameState {
  s.won = s.foundations.every((p) => p.length === 13);
  return s;
}

export function elapsed(state: GameState): string {
  const secs = Math.floor((Date.now() - state.startedAt) / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export interface Hint {
  source: Source;
  description: string;
}

function describeCard(c: Card): string {
  return `${rankLabel(c.rank)}${suitGlyph(c.suit)}`;
}

export function findHint(state: GameState): Hint | null {
  const wasteTop = state.waste[state.waste.length - 1];
  const numFoundations = state.foundations.length;
  const numCols = state.tableau.length;

  // 1. Any card to foundation
  if (wasteTop) {
    for (let i = 0; i < numFoundations; i++) {
      if (canPlaceOnFoundation(wasteTop, state.foundations[i])) {
        return {
          source: { kind: "waste" },
          description: `Move ${describeCard(wasteTop)} from waste to foundation`,
        };
      }
    }
  }
  for (let col = 0; col < numCols; col++) {
    const pile = state.tableau[col];
    const top = pile[pile.length - 1];
    if (!top || !top.faceUp) continue;
    for (let i = 0; i < numFoundations; i++) {
      if (canPlaceOnFoundation(top, state.foundations[i])) {
        return {
          source: { kind: "tableau", col, index: pile.length - 1 },
          description: `Move ${describeCard(top)} from column ${col + 1} to foundation`,
        };
      }
    }
  }

  // 2. Tableau moves that flip a face-down card
  for (let col = 0; col < numCols; col++) {
    const pile = state.tableau[col];
    if (pile.length === 0) continue;
    const firstUp = pile.findIndex((c) => c.faceUp);
    if (firstUp <= 0) continue;
    const moving = pile[firstUp];
    for (let dest = 0; dest < numCols; dest++) {
      if (dest === col) continue;
      const destTop = state.tableau[dest][state.tableau[dest].length - 1];
      if (canPlaceOnTableau(moving, destTop)) {
        return {
          source: { kind: "tableau", col, index: firstUp },
          description: `Move ${describeCard(moving)} from column ${col + 1} to column ${dest + 1} to reveal a hidden card`,
        };
      }
    }
  }

  // 3. Waste to tableau
  if (wasteTop) {
    for (let dest = 0; dest < numCols; dest++) {
      const destTop = state.tableau[dest][state.tableau[dest].length - 1];
      if (canPlaceOnTableau(wasteTop, destTop)) {
        return {
          source: { kind: "waste" },
          description: `Move ${describeCard(wasteTop)} from waste to column ${dest + 1}`,
        };
      }
    }
  }

  // 4. Tableau to tableau
  for (let col = 0; col < numCols; col++) {
    const pile = state.tableau[col];
    if (pile.length === 0) continue;
    const firstUp = pile.findIndex((c) => c.faceUp);
    if (firstUp < 0) continue;
    const moving = pile[firstUp];
    if (moving.rank === 13 && firstUp === 0) continue;
    for (let dest = 0; dest < numCols; dest++) {
      if (dest === col) continue;
      const destPile = state.tableau[dest];
      const destTop = destPile[destPile.length - 1];
      if (canPlaceOnTableau(moving, destTop)) {
        return {
          source: { kind: "tableau", col, index: firstUp },
          description: `Move ${describeCard(moving)} from column ${col + 1} to column ${dest + 1}`,
        };
      }
    }
  }

  // 5. Stock actions
  if (canDraw(state)) {
    return {
      source: { kind: "waste" },
      description: state.stock.length > 0 ? "Draw a card from the stock" : "Recycle the waste pile back into the stock",
    };
  }

  return null;
}
