/**
 * Automated save/restore round-trip tests for all six games.
 *
 * Covers:
 *  - saveGame → loadGame fidelity for each game's realistic initial state
 *  - version-mismatch paths (newer-than-current and older-with-no-migration)
 *  - storage errors (quota exceeded, corrupt JSON, missing key)
 *  - hasSave and clearGame helpers
 *  - SAVE_CHANGED_EVENT and SAVE_RESET_EVENT dispatches
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveGame,
  loadGame,
  hasSave,
  clearGame,
  SAVE_CHANGED_EVENT,
  SAVE_RESET_EVENT,
} from "./persist";
import { newGame }           from "./solitaire";
import { newSpiderGame }     from "./spider";
import { newFreeCellGame }   from "./freecell";
import { newPyramidGame }    from "./pyramid";
import { newTriPeaksGame }   from "./tripeaks";
import { newMahjongGame }    from "./mahjong";
import type { GameState }        from "./solitaire";
import type { SpiderState }      from "./spider";
import type { FreeCellState }    from "./freecell";
import type { PyramidState }     from "./pyramid";
import type { TriPeaksState }    from "./tripeaks";
import type { MahjongState }     from "./mahjong";

const SEED = 42;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function captureEvents(eventName: string): { events: CustomEvent[]; cleanup: () => void } {
  const events: CustomEvent[] = [];
  const handler = (e: Event) => events.push(e as CustomEvent);
  window.addEventListener(eventName, handler);
  return { events, cleanup: () => window.removeEventListener(eventName, handler) };
}

// ---------------------------------------------------------------------------
// Round-trip tests for all six games
// ---------------------------------------------------------------------------

describe("persist – save/load round-trip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Klondike: restores a fresh game state identically", () => {
    const state = newGame(SEED);
    saveGame<GameState>("klondike", state);
    const loaded = loadGame<GameState>("klondike");
    expect(loaded).toEqual(state);
  });

  it("Spider: restores a fresh game state identically (1-suit)", () => {
    const state = newSpiderGame(1, SEED);
    saveGame<SpiderState>("spider", state);
    const loaded = loadGame<SpiderState>("spider");
    expect(loaded).toEqual(state);
  });

  it("Spider: restores a 4-suit game state identically", () => {
    const state = newSpiderGame(4, SEED);
    saveGame<SpiderState>("spider-4suit", state);
    const loaded = loadGame<SpiderState>("spider-4suit");
    expect(loaded).toEqual(state);
  });

  it("FreeCell: restores a fresh game state identically", () => {
    const state = newFreeCellGame(SEED);
    saveGame<FreeCellState>("freecell", state);
    const loaded = loadGame<FreeCellState>("freecell");
    expect(loaded).toEqual(state);
  });

  it("FreeCell: freeCells array contains nulls and survives round-trip", () => {
    const state = newFreeCellGame(SEED);
    // Verify freeCells are all null in a new game and survive JSON round-trip
    expect(state.freeCells).toEqual([null, null, null, null]);
    saveGame<FreeCellState>("freecell", state);
    const loaded = loadGame<FreeCellState>("freecell");
    expect(loaded?.freeCells).toEqual([null, null, null, null]);
  });

  it("Pyramid: restores a fresh game state identically", () => {
    const state = newPyramidGame(SEED);
    saveGame<PyramidState>("pyramid", state);
    const loaded = loadGame<PyramidState>("pyramid");
    expect(loaded).toEqual(state);
  });

  it("Pyramid: pyramid grid (nullable cells) survives round-trip", () => {
    const state = newPyramidGame(SEED);
    saveGame<PyramidState>("pyramid", state);
    const loaded = loadGame<PyramidState>("pyramid");
    // pyramid is an array of rows, each row is (Card | null)[]
    expect(loaded?.pyramid).toHaveLength(7);
    expect(loaded?.pyramid[0]).toHaveLength(1); // apex
    expect(loaded?.pyramid[6]).toHaveLength(7); // base
  });

  it("TriPeaks: restores a fresh game state identically", () => {
    const state = newTriPeaksGame(SEED);
    saveGame<TriPeaksState>("tripeaks", state);
    const loaded = loadGame<TriPeaksState>("tripeaks");
    expect(loaded).toEqual(state);
  });

  it("TriPeaks: cards array length (28 slots) survives round-trip", () => {
    const state = newTriPeaksGame(SEED);
    saveGame<TriPeaksState>("tripeaks", state);
    const loaded = loadGame<TriPeaksState>("tripeaks");
    expect(loaded?.cards).toHaveLength(28);
  });

  it("Mahjong: restores a fresh game state identically", () => {
    const state = newMahjongGame(SEED);
    saveGame<MahjongState>("mahjong", state);
    const loaded = loadGame<MahjongState>("mahjong");
    expect(loaded).toEqual(state);
  });

  it("Mahjong: 144 tiles and alive flags survive round-trip", () => {
    const state = newMahjongGame(SEED);
    saveGame<MahjongState>("mahjong", state);
    const loaded = loadGame<MahjongState>("mahjong");
    expect(loaded?.types).toHaveLength(144);
    expect(loaded?.alive).toHaveLength(144);
    expect(loaded?.alive.every((a) => a === true)).toBe(true);
  });

  it("saves to separate keys without cross-contamination", () => {
    const klondike = newGame(SEED);
    const mahjong  = newMahjongGame(SEED);
    saveGame("klondike", klondike);
    saveGame("mahjong",  mahjong);
    expect(loadGame("klondike")).toEqual(klondike);
    expect(loadGame("mahjong")).toEqual(mahjong);
  });
});

// ---------------------------------------------------------------------------
// Zero-move save regression
// ---------------------------------------------------------------------------
// Games must NOT show "In Progress" for a save that has moves === 0.
// The badge logic (hasSave) cannot distinguish a zero-move save from a
// real in-progress save — so each game's load effect must call clearGame
// when it finds a saved state with moves === 0, ensuring hasSave returns
// false on any subsequent badge refresh.

describe("persist – zero-move save regression", () => {
  const ALL_KEYS = ["klondike", "spider", "freecell", "pyramid", "tripeaks", "mahjong"] as const;

  beforeEach(() => {
    localStorage.clear();
  });

  it("hasSave returns true for a zero-move save (the raw persist layer is unaware of move count)", () => {
    // Simulate the old behavior: a fresh game state written with moves === 0
    saveGame("klondike", { ...newGame(SEED), moves: 0 });
    expect(hasSave("klondike")).toBe(true);
  });

  it("clearGame fired after load removes a stale zero-move save and hasSave returns false", () => {
    // Simulate: stale zero-move save is in storage from a previous session
    saveGame("klondike", { ...newGame(SEED), moves: 0 });
    expect(hasSave("klondike")).toBe(true);

    // Simulate what each game component now does on load when moves === 0
    clearGame("klondike");
    expect(hasSave("klondike")).toBe(false);
  });

  it("clearGame dispatches SAVE_CHANGED_EVENT when removing a stale zero-move save (badge update fires)", () => {
    saveGame("klondike", { ...newGame(SEED), moves: 0 });
    const { events, cleanup } = captureEvents(SAVE_CHANGED_EVENT);
    clearGame("klondike");
    cleanup();
    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ key: "klondike" });
  });

  it("a non-zero-move save is left intact after load (real in-progress games are restored)", () => {
    const inProgress = { ...newGame(SEED), moves: 3 };
    saveGame("klondike", inProgress);
    expect(hasSave("klondike")).toBe(true);
    // moves > 0 → do NOT call clearGame; save must still be present
    expect(loadGame("klondike")).toEqual(inProgress);
    expect(hasSave("klondike")).toBe(true);
  });

  it.each(ALL_KEYS)(
    "hasSave returns false for %s once its stale zero-move save is cleared on load",
    (key) => {
      // Write a zero-move save for every game (simulates the pre-fix behaviour).
      const freshStates: Record<string, unknown> = {
        klondike:  { ...newGame(SEED),        moves: 0 },
        spider:    { ...newSpiderGame(SEED),   moves: 0 },
        freecell:  { ...newFreeCellGame(SEED), moves: 0 },
        pyramid:   { ...newPyramidGame(SEED),  moves: 0 },
        tripeaks:  { ...newTriPeaksGame(SEED), moves: 0 },
        mahjong:   { ...newMahjongGame(SEED),  moves: 0 },
      };
      saveGame(key, freshStates[key]);
      expect(hasSave(key)).toBe(true);   // stale save exists before load

      clearGame(key);                     // what the fixed load effect does
      expect(hasSave(key)).toBe(false);  // badge must now show nothing
    },
  );
});

// ---------------------------------------------------------------------------
// Version-mismatch paths
// ---------------------------------------------------------------------------

describe("persist – version mismatch", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null and fires SAVE_RESET_EVENT when saved version is newer than current", () => {
    localStorage.setItem(
      "neon-solitaire:klondike",
      JSON.stringify({ v: 999, savedAt: Date.now(), data: {} }),
    );
    const { events, cleanup } = captureEvents(SAVE_RESET_EVENT);
    const result = loadGame("klondike");
    cleanup();
    expect(result).toBeNull();
    expect(events).toHaveLength(1);
    expect((events[0] as CustomEvent).detail).toEqual({ key: "klondike" });
  });

  it("returns null and fires SAVE_RESET_EVENT when version is older with no migration entry", () => {
    // SCHEMA_VERSION is 1; v:0 has no migrations[0] entry
    localStorage.setItem(
      "neon-solitaire:klondike",
      JSON.stringify({ v: 0, savedAt: Date.now(), data: { stock: [], waste: [] } }),
    );
    const { events, cleanup } = captureEvents(SAVE_RESET_EVENT);
    const result = loadGame("klondike");
    cleanup();
    expect(result).toBeNull();
    expect(events).toHaveLength(1);
  });

  it("hasSave returns false for an unmigrable old version", () => {
    localStorage.setItem(
      "neon-solitaire:klondike",
      JSON.stringify({ v: 0, savedAt: Date.now(), data: {} }),
    );
    expect(hasSave("klondike")).toBe(false);
  });

  it("hasSave returns false for a version newer than current", () => {
    localStorage.setItem(
      "neon-solitaire:klondike",
      JSON.stringify({ v: 999, savedAt: Date.now(), data: {} }),
    );
    expect(hasSave("klondike")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Storage error handling
// ---------------------------------------------------------------------------

describe("persist – storage errors are swallowed", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("saveGame silently no-ops when localStorage.setItem throws (quota exceeded)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() => saveGame("klondike", newGame(SEED))).not.toThrow();
  });

  it("loadGame returns null for corrupt JSON", () => {
    localStorage.setItem("neon-solitaire:corrupt", "}{not valid json");
    expect(loadGame("corrupt")).toBeNull();
  });

  it("loadGame returns null when key does not exist", () => {
    expect(loadGame("nonexistent-key")).toBeNull();
  });

  it("clearGame silently no-ops when localStorage.removeItem throws", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementationOnce(() => {
      throw new Error("storage error");
    });
    expect(() => clearGame("klondike")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// hasSave
// ---------------------------------------------------------------------------

describe("persist – hasSave", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns false when no save exists", () => {
    expect(hasSave("klondike")).toBe(false);
  });

  it("returns true immediately after saving", () => {
    saveGame("klondike", newGame(SEED));
    expect(hasSave("klondike")).toBe(true);
  });

  it("returns false after clearGame removes the save", () => {
    saveGame("klondike", newGame(SEED));
    clearGame("klondike");
    expect(hasSave("klondike")).toBe(false);
  });

  it("is independent per game key", () => {
    saveGame("klondike", newGame(SEED));
    expect(hasSave("klondike")).toBe(true);
    expect(hasSave("spider")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Event dispatching
// ---------------------------------------------------------------------------

describe("persist – events", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saveGame dispatches SAVE_CHANGED_EVENT with the correct key", () => {
    const { events, cleanup } = captureEvents(SAVE_CHANGED_EVENT);
    saveGame("klondike", newGame(SEED));
    cleanup();
    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ key: "klondike" });
  });

  it("clearGame dispatches SAVE_CHANGED_EVENT with the correct key", () => {
    saveGame("klondike", newGame(SEED));
    const { events, cleanup } = captureEvents(SAVE_CHANGED_EVENT);
    clearGame("klondike");
    cleanup();
    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({ key: "klondike" });
  });

  it("each game dispatches its own keyed SAVE_CHANGED_EVENT", () => {
    const { events, cleanup } = captureEvents(SAVE_CHANGED_EVENT);
    saveGame("klondike", newGame(SEED));
    saveGame("mahjong",  newMahjongGame(SEED));
    cleanup();
    expect(events).toHaveLength(2);
    expect(events.map((e) => e.detail.key)).toContain("klondike");
    expect(events.map((e) => e.detail.key)).toContain("mahjong");
  });
});
