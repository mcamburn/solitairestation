// Central registry of all games — used by GameSwitcher and any other consumers.
// Kept in lib/ (not a component file) so HMR doesn't complain about non-component exports.

export const GAMES = [
  { to: "/" as const,         title: "Klondike",  subtitle: "Classic",  emoji: "🃏", saveKey: "klondike"  },
  { to: "/spider" as const,   title: "Spider",    subtitle: "Strategy", emoji: "🕷️", saveKey: "spider"    },
  { to: "/freecell" as const, title: "FreeCell",  subtitle: "Skill",    emoji: "🔲", saveKey: "freecell"  },
  { to: "/pyramid" as const,  title: "Pyramid",   subtitle: "Casual",   emoji: "🔺", saveKey: "pyramid"   },
  { to: "/tripeaks" as const, title: "TriPeaks",  subtitle: "Fast",     emoji: "⛰️", saveKey: "tripeaks"  },
  { to: "/mahjong" as const,  title: "Mahjong",   subtitle: "Classic",  emoji: "🀄", saveKey: "mahjong"   },
] as const;

export type GameTo = typeof GAMES[number]["to"];
