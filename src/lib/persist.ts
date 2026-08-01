/**
 * Local-only game persistence using localStorage.
 * No data leaves the device — every user has their own isolated save slot.
 *
 * Schema is versioned so that breaking state changes can be handled gracefully:
 *  - Additive changes (new optional fields): add a migration in the `migrations`
 *    map below and bump SCHEMA_VERSION.
 *  - Truly breaking changes: bump SCHEMA_VERSION without a migration entry; the
 *    save will be discarded and the player will see a toast notification.
 *
 * Schema version history
 * ──────────────────────
 * v1 (initial): all six games — stock/waste/foundations/tableau/moves/score/
 *               startedAt/won (Klondike); SpiderState; FreeCellState;
 *               PyramidState; TriPeaksState; MahjongState.
 */

const PREFIX = "neon-solitaire:";

/**
 * Current schema version.  Bump this whenever the saved state shape changes.
 * If the change is additive (new optional field with a sensible default) add a
 * migration function below so existing saves survive the update.
 */
const SCHEMA_VERSION = 1;

interface SaveEnvelope<T> {
  v: number;
  savedAt: number;
  data: T;
}

// ---------------------------------------------------------------------------
// Migration map
// ---------------------------------------------------------------------------
// Add an entry here when bumping SCHEMA_VERSION for an additive change.
// migrations[N] converts a version-N payload to version N+1.
// If no entry exists for version N the save is considered unrecoverable and
// will be discarded (triggering a SAVE_RESET_EVENT notification to the user).
//
// Example (not yet needed — shown as a template):
//   migrations[1] = (data) => ({
//     ...(data as Record<string, unknown>),
//     newField: "defaultValue",
//   });
type MigrationFn = (data: unknown) => unknown;
const migrations: Record<number, MigrationFn> = {};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/** Custom event dispatched on save or clear so same-tab listeners can react. */
export const SAVE_CHANGED_EVENT = "neon-solitaire:save-changed";

/**
 * Custom event dispatched when a saved game is discarded because it cannot be
 * migrated to the current schema version (e.g. after a breaking update).
 * The root component listens for this and shows a toast to the player.
 */
export const SAVE_RESET_EVENT = "neon-solitaire:save-reset";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function dispatchSaveReset(key: string): void {
  try {
    window.dispatchEvent(new CustomEvent(SAVE_RESET_EVENT, { detail: { key } }));
  } catch {
    // SSR or other environments — ignore.
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Persist game state to localStorage. Silently no-ops on any error. */
export function saveGame<T>(key: string, state: T): void {
  try {
    const envelope: SaveEnvelope<T> = {
      v: SCHEMA_VERSION,
      savedAt: Date.now(),
      data: state,
    };
    localStorage.setItem(PREFIX + key, JSON.stringify(envelope));
    window.dispatchEvent(new CustomEvent(SAVE_CHANGED_EVENT, { detail: { key } }));
  } catch {
    // Private browsing, quota exceeded, or SSR — ignore.
  }
}

/**
 * Load previously saved game state.
 *
 * - Exact version match → returns data as-is.
 * - Older version + migration path exists → migrates forward and returns data.
 * - Older version + no migration path, or future version → discards save,
 *   dispatches SAVE_RESET_EVENT so the UI can notify the player, returns null.
 * - Missing / corrupt data → returns null silently.
 */
export function loadGame<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;

    const envelope = JSON.parse(raw) as SaveEnvelope<unknown>;

    // Happy path: exact match.
    if (envelope.v === SCHEMA_VERSION) {
      return (envelope.data ?? null) as T | null;
    }

    // Older save: attempt to migrate forward one version at a time.
    if (typeof envelope.v === "number" && envelope.v < SCHEMA_VERSION) {
      let data = envelope.data;
      for (let v = envelope.v; v < SCHEMA_VERSION; v++) {
        const migrate = migrations[v];
        if (!migrate) {
          // No migration path for this version gap — discard.
          dispatchSaveReset(key);
          return null;
        }
        data = migrate(data);
      }
      return (data ?? null) as T | null;
    }

    // Version is newer than the running code (downgrade) or unrecognised — discard.
    dispatchSaveReset(key);
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns true if a valid (or migratable) save exists for the given key.
 * Mirrors the migration logic of loadGame without touching localStorage.
 */
export function hasSave(key: string): boolean {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return false;
    const envelope = JSON.parse(raw) as { v: number };

    if (envelope.v === SCHEMA_VERSION) return true;

    // Check whether a full migration path exists for an older save.
    if (typeof envelope.v === "number" && envelope.v < SCHEMA_VERSION) {
      for (let v = envelope.v; v < SCHEMA_VERSION; v++) {
        if (!migrations[v]) return false;
      }
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/** Remove a saved game (e.g. after an explicit "New Game"). */
export function clearGame(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
    window.dispatchEvent(new CustomEvent(SAVE_CHANGED_EVENT, { detail: { key } }));
  } catch {
    // ignore
  }
}
