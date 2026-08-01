import { type Card, SUITS } from "./solitaire";

export type { Card };

export interface AddictionState {
  grid: (Card | null)[][];  // 4 rows × 13 columns
  shufflesLeft: number;
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

export function newAddictionGame(seed?: number): AddictionState {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `ad-${suit}-${rank}`, suit, rank, faceUp: true });
    }
  }
  const shuffled = shuffle(deck, seed ?? Date.now());

  // Lay out 4 rows of 13
  const grid: (Card | null)[][] = [];
  for (let row = 0; row < 4; row++) {
    grid.push(shuffled.slice(row * 13, row * 13 + 13).map(c => ({ ...c })));
  }

  // Remove Aces → create 4 gaps
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 13; col++) {
      if (grid[row][col]?.rank === 1) {
        grid[row][col] = null;
      }
    }
  }

  return {
    grid,
    shufflesLeft: 3,
    moves: 0,
    won: false,
    startedAt: Date.now(),
  };
}

export function cloneAddiction(s: AddictionState): AddictionState {
  return {
    ...s,
    grid: s.grid.map(row => row.map(c => (c ? { ...c } : null))),
  };
}

/**
 * A card is "locked" if it is correctly placed AND all cards to its left in
 * the same row are also locked. A card at col=0 is locked if it's a 2.
 * A card at col>0 is locked if the card to its left is same suit and rank-1.
 */
export function isLocked(grid: (Card | null)[][], row: number, col: number): boolean {
  const card = grid[row][col];
  if (!card) return false; // gaps are not locked
  if (col === 0) {
    return card.rank === 2; // 2 must be in position 0
  }
  const left = grid[row][col - 1];
  if (!left) return false;
  if (left.suit !== card.suit || left.rank !== card.rank - 1) return false;
  return isLocked(grid, row, col - 1);
}

/**
 * Can a card be moved to a gap at (row, col)?
 */
export function canMoveToGap(grid: (Card | null)[][], row: number, col: number, card: Card): boolean {
  if (grid[row][col] !== null) return false; // not a gap

  if (col === 0) {
    // Only a 2 can go in column 0
    return card.rank === 2;
  }

  const left = grid[row][col - 1];
  if (!left) return false; // gap to the right of another gap — not allowed (need same suit rank-1)
  if (left.rank === 13) return false; // gap right of King cannot receive any card

  return left.suit === card.suit && left.rank === card.rank - 1;
}

/**
 * Returns list of (row, col) positions that are gaps and can accept the given card.
 */
export function validGapsForCard(grid: (Card | null)[][], card: Card): [number, number][] {
  const gaps: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      if (grid[r][c] === null && canMoveToGap(grid, r, c, card)) {
        gaps.push([r, c]);
      }
    }
  }
  return gaps;
}

/** Move card from (fromRow, fromCol) to gap at (toRow, toCol). */
export function addictionMove(
  state: AddictionState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): AddictionState | null {
  const card = state.grid[fromRow][fromCol];
  if (!card) return null;
  if (!canMoveToGap(state.grid, toRow, toCol, card)) return null;
  if (isLocked(state.grid, fromRow, fromCol)) return null;

  const s = cloneAddiction(state);
  s.grid[toRow][toCol] = { ...card };
  s.grid[fromRow][fromCol] = null;
  s.moves++;
  s.won = checkAddictionWin(s.grid);
  return s;
}

function checkAddictionWin(grid: (Card | null)[][]): boolean {
  // Each row: positions 0-11 have cards 2-K of the same suit, position 12 is gap
  for (let row = 0; row < 4; row++) {
    if (grid[row][12] !== null) return false;
    const first = grid[row][0];
    if (!first || first.rank !== 2) return false;
    const suit = first.suit;
    for (let col = 0; col < 12; col++) {
      const c = grid[row][col];
      if (!c || c.suit !== suit || c.rank !== col + 2) return false;
    }
  }
  return true;
}

/**
 * Count how many valid moves exist in current state.
 */
export function countValidMoves(state: AddictionState): number {
  let count = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      const card = state.grid[r][c];
      if (!card || isLocked(state.grid, r, c)) continue;
      const gaps = validGapsForCard(state.grid, card);
      count += gaps.length;
    }
  }
  return count;
}

/**
 * Perform a shuffle: collect all non-locked cards (and gaps), re-deal randomly,
 * then remove Aces again.
 */
export function addictionShuffle(state: AddictionState, seed?: number): AddictionState | null {
  if (state.shufflesLeft <= 0) return null;

  const s = cloneAddiction(state);

  // Collect non-locked cards
  const freeCards: Card[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      if (s.grid[r][c] !== null && !isLocked(s.grid, r, c)) {
        freeCards.push(s.grid[r][c]!);
        s.grid[r][c] = null;
      }
    }
  }

  // Find free positions (nulls in grid after removing free cards)
  const freePositions: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      if (s.grid[r][c] === null) {
        freePositions.push([r, c]);
      }
    }
  }

  // Shuffle free cards
  const shuffled = shuffle(freeCards, seed ?? Date.now());

  // Place shuffled cards into free positions
  shuffled.forEach((card, i) => {
    const [r, c] = freePositions[i];
    s.grid[r][c] = { ...card };
  });

  // Remove Aces again to create gaps
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      if (s.grid[r][c]?.rank === 1) {
        s.grid[r][c] = null;
      }
    }
  }

  s.shufflesLeft--;
  return s;
}

export interface AddictionHint {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
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

export function findAddictionHint(state: AddictionState): AddictionHint | null {
  // Prefer moves that extend a sequence (i.e., card immediately right of another same-suit card)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      const card = state.grid[r][c];
      if (!card || isLocked(state.grid, r, c)) continue;
      // Find a gap where this card extends a run
      for (let tr = 0; tr < 4; tr++) {
        for (let tc = 1; tc < 13; tc++) {
          if (state.grid[tr][tc] !== null) continue;
          const left = state.grid[tr][tc - 1];
          if (left && left.suit === card.suit && left.rank === card.rank - 1) {
            return {
              fromRow: r, fromCol: c, toRow: tr, toCol: tc,
              description: `Move ${rankLabel(card.rank)}${suitGlyph(card.suit)} right of ${rankLabel(left.rank)}${suitGlyph(left.suit)}`,
            };
          }
        }
      }
    }
  }

  // Any valid move
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 13; c++) {
      const card = state.grid[r][c];
      if (!card || isLocked(state.grid, r, c)) continue;
      const gaps = validGapsForCard(state.grid, card);
      if (gaps.length > 0) {
        const [tr, tc] = gaps[0];
        return {
          fromRow: r, fromCol: c, toRow: tr, toCol: tc,
          description: `Move ${rankLabel(card.rank)}${suitGlyph(card.suit)} to row ${tr + 1}, column ${tc + 1}`,
        };
      }
    }
  }

  return null;
}
