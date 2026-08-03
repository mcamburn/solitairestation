// Central registry of all games — used by GameSwitcher and any other consumers.
// Kept in lib/ (not a component file) so HMR doesn't complain about non-component exports.

export const GAMES = [
  { to: "/klondike" as const,        title: "Klondike Solitaire",      subtitle: "Classic",       desc: "Draw 1 or 3 from the stock",          emoji: "🃏", saveKey: "klondike"     },
  { to: "/spider" as const,         title: "Spider Solitaire",        subtitle: "Strategy",      desc: "Build 8 same-suit sequences",          emoji: "🕷️", saveKey: "spider"       },
  { to: "/freecell" as const,       title: "FreeCell Solitaire",      subtitle: "Skill",         desc: "Almost every deal is solvable",        emoji: "🔲", saveKey: "freecell"     },
  { to: "/pyramid" as const,        title: "Pyramid Solitaire",       subtitle: "Casual",        desc: "Pair cards that add up to 13",         emoji: "🔺", saveKey: "pyramid"      },
  { to: "/tripeaks" as const,       title: "TriPeaks Solitaire",      subtitle: "Fast",          desc: "Clear three peaks in one chain",       emoji: "⛰️", saveKey: "tripeaks"     },
  { to: "/mahjong" as const,        title: "Mahjong",                 subtitle: "Classic",       desc: "Match identical free tiles",           emoji: "🀄", saveKey: "mahjong"      },
  { to: "/golf" as const,           title: "Golf Solitaire",          subtitle: "Quick play",    desc: "Chain cards ±1 to beat par",           emoji: "⛳", saveKey: "golf"         },
  { to: "/forty-thieves" as const,  title: "Forty Thieves Solitaire", subtitle: "Two decks",     desc: "Two decks, same-suit builds",          emoji: "🎴", saveKey: "fortythieves" },
  { to: "/yukon" as const,          title: "Yukon Solitaire",         subtitle: "All face-up",   desc: "All cards face-up from the start",     emoji: "🐻", saveKey: "yukon"        },
  { to: "/scorpion" as const,       title: "Scorpion Solitaire",      subtitle: "One suit",      desc: "Same-suit sequences, 7 columns",       emoji: "🦂", saveKey: "scorpion"     },
  { to: "/eight-off" as const,      title: "Eight Off Solitaire",     subtitle: "8 free cells",  desc: "Eight free cells, suit-only build",    emoji: "8️⃣", saveKey: "eightoff"   },
  { to: "/canfield" as const,       title: "Canfield Solitaire",      subtitle: "Hard & fast",   desc: "Draw 3, tough from the first card",    emoji: "🎰", saveKey: "canfield"   },
  { to: "/addiction" as const,      title: "Addiction Solitaire",     subtitle: "Shuffle gaps",  desc: "Slide cards left to sort by suit",     emoji: "🔄", saveKey: "addiction"  },
  { to: "/bakers-dozen" as const,   title: "Baker's Dozen Solitaire", subtitle: "Top card only", desc: "Only the top card of each pile moves", emoji: "🃏", saveKey: "bakersdozen"},
  { to: "/bakers-game" as const,    title: "Baker's Game Solitaire",  subtitle: "Suit build",    desc: "FreeCell but suit-only builds",        emoji: "🎮", saveKey: "bakersgame"  },
  { to: "/clock" as const,          title: "Clock Solitaire",         subtitle: "Pure luck",     desc: "Flip cards to fill the clock face",    emoji: "🕐", saveKey: "clock"       },
] as const;

export type GameTo = typeof GAMES[number]["to"];
