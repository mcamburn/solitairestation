import { type Card, SUITS, suitColor, rankLabel, suitGlyph } from "./solitaire";

export type { Card };

export interface CanfieldState {
  reserve: Card[];      // 13 cards, index 0=bottom, 12=top; only top is face-up
  tableau: Card[][];    // 4 columns, build down in alternating color (with wrap)
  foundations: Card[][]; // 4 piles, base rank determined by first card
  stock: Card[];        // remaining 34 cards (face-down), draw 3
  waste: Card[];        // turned up from stock
  baseRank: number;     // the rank that all foundations start at
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

export function newCanfieldGame(seed?: number): CanfieldState {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `cf-${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }

  const shuffled = shuffle(deck, seed ?? Date.now());
  let idx = 0;

  // 1. Deal 13 cards to reserve (index 0=bottom, 12=top)
  const reserve: Card[] = shuffled.slice(idx, idx + 13).map((c, i) => ({
    ...c,
    faceUp: i === 12, // only top card face-up
  }));
  idx += 13;

  // 2. Deal 1 card to foundation pile 0 — this determines baseRank
  const foundationCard = { ...shuffled[idx++], faceUp: true };
  const baseRank = foundationCard.rank;
  const foundations: Card[][] = [[foundationCard], [], [], []];

  // 3. Deal 1 card to each of 4 tableau columns
  const tableau: Card[][] = [];
  for (let i = 0; i < 4; i++) {
    tableau.push([{ ...shuffled[idx++], faceUp: true }]);
  }

  // 4. Remaining 34 cards = stock
  const stock: Card[] = shuffled.slice(idx).map((c) => ({ ...c, faceUp: false }));

  return {
    reserve,
    tableau,
    foundations,
    stock,
    waste: [],
    baseRank,
    moves: 0,
    won: false,
    startedAt: Date.now(),
  };
}

export function cloneCanfield(s: CanfieldState): CanfieldState {
  return {
    ...s,
    reserve: s.reserve.map((c) => ({ ...c })),
    tableau: s.tableau.map((col) => col.map((c) => ({ ...c }))),
    foundations: s.foundations.map((p) => p.map((c) => ({ ...c }))),
    stock: s.stock.map((c) => ({ ...c })),
    waste: s.waste.map((c) => ({ ...c })),
  };
}

/**
 * Foundation build order: cards go from baseRank, wrapping around.
 * buildOrder(rank, baseRank) = 0 means it's the base, 12 means it's the last.
 */
export function cfBuildOrder(rank: number, baseRank: number): number {
  return (rank - baseRank + 13) % 13;
}

/** Can a card be placed on a foundation pile? */
export function cfCanPlaceOnFoundation(
  card: Card,
  pile: Card[],
  baseRank: number
): boolean {
  if (pile.length === 0) {
    // Any ace of any suit can start an empty foundation at baseRank
    return card.rank === baseRank;
  }
  const top = pile[pile.length - 1];
  if (card.suit !== top.suit) return false;
  // Next card in wrapped sequence
  const nextRank = top.rank === 13 ? 1 : top.rank + 1;
  return card.rank === nextRank && cfBuildOrder(card.rank, baseRank) === cfBuildOrder(top.rank, baseRank) + 1;
}

/**
 * Tableau build: descending rank, alternating color, wrapping allowed.
 * A can go on 2 (rank 1 under rank 2), K can go on A (wrapping).
 * The build order for tableau: use (rank + 11) % 13 to get a 0-based "tableau rank"
 * where A=12, 2=0, 3=1, ..., K=11.
 * So a card can be placed on top if:
 *   - they alternate colors
 *   - card.rank is exactly one "below" in tableau rank sequence
 */
export function cfTableauRank(rank: number): number {
  // 2=0, 3=1, ..., K=11, A=12
  return (rank + 11) % 13;
}

export function cfCanPlaceOnTableau(moving: Card, target: Card | undefined): boolean {
  if (!target) return false; // empty column: handled separately
  return (
    suitColor(moving.suit) !== suitColor(target.suit) &&
    cfTableauRank(moving.rank) === cfTableauRank(target.rank) - 1
  );
}

/**
 * Returns true if `cards` form a valid Canfield tableau sequence:
 * descending in "tableau rank" order and alternating colors.
 */
export function cfIsValidSequence(cards: Card[]): boolean {
  for (let i = 0; i < cards.length - 1; i++) {
    if (suitColor(cards[i].suit) === suitColor(cards[i + 1].suit)) return false;
    if (cfTableauRank(cards[i].rank) !== cfTableauRank(cards[i + 1].rank) + 1) return false;
  }
  return true;
}

/* ---- Draw from stock ---- */

export function cfDrawFromStock(state: CanfieldState): CanfieldState {
  const s = cloneCanfield(state);
  if (s.stock.length === 0) {
    // Recycle: flip waste back to stock
    if (s.waste.length === 0) return s; // nothing to do
    s.stock = s.waste.slice().reverse().map((c) => ({ ...c, faceUp: false }));
    s.waste = [];
  } else {
    // Draw up to 3 cards
    const toDraw = Math.min(3, s.stock.length);
    for (let i = 0; i < toDraw; i++) {
      const c = s.stock.pop()!;
      c.faceUp = true;
      s.waste.push(c);
    }
  }
  s.moves++;
  return s;
}

/* ---- Move: waste/reserve top → foundation ---- */

export function cfMoveWasteToFoundation(state: CanfieldState): CanfieldState | null {
  const card = state.waste[state.waste.length - 1];
  if (!card) return null;
  for (let i = 0; i < 4; i++) {
    if (cfCanPlaceOnFoundation(card, state.foundations[i], state.baseRank)) {
      const s = cloneCanfield(state);
      s.waste.pop();
      s.foundations[i].push({ ...card });
      s.moves++;
      s.won = s.foundations.every((p) => p.length === 13);
      return s;
    }
  }
  return null;
}

export function cfMoveReserveToFoundation(state: CanfieldState): CanfieldState | null {
  if (state.reserve.length === 0) return null;
  const card = state.reserve[state.reserve.length - 1];
  for (let i = 0; i < 4; i++) {
    if (cfCanPlaceOnFoundation(card, state.foundations[i], state.baseRank)) {
      const s = cloneCanfield(state);
      s.reserve.pop();
      if (s.reserve.length > 0) s.reserve[s.reserve.length - 1].faceUp = true;
      s.foundations[i].push({ ...card });
      s.moves++;
      s.won = s.foundations.every((p) => p.length === 13);
      return s;
    }
  }
  return null;
}

/* ---- Move: waste → tableau ---- */

export function cfMoveWasteToTableau(
  state: CanfieldState,
  destCol: number
): CanfieldState | null {
  const card = state.waste[state.waste.length - 1];
  if (!card) return null;
  const dest = state.tableau[destCol];
  const target = dest[dest.length - 1];
  if (dest.length === 0) {
    // Empty columns: only reserve top can fill (not waste) — unless reserve is empty
    if (state.reserve.length > 0) return null;
    // If reserve is empty, any card can fill empty column
  } else {
    if (!cfCanPlaceOnTableau(card, target)) return null;
  }
  const s = cloneCanfield(state);
  s.waste.pop();
  s.tableau[destCol].push({ ...card, faceUp: true });
  s.moves++;
  s.won = s.foundations.every((p) => p.length === 13);
  return s;
}

/* ---- Move: reserve top → tableau ---- */

export function cfMoveReserveToTableau(
  state: CanfieldState,
  destCol: number
): CanfieldState | null {
  if (state.reserve.length === 0) return null;
  const card = state.reserve[state.reserve.length - 1];
  const dest = state.tableau[destCol];
  const target = dest[dest.length - 1];
  if (dest.length === 0) {
    // Empty column: reserve can always fill it
  } else {
    if (!cfCanPlaceOnTableau(card, target)) return null;
  }
  const s = cloneCanfield(state);
  s.reserve.pop();
  if (s.reserve.length > 0) s.reserve[s.reserve.length - 1].faceUp = true;
  s.tableau[destCol].push({ ...card, faceUp: true });
  s.moves++;
  s.won = s.foundations.every((p) => p.length === 13);
  return s;
}

/* ---- Move: tableau sequence → tableau ---- */

export function cfMoveTableauToTableau(
  state: CanfieldState,
  srcCol: number,
  fromIndex: number,
  destCol: number
): CanfieldState | null {
  if (srcCol === destCol) return null;
  const src = state.tableau[srcCol];
  const moving = src.slice(fromIndex);
  if (moving.length === 0) return null;
  if (!cfIsValidSequence(moving)) return null;

  const dest = state.tableau[destCol];
  if (dest.length === 0) {
    // Empty column: only reserve top can fill — unless reserve is empty
    if (state.reserve.length > 0) return null;
    // With empty reserve, any sequence bottom card can fill
  } else {
    const target = dest[dest.length - 1];
    if (!cfCanPlaceOnTableau(moving[0], target)) return null;
  }

  const s = cloneCanfield(state);
  s.tableau[srcCol].splice(fromIndex, moving.length);
  s.tableau[destCol].push(...moving.map((c) => ({ ...c, faceUp: true })));
  s.moves++;
  s.won = s.foundations.every((p) => p.length === 13);
  return s;
}

/* ---- Move tableau top card → foundation ---- */

export function cfMoveTableauToFoundation(
  state: CanfieldState,
  srcCol: number
): CanfieldState | null {
  const col = state.tableau[srcCol];
  const card = col[col.length - 1];
  if (!card) return null;
  for (let i = 0; i < 4; i++) {
    if (cfCanPlaceOnFoundation(card, state.foundations[i], state.baseRank)) {
      const s = cloneCanfield(state);
      s.tableau[srcCol].pop();
      s.foundations[i].push({ ...card });
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

export interface CanfieldHint {
  description: string;
  kind:
    | "waste-to-foundation"
    | "reserve-to-foundation"
    | "tableau-to-foundation"
    | "waste-to-tableau"
    | "reserve-to-tableau"
    | "tableau-to-tableau"
    | "draw";
  srcCol?: number;
  destCol?: number;
  fromIndex?: number;
}

export function findCanfieldHint(state: CanfieldState): CanfieldHint | null {
  // 1. Tableau → foundation
  for (let col = 0; col < 4; col++) {
    const card = state.tableau[col][state.tableau[col].length - 1];
    if (!card) continue;
    for (let i = 0; i < 4; i++) {
      if (cfCanPlaceOnFoundation(card, state.foundations[i], state.baseRank)) {
        return {
          kind: "tableau-to-foundation",
          srcCol: col,
          description: `Move ${describeCard(card)} from column ${col + 1} to foundation`,
        };
      }
    }
  }

  // 2. Waste → foundation
  const wasteTop = state.waste[state.waste.length - 1];
  if (wasteTop) {
    for (let i = 0; i < 4; i++) {
      if (cfCanPlaceOnFoundation(wasteTop, state.foundations[i], state.baseRank)) {
        return {
          kind: "waste-to-foundation",
          description: `Move ${describeCard(wasteTop)} from waste to foundation`,
        };
      }
    }
  }

  // 3. Reserve → foundation
  const reserveTop = state.reserve[state.reserve.length - 1];
  if (reserveTop) {
    for (let i = 0; i < 4; i++) {
      if (cfCanPlaceOnFoundation(reserveTop, state.foundations[i], state.baseRank)) {
        return {
          kind: "reserve-to-foundation",
          description: `Move ${describeCard(reserveTop)} from reserve to foundation`,
        };
      }
    }
  }

  // 4. Reserve → tableau
  if (reserveTop) {
    for (let col = 0; col < 4; col++) {
      const dest = state.tableau[col];
      if (dest.length === 0) {
        return {
          kind: "reserve-to-tableau",
          destCol: col,
          description: `Move ${describeCard(reserveTop)} from reserve to empty column ${col + 1}`,
        };
      }
      if (cfCanPlaceOnTableau(reserveTop, dest[dest.length - 1])) {
        return {
          kind: "reserve-to-tableau",
          destCol: col,
          description: `Move ${describeCard(reserveTop)} from reserve to column ${col + 1}`,
        };
      }
    }
  }

  // 5. Waste → tableau
  if (wasteTop) {
    for (let col = 0; col < 4; col++) {
      const dest = state.tableau[col];
      if (dest.length === 0) {
        if (state.reserve.length === 0) {
          return {
            kind: "waste-to-tableau",
            destCol: col,
            description: `Move ${describeCard(wasteTop)} from waste to empty column ${col + 1}`,
          };
        }
      } else if (cfCanPlaceOnTableau(wasteTop, dest[dest.length - 1])) {
        return {
          kind: "waste-to-tableau",
          destCol: col,
          description: `Move ${describeCard(wasteTop)} from waste to column ${col + 1}`,
        };
      }
    }
  }

  // 6. Tableau → tableau (sequences)
  for (let src = 0; src < 4; src++) {
    const col = state.tableau[src];
    for (let fi = 0; fi < col.length; fi++) {
      const moving = col.slice(fi);
      if (!cfIsValidSequence(moving)) continue;
      for (let dest = 0; dest < 4; dest++) {
        if (dest === src) continue;
        const destCol = state.tableau[dest];
        if (destCol.length === 0) {
          if (state.reserve.length === 0) {
            return {
              kind: "tableau-to-tableau",
              srcCol: src,
              destCol: dest,
              fromIndex: fi,
              description: `Move ${describeCard(moving[0])} to empty column ${dest + 1}`,
            };
          }
        } else if (cfCanPlaceOnTableau(moving[0], destCol[destCol.length - 1])) {
          return {
            kind: "tableau-to-tableau",
            srcCol: src,
            destCol: dest,
            fromIndex: fi,
            description: `Move ${describeCard(moving[0])} from column ${src + 1} to column ${dest + 1}`,
          };
        }
      }
    }
  }

  // 7. Draw from stock
  if (state.stock.length > 0 || state.waste.length > 0) {
    return {
      kind: "draw",
      description: state.stock.length > 0 ? "Draw cards from the stock" : "Recycle the waste pile",
    };
  }

  return null;
}
