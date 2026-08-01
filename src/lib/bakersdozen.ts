import { type Card, SUITS, rankLabel, suitGlyph } from "./solitaire";

export type { Card };

export interface BakersDozenState {
  tableau: Card[][];    // 13 columns of 4 cards each
  foundations: Card[][]; // 4 piles built up by suit from Ace
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

/** Move Kings to the bottom (index 0) of their columns. */
function moveKingsToBottom(tableau: Card[][]): Card[][] {
  return tableau.map((col) => {
    const kings = col.filter((c) => c.rank === 13);
    const rest = col.filter((c) => c.rank !== 13);
    // Kings at index 0, rest follows
    return [...kings, ...rest];
  });
}

/** Returns true if any column has 2+ Kings — considered a bad deal. */
function hasTwoKingsInColumn(tableau: Card[][]): boolean {
  return tableau.some((col) => col.filter((c) => c.rank === 13).length >= 2);
}

export function newBakersDozenGame(seed?: number): BakersDozenState {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `bd-${suit}-${rank}`, suit, rank, faceUp: true });
    }
  }

  let s = seed ?? Date.now();
  let shuffled: Card[];
  let tableau: Card[][];

  // Reshuffle until no column has 2+ Kings
  let attempts = 0;
  do {
    shuffled = shuffle(deck, s);
    // Deal 13 columns of 4 cards
    tableau = Array.from({ length: 13 }, (_, col) =>
      shuffled.slice(col * 4, col * 4 + 4).map((c) => ({ ...c, faceUp: true }))
    );
    tableau = moveKingsToBottom(tableau);
    s = (s * 9301 + 49297) % 233280;
    attempts++;
  } while (hasTwoKingsInColumn(tableau) && attempts < 1000);

  return {
    tableau,
    foundations: [[], [], [], []],
    moves: 0,
    won: false,
    startedAt: Date.now(),
  };
}

export function cloneBakersDozen(s: BakersDozenState): BakersDozenState {
  return {
    ...s,
    tableau: s.tableau.map((col) => col.map((c) => ({ ...c }))),
    foundations: s.foundations.map((p) => p.map((c) => ({ ...c }))),
  };
}

/** Top card of a column = last element */
function topCard(col: Card[]): Card | undefined {
  return col[col.length - 1];
}

/** Can card be placed on top of target in tableau?
 *  Rule: card.rank === target.rank - 1 (any suit, just rank sequence). */
export function bdCanPlaceOnTableau(card: Card, target: Card | undefined): boolean {
  if (!target) return false; // empty columns cannot receive cards
  return card.rank === target.rank - 1;
}

/** Can card be placed on a foundation pile? */
export function bdCanPlaceOnFoundation(card: Card, pile: Card[]): boolean {
  if (pile.length === 0) return card.rank === 1; // Ace first
  const top = pile[pile.length - 1];
  return card.suit === top.suit && card.rank === top.rank + 1;
}

/** Move top card from srcCol to destCol in tableau. */
export function bdMoveToTableau(
  state: BakersDozenState,
  srcCol: number,
  destCol: number
): BakersDozenState | null {
  if (srcCol === destCol) return null;
  const src = state.tableau[srcCol];
  const dest = state.tableau[destCol];
  const card = topCard(src);
  if (!card) return null;
  if (!bdCanPlaceOnTableau(card, topCard(dest))) return null;

  const s = cloneBakersDozen(state);
  const moved = s.tableau[srcCol].pop()!;
  s.tableau[destCol].push(moved);
  s.moves++;
  s.won = s.foundations.every((p) => p.length === 13);
  return s;
}

/** Move top card from srcCol to a foundation pile. */
export function bdMoveToFoundation(
  state: BakersDozenState,
  srcCol: number
): BakersDozenState | null {
  const src = state.tableau[srcCol];
  const card = topCard(src);
  if (!card) return null;

  for (let i = 0; i < 4; i++) {
    if (bdCanPlaceOnFoundation(card, state.foundations[i])) {
      const s = cloneBakersDozen(state);
      const moved = s.tableau[srcCol].pop()!;
      s.foundations[i].push(moved);
      s.moves++;
      s.won = s.foundations.every((p) => p.length === 13);
      return s;
    }
  }
  return null;
}

/* ---- Hint ---- */

function describeCard(c: Card): string {
  return `${rankLabel(c.rank)}${suitGlyph(c.suit)}`;
}

export interface BakersDozenHint {
  srcCol: number;
  destCol?: number;        // undefined means foundation
  description: string;
}

export function findBakersDozenHint(state: BakersDozenState): BakersDozenHint | null {
  // 1. Any top card to foundation
  for (let col = 0; col < 13; col++) {
    const card = topCard(state.tableau[col]);
    if (!card) continue;
    for (let i = 0; i < 4; i++) {
      if (bdCanPlaceOnFoundation(card, state.foundations[i])) {
        return {
          srcCol: col,
          description: `Move ${describeCard(card)} to foundation`,
        };
      }
    }
  }

  // 2. Any top card to another column
  for (let src = 0; src < 13; src++) {
    const card = topCard(state.tableau[src]);
    if (!card) continue;
    for (let dest = 0; dest < 13; dest++) {
      if (dest === src) continue;
      if (bdCanPlaceOnTableau(card, topCard(state.tableau[dest]))) {
        return {
          srcCol: src,
          destCol: dest,
          description: `Move ${describeCard(card)} to column ${dest + 1}`,
        };
      }
    }
  }

  return null;
}
