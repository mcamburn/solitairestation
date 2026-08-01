import { type Card, type Suit, SUITS } from "./solitaire";

export type { Card };
export type SpiderDifficulty = 1 | 2 | 4;

export interface SpiderState {
  tableau: Card[][];
  stock: Card[][];   // 5 groups of 10 — deal one group at a time
  completed: number; // completed K–A sequences (0–8 to win)
  moves: number;
  won: boolean;
  startedAt: number;
  difficulty: SpiderDifficulty;
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

function makeDeck(difficulty: SpiderDifficulty): Card[] {
  const suitPool: Suit[] =
    difficulty === 1 ? ["spades"] :
    difficulty === 2 ? ["spades", "hearts"] :
    [...SUITS];
  const copies = 8 / suitPool.length; // 8, 4, or 2 copies per rank per suit

  const cards: Card[] = [];
  let id = 0;
  for (const suit of suitPool) {
    for (let rank = 1; rank <= 13; rank++) {
      for (let c = 0; c < copies; c++) {
        cards.push({ id: `sp${id++}`, suit, rank, faceUp: false });
      }
    }
  }
  return cards; // 104 cards
}

export function newSpiderGame(difficulty: SpiderDifficulty = 1, seed?: number): SpiderState {
  const deck = shuffle(makeDeck(difficulty), seed ?? Date.now());
  const tableau: Card[][] = Array.from({ length: 10 }, () => []);
  let idx = 0;
  for (let col = 0; col < 10; col++) {
    const count = col < 4 ? 6 : 5;
    for (let i = 0; i < count; i++) {
      tableau[col].push({ ...deck[idx++], faceUp: i === count - 1 });
    }
  }
  // Remaining 50 cards → 5 groups of 10
  const stock: Card[][] = Array.from({ length: 5 }, (_, g) =>
    deck.slice(idx + g * 10, idx + g * 10 + 10).map(c => ({ ...c, faceUp: false }))
  );
  return { tableau, stock, completed: 0, moves: 0, won: false, startedAt: Date.now(), difficulty };
}

export function cloneSpider(s: SpiderState): SpiderState {
  return {
    ...s,
    tableau: s.tableau.map(col => col.map(c => ({ ...c }))),
    stock: s.stock.map(g => g.map(c => ({ ...c }))),
  };
}

/**
 * Returns the run starting at fromIdx if movable, else null.
 * A run is movable if it forms a same-suit descending sequence.
 * A single top card is always movable.
 */
export function getMovableRun(col: Card[], fromIdx: number): Card[] | null {
  const run = col.slice(fromIdx);
  if (run.length === 0 || !run[0].faceUp) return null;
  if (run.length === 1) return run; // single card is always movable

  // Check for valid same-suit descending sequence
  for (let i = 0; i < run.length - 1; i++) {
    if (!run[i + 1].faceUp) return fromIdx === col.length - 1 ? [col[fromIdx]] : null;
    if (run[i].suit !== run[i + 1].suit || run[i].rank !== run[i + 1].rank + 1) {
      // Mixed sequence — only top card is movable
      return fromIdx === col.length - 1 ? [col[fromIdx]] : null;
    }
  }
  return run;
}

export function canPlaceSpider(destTop: Card | undefined, card: Card): boolean {
  if (!destTop) return true; // empty column accepts anything
  return card.rank === destTop.rank - 1;
}

function removeCompleted(s: SpiderState): SpiderState {
  let changed = true;
  while (changed) {
    changed = false;
    for (let col = 0; col < 10; col++) {
      const pile = s.tableau[col];
      if (pile.length < 13) continue;
      const tail = pile.slice(-13);
      if (
        tail[0].rank === 13 &&
        tail.every((c, i) =>
          i === 0 || (c.faceUp && c.suit === tail[0].suit && c.rank === tail[i - 1].rank - 1)
        )
      ) {
        s.completed++;
        s.tableau[col] = pile.slice(0, -13);
        if (s.tableau[col].length > 0) s.tableau[col][s.tableau[col].length - 1].faceUp = true;
        changed = true;
      }
    }
  }
  s.won = s.completed >= 8;
  return s;
}

export function trySpiderMove(
  state: SpiderState, fromCol: number, fromIdx: number, toCol: number
): SpiderState | null {
  if (fromCol === toCol) return null;
  const run = getMovableRun(state.tableau[fromCol], fromIdx);
  if (!run) return null;
  const destTop = state.tableau[toCol].at(-1);
  if (!canPlaceSpider(destTop, run[0])) return null;

  const s = cloneSpider(state);
  s.tableau[fromCol].splice(fromIdx, run.length);
  if (s.tableau[fromCol].length > 0) s.tableau[fromCol][s.tableau[fromCol].length - 1].faceUp = true;
  s.tableau[toCol].push(...run.map(c => ({ ...c })));
  s.moves++;
  return removeCompleted(s);
}

export function dealSpiderStock(state: SpiderState): SpiderState | null {
  if (state.stock.length === 0) return null;
  if (state.tableau.some(col => col.length === 0)) return null; // must fill empty columns first
  const s = cloneSpider(state);
  const group = s.stock.pop()!;
  for (let col = 0; col < 10; col++) {
    s.tableau[col].push({ ...group[col], faceUp: true });
  }
  s.moves++;
  return removeCompleted(s);
}

/* ---- Hint ---- */

function spiderRankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export interface SpiderHint {
  /** Column index of the run to move (-1 = suggest dealing) */
  fromCol: number;
  fromIdx: number;
  description: string;
}

export function findSpiderHint(state: SpiderState): SpiderHint | null {
  let fallback: SpiderHint | null = null;
  for (let fromCol = 0; fromCol < 10; fromCol++) {
    const pile = state.tableau[fromCol];
    for (let fromIdx = 0; fromIdx < pile.length; fromIdx++) {
      const run = getMovableRun(pile, fromIdx);
      if (!run) continue;
      for (let toCol = 0; toCol < 10; toCol++) {
        if (toCol === fromCol) continue;
        const destTop = state.tableau[toCol].at(-1);
        if (canPlaceSpider(destTop, run[0])) {
          const revealing = fromIdx > 0 && !pile[fromIdx - 1].faceUp;
          const hint: SpiderHint = {
            fromCol,
            fromIdx,
            description: revealing
              ? `Move ${spiderRankLabel(run[0].rank)} from column ${fromCol + 1} to ${toCol + 1} — reveals a card`
              : `Move ${spiderRankLabel(run[0].rank)} from column ${fromCol + 1} to column ${toCol + 1}`,
          };
          if (revealing) return hint;
          if (!fallback) fallback = hint;
        }
      }
    }
  }
  if (fallback) return fallback;
  if (state.stock.length > 0 && !state.tableau.some((col) => col.length === 0)) {
    return { fromCol: -1, fromIdx: -1, description: "Deal a new row from the stock pile" };
  }
  return null;
}
