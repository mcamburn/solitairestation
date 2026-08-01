// Central registry of all games — used by GameSwitcher and any other consumers.
// Kept in lib/ (not a component file) so HMR doesn't complain about non-component exports.

export const GAMES = [
  { to: "/" as const,               title: "Klondike",      subtitle: "Classic",    emoji: "🃏", saveKey: "klondike"     },
  { to: "/spider" as const,         title: "Spider",        subtitle: "Strategy",   emoji: "🕷️", saveKey: "spider"       },
  { to: "/freecell" as const,       title: "FreeCell",      subtitle: "Skill",      emoji: "🔲", saveKey: "freecell"     },
  { to: "/pyramid" as const,        title: "Pyramid",       subtitle: "Casual",     emoji: "🔺", saveKey: "pyramid"      },
  { to: "/tripeaks" as const,       title: "TriPeaks",      subtitle: "Fast",       emoji: "⛰️", saveKey: "tripeaks"     },
  { to: "/mahjong" as const,        title: "Mahjong",       subtitle: "Classic",    emoji: "🀄", saveKey: "mahjong"      },
  { to: "/golf" as const,           title: "Golf",          subtitle: "Quick play", emoji: "⛳", saveKey: "golf"         },
  { to: "/forty-thieves" as const,  title: "Forty Thieves", subtitle: "Two decks",  emoji: "🎴", saveKey: "fortythieves" },
  { to: "/yukon" as const,          title: "Yukon",         subtitle: "All face-up",emoji: "🐻", saveKey: "yukon"        },
  { to: "/scorpion" as const,       title: "Scorpion",      subtitle: "One suit",   emoji: "🦂", saveKey: "scorpion"     },
  { to: "/eight-off" as const,      title: "Eight Off",     subtitle: "8 free cells",emoji: "8️⃣", saveKey: "eightoff"   },
  { to: "/canfield" as const,       title: "Canfield",      subtitle: "Hard & fast", emoji: "🎰", saveKey: "canfield"   },
  { to: "/addiction" as const,      title: "Addiction",     subtitle: "Shuffle gaps",emoji: "🔄", saveKey: "addiction"  },
  { to: "/bakers-dozen" as const,   title: "Baker's Dozen", subtitle: "Top card only",emoji: "🃏", saveKey: "bakersdozen"},
  { to: "/bakers-game" as const,    title: "Baker's Game",  subtitle: "Suit build", emoji: "🎮", saveKey: "bakersgame"  },
  { to: "/clock" as const,          title: "Clock",         subtitle: "Pure luck",  emoji: "🕐", saveKey: "clock"       },
] as const;

export type GameTo = typeof GAMES[number]["to"];
