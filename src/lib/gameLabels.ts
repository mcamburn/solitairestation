/**
 * Human-readable display names for each gameKey.
 * Used wherever a game key needs to be shown to the player (e.g. share text).
 */
export const GAME_LABELS: Record<string, string> = {
  klondike:     "Klondike",
  freecell:     "FreeCell",
  spider:       "Spider",
  mahjong:      "Mahjong",
  pyramid:      "Pyramid",
  tripeaks:     "TriPeaks",
  golf:         "Golf",
  clock:        "Clock",
  bakersdozen:  "Baker's Dozen",
  eightoff:     "Eight Off",
  canfield:     "Canfield",
  bakersgame:   "Baker's Game",
  yukon:        "Yukon",
  scorpion:     "Scorpion",
  addiction:    "Addiction",
  fortythieves: "Forty Thieves",
};

/**
 * Returns the display name for a gameKey, falling back gracefully.
 * e.g. getGameLabel("freecell") → "FreeCell"
 */
export function getGameLabel(gameKey: string): string {
  return GAME_LABELS[gameKey] ?? gameKey.charAt(0).toUpperCase() + gameKey.slice(1);
}
