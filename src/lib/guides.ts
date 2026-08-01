export type GameTag =
  | "klondike"
  | "spider"
  | "freecell"
  | "pyramid"
  | "tripeaks"
  | "mahjong"
  | "golf"
  | "fortythieves"
  | "yukon"
  | "scorpion"
  | "eightoff"
  | "canfield"
  | "addiction"
  | "bakersdozen"
  | "bakersgame"
  | "clock"
  | "general";

export interface GuideSection {
  heading: string;
  body: string[];
}

export interface Guide {
  slug: string;
  game: GameTag;
  title: string;
  description: string;
  intro: string;
  sections: GuideSection[];
}

export const GUIDES: Guide[] = [
  // ─── Klondike ──────────────────────────────────────────────────────────────

  {
    slug: "klondike-solitaire-rules-and-win-rate",
    game: "klondike",
    title: "Klondike Solitaire Rules & Win Rate",
    description:
      "Learn the official rules of Klondike Solitaire, understand the real odds of winning Draw 1 vs Draw 3, and discover why this classic card game remains the world's most-played solitaire variant.",
    intro:
      "Klondike is the game most people picture when they hear the word \u201csolitaire.\u201d It has been the default card game on Windows since 1990, and estimates suggest billions of games are played each year worldwide. Yet despite its familiarity, many players don\u2019t know the actual rules in full \u2014 or how unlikely a typical win really is.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "A standard 52-card deck is shuffled and dealt into seven tableau columns. Column 1 gets one card, column 2 gets two cards, and so on up to seven. Only the top card of each column is dealt face-up; the rest are face-down. The remaining 24 cards form the stock pile in the top-left.",
          "Four empty foundation piles sit in the top-right, one for each suit. The goal is to move all 52 cards onto the foundations, building each suit from Ace up through King.",
        ],
      },
      {
        heading: "Core Rules",
        body: [
          "Cards on the tableau are built in descending rank and alternating color — a red 7 can only go on a black 8. Only face-up cards can be moved. A face-down card is revealed automatically when the face-up card on top of it is removed. Empty tableau columns may only be filled with a King (or a sequence starting with a King).",
          "Clicking the stock turns over cards to the waste pile. In Draw 1, one card is turned at a time. In Draw 3, three cards are turned but only the top one is playable. When the stock is exhausted it can be reset by clicking it again — unlimited resets in Draw 1, but each reset counts against you in Vegas scoring.",
          "Cards move to the foundation automatically (or on double-click) once their suit's Ace is placed and they are the next rank in sequence. You win when all four foundations each hold 13 cards (Ace through King).",
        ],
      },
      {
        heading: "Win Rate: What the Numbers Say",
        body: [
          "Klondike is infamously hard to analyze because it involves hidden information — face-down cards you haven't seen yet. With perfect play and full knowledge of the deck, roughly 82% of Draw 1 deals are theoretically winnable. In practice, human players with no knowledge of face-down cards win around 43% of Draw 1 games.",
          "Draw 3 is considerably harder. Theoretical winnability sits near 79%, but realistic win rates for human players hover around 11–15%. The three-card cycling means cards can become unreachable for many cycles, and the limited resets in Vegas mode add a hard constraint that drops the rate further.",
          "These numbers explain why Klondike feels satisfying but never trivial — there will always be unwinnable deals, and not every loss is your fault.",
        ],
      },
      {
        heading: "Scoring",
        body: [
          "Standard scoring awards 10 points per card moved to the foundation and 5 points per tableau-to-tableau move that turns over a face-down card. Time bonuses apply in timed mode. Vegas scoring is more stark: you start with a −$52 wager and earn $5 for each card placed on the foundation. A perfect game returns $208 net.",
        ],
      },
    ],
  },

  {
    slug: "solitaire-turn-1-vs-turn-3-strategy",
    game: "klondike",
    title: "Solitaire Turn 1 vs Turn 3 Strategy",
    description:
      "A complete breakdown of Draw 1 versus Draw 3 Klondike Solitaire — how the mechanics differ, which is harder, and the key strategy adjustments that improve your win rate in both modes.",
    intro:
      "Draw 1 and Draw 3 look like the same game at first glance, but they play very differently. Understanding why — and adjusting your strategy for each — is the fastest way to improve your win rate.",
    sections: [
      {
        heading: "How Draw 1 and Draw 3 Differ",
        body: [
          "In Draw 1, every card in the stock is immediately accessible — you flip one, play it or skip it, and flip the next. After cycling through the stock once, every card you passed becomes reachable on the next pass. This gives you maximum information and flexibility.",
          "In Draw 3, three cards are flipped at once but only the top card is playable. The card underneath is hidden behind two others. If you can't play the top card, you advance the stock and those three cards cycle away. Because the stock cycles in groups of three, a card at a certain position in the deck may only surface once every three passes through the stock — or sometimes never if the deck size and cycle don't align. This 'stranded card' problem is what makes Draw 3 so much harder.",
        ],
      },
      {
        heading: "Draw 1 Strategy",
        body: [
          "Prioritize uncovering face-down cards over any other move. Every face-down card is hidden information — revealing it gives you more options. If you have a choice between moving a card to a foundation versus using it to uncover a face-down card, usually choose the face-down card first (unless the foundation move enables several follow-on moves).",
          "Hold off on moving Kings to empty columns until you have a plan for them. An empty column is an extremely valuable resource; filling it with a King that doesn't unblock anything wastes that resource. In Draw 1, where you can always access your stock, patience pays.",
          "Avoid moving low-value cards (Aces, 2s, 3s) to the foundation prematurely if they are serving as playable moves on the tableau. Keeping them in play gives you more options for cycling tableau cards.",
        ],
      },
      {
        heading: "Draw 3 Strategy",
        body: [
          "Card position tracking is the single most important skill in Draw 3. After your first pass through the stock, mentally note which cards are stranded. Count the stock size modulo 3 — if you have 15 cards left, every position will surface. If you have 14, one card per cycle will never appear at the top.",
          "When you can play a card from the waste pile, consider whether playing it will improve the cycling order for subsequent passes. Sometimes it's better not to play a waste card so that the cards behind it shift into a more useful position.",
          "Empty columns are even more valuable in Draw 3 than in Draw 1. Use them as temporary parking spaces to free up cycling order. Moving a King to an empty column specifically to unblock the card beneath it is almost always the right call.",
          "Accept a lower win rate. Even with perfect play, many Draw 3 deals are unwinnable. If you've cycled through the stock three times and made no progress, the deal may be over — move on without frustration.",
        ],
      },
      {
        heading: "Which Should You Play?",
        body: [
          "Draw 1 is the right choice if you want to win more often, learn the fundamentals, or play a relaxed game. It rewards patience and careful tableau management. Draw 3 is better if you want a stiffer challenge and enjoy the puzzle of cycling optimization. Vegas mode — which tracks draws and limits stock resets — adds a meaningful economic constraint to Draw 3 and turns it into one of the most strategically demanding single-player card games.",
        ],
      },
    ],
  },

  {
    slug: "how-to-win-klondike-solitaire",
    game: "klondike",
    title: "How to Win at Klondike Solitaire: Top 7 Strategies",
    description:
      "Seven proven Klondike Solitaire strategies to raise your win rate — from managing empty columns to the right order for moving cards to foundations, explained clearly for all skill levels.",
    intro:
      "Winning at Klondike Solitaire more consistently comes down to a small set of prioritization rules. Most players learn these intuitively over hundreds of games; here they are laid out explicitly.",
    sections: [
      {
        heading: "1. Expose Face-Down Cards First",
        body: [
          "Every strategic decision should be weighted toward uncovering face-down cards. Each hidden card is a constraint on your options. Uncovering it expands the game. When evaluating any move, ask: does this flip a face-down card? If yes, it's almost always the better move — even ahead of playing to the foundation.",
        ],
      },
      {
        heading: "2. Don't Rush the Foundations",
        body: [
          "Moving a card to the foundation feels like progress, but it removes that card from the tableau permanently. A 5 sitting on the foundation can't be used to receive a red 4 later. In the early game, keep low cards (Aces through 4s) on the foundation once placed — they rarely need to come back. But mid-range cards (5s through 9s) sometimes need to stay in play to keep sequences alive.",
        ],
      },
      {
        heading: "3. Protect Empty Columns",
        body: [
          "An empty column is the most powerful resource in Klondike. It lets you temporarily park a card, break apart a sequence you can't otherwise split, or place a King and build a whole new sequence. Never fill an empty column without a concrete plan — 'I'll put a King here just in case' is usually wrong.",
        ],
      },
      {
        heading: "4. Keep Color Balance in Mind",
        body: [
          "Tableau sequences alternate colors. If all your red 7s are buried and you have several black 6s to place, you have a bottleneck. Notice when both cards of a given rank-color combination are blocked — it may mean a different tableau branch needs clearing first.",
        ],
      },
      {
        heading: "5. Prefer the Column with More Hidden Cards",
        body: [
          "When two tableau moves are equally valid, choose the one that sits atop a longer column of face-down cards. Clearing that column faster gives you more options sooner.",
        ],
      },
      {
        heading: "6. Cycle the Stock Thoughtfully",
        body: [
          "Don't click through the stock mindlessly. After each pass, identify the cards in the stock that are blocking progress. Sometimes it's better to make a suboptimal tableau move specifically to change the order of playable moves in the next stock cycle.",
        ],
      },
      {
        heading: "7. Know When to Restart",
        body: [
          "Some deals are unwinnable even with perfect play. If you've cycled the stock three or more times, played every available move, and made no progress, consider restarting. Recognizing a dead position early — rather than grinding through 10 more unproductive stock cycles — makes you a better player.",
        ],
      },
    ],
  },

  // ─── Spider ────────────────────────────────────────────────────────────────

  {
    slug: "spider-solitaire-rules-and-strategy",
    game: "spider",
    title: "Spider Solitaire Rules & Strategy Guide",
    description:
      "Full rules of Spider Solitaire — setup, legal moves, dealing, and winning — plus essential strategy tips for 1-suit, 2-suit, and 4-suit modes.",
    intro:
      "Spider Solitaire is named for the eight foundation piles it requires to win — eight legs of a spider. Played with two 52-card decks across ten columns, it's more complex than Klondike and rewards longer-term planning.",
    sections: [
      {
        heading: "Setup",
        body: [
          "Spider uses two standard 52-card decks (104 cards total). The number of suits depends on difficulty: 1-suit uses only spades (all 104 cards are spades of varying ranks), 2-suit uses spades and hearts, and 4-suit uses all four suits. The tableau consists of ten columns. Columns 1–4 receive six cards each; columns 5–10 receive five cards each. Only the top card of each column starts face-up. The remaining 50 cards form the stock.",
        ],
      },
      {
        heading: "How to Play",
        body: [
          "Cards in the tableau are built in descending order regardless of suit — a 7 of any suit may go on an 8 of any suit. However, only sequences built entirely in the same suit may be moved together as a group. Mixed-suit sequences can be created but must be moved one card at a time. A completed sequence from King down to Ace in a single suit is removed from the tableau and placed in one of the eight completion zones.",
          "When no more moves are available (or you choose to deal), clicking the stock deals one card face-up to every non-empty tableau column. If any column is empty, you must fill it before dealing. The stock can be dealt five times, adding 50 cards across those five deals.",
        ],
      },
      {
        heading: "Winning",
        body: [
          "The game is won when all eight King-to-Ace sequences have been completed and removed. This requires clearing all 104 cards from the tableau.",
        ],
      },
      {
        heading: "Core Strategy",
        body: [
          "Build in-suit whenever possible. Mixed-suit sequences feel like progress but they lock cards in place — you can't move a sequence of alternating suits as a unit, which will eventually strand critical cards.",
          "Empty columns are even more important in Spider than in Klondike. An empty column can hold any single card as a temporary park, enabling sequence reorganization. Never fill an empty column without a very good reason.",
          "Watch out for 'color locks' — situations where you have, say, all four 7s buried under cards you can't move. Identifying these bottlenecks early (before dealing from the stock) is the key skill that separates intermediate from advanced Spider players.",
          "Delay dealing from the stock as long as possible. Each new row of cards adds complexity and can bury progress you've already made. Only deal when you're truly stuck, and ideally when all columns are relatively short.",
        ],
      },
    ],
  },

  {
    slug: "spider-solitaire-1-suit-vs-4-suit",
    game: "spider",
    title: "Spider Solitaire: 1-Suit vs 2-Suit vs 4-Suit Difficulty",
    description:
      "How do the three Spider Solitaire difficulty modes compare? This guide explains the win rates, strategic differences, and how to progress from 1-suit all the way to the 4-suit expert mode.",
    intro:
      "Spider Solitaire's difficulty selection isn't just a label — the underlying mechanics change fundamentally between modes. Here's what to expect from each, and how to know when you're ready to move up.",
    sections: [
      {
        heading: "1-Suit Spider",
        body: [
          "In 1-suit Spider, all 104 cards are of the same suit (typically spades). Since suit doesn't vary, every descending sequence is automatically a valid same-suit sequence and can be moved as a group. This removes the mixed-suit movement restriction entirely.",
          "The result is a considerably more accessible game. Win rates for an attentive player reach 90% or higher. The main challenge becomes managing empty columns and avoiding situations where certain ranks are buried under multiple inaccessible cards. This is the best mode for learning Spider's core sequencing logic before introducing suit complexity.",
        ],
      },
      {
        heading: "2-Suit Spider",
        body: [
          "Adding a second suit (spades and hearts, or any two suits) introduces the core complication of Spider: mixed-suit sequences. Now a sequence of alternating suits cannot be moved as a unit, even if it's descending in rank. You must move it card by card, and that requires either an empty column or enough exposed destinations to temporarily hold each card.",
          "Win rates for a skilled 2-suit player are around 40–50%. A lot of deals come down to whether the initial layout puts certain key cards in accessible positions. This mode is where 'planning three moves ahead' becomes necessary rather than optional.",
        ],
      },
      {
        heading: "4-Suit Spider",
        body: [
          "Four-suit Spider is widely considered one of the hardest solitaire variants in existence. You now need to build eight complete same-suit sequences (two per suit) while managing 104 cards across ten columns. Mixed-suit sequences are extremely common and the movement restrictions make reorganization brutally difficult.",
          "Expert win rates are around 5–10% for human players, and even with computer assistance (playing optimally from a known deck), around 50% of deals are unwinnable. Empty columns are so valuable that experienced players will sometimes sacrifice multiple productive moves to create a single empty column.",
          "4-suit Spider is a game where accepting loss gracefully is part of the skill. Many deals cannot be recovered after the first or second stock deal, and learning to recognize that early saves significant time.",
        ],
      },
      {
        heading: "When to Move Up",
        body: [
          "Move from 1-suit to 2-suit when you're consistently clearing 1-suit boards without dealing from the stock more than twice. Move from 2-suit to 4-suit when you can win 2-suit games regularly and comfortably plan sequence reorganizations three to four moves ahead. Don't rush the progression — 2-suit Spider already offers a rich, challenging game that many experienced players prefer over 4-suit.",
        ],
      },
    ],
  },

  // ─── FreeCell ──────────────────────────────────────────────────────────────

  {
    slug: "freecell-solitaire-rules-and-strategy",
    game: "freecell",
    title: "FreeCell Solitaire Rules & Strategy Guide",
    description:
      "Learn how FreeCell Solitaire works — the rules, how free cells function, valid moves, and the key strategies that let skilled players win nearly every hand.",
    intro:
      "FreeCell is unlike most solitaire games because it deals every card face-up at the start. There are no hidden cards and (for almost every deal) no luck — only decision-making. That makes it one of the purest skill tests in card gaming.",
    sections: [
      {
        heading: "Setup",
        body: [
          "A standard 52-card deck is dealt face-up across eight tableau columns. Columns 1–4 receive seven cards; columns 5–8 receive six cards. Four free cells sit in the top-left — each can hold exactly one card at a time. Four foundation piles sit in the top-right, one per suit.",
        ],
      },
      {
        heading: "Legal Moves",
        body: [
          "Tableau builds are descending in rank and alternating in color — a red 6 may go on a black 7. Free cells can hold any single card temporarily; cards in free cells may move back to the tableau or directly to the foundation. Foundation piles build from Ace up through King in a single suit.",
          "You can move a sequence of alternating-color, descending cards as if it were one card — but only if you have enough free space to physically move them one at a time. The maximum number of cards movable as a group equals (free cells + 1) × 2^(empty tableau columns). With all four free cells open and no empty columns, you can move five cards as a group; with two free cells and one empty column, you can move six.",
        ],
      },
      {
        heading: "The Four Strategic Pillars",
        body: [
          "1. Preserve free cells. The temptation is to park cards in free cells immediately, but every card in a free cell reduces your maximum move size. Use free cells deliberately, not reflexively.",
          "2. Build low foundation cards early. Unlike Klondike, FreeCell rarely requires keeping low cards in play. Move Aces and 2s to the foundation as soon as they're accessible — they'll never be needed back.",
          "3. Plan for empty columns. An empty tableau column is worth more than any sequence move. It doubles your maximum group move size, and it's the main escape valve for locked positions.",
          "4. Look ten moves ahead. Because all cards are visible, you can (and should) fully plan your approach before making any move. Undo is available, but the best FreeCell players rarely need it because they plan rather than experiment.",
        ],
      },
      {
        heading: "The Two Unsolvable Deals",
        body: [
          "Out of 32,000 commonly studied FreeCell deals, only two are provably unsolvable: deal #11982 and deal #146692 (using the Microsoft numbering system). Every other deal can be won with optimal play. If you feel stuck, the deal almost certainly has a solution — you just haven't found it yet.",
        ],
      },
    ],
  },

  {
    slug: "freecell-why-almost-every-deal-is-solvable",
    game: "freecell",
    title: "Why Almost Every FreeCell Deal Is Solvable",
    description:
      "FreeCell's remarkable near-100% solvability rate is no accident — it comes from the structure of the game itself. Here's the math and logic behind why skill almost always wins.",
    intro:
      "If you've played FreeCell even a handful of times, you've heard the claim: 'almost every deal is winnable.' This turns out to be true — and understanding why makes you a better player.",
    sections: [
      {
        heading: "Full Information Changes Everything",
        body: [
          "Most solitaire games involve hidden cards. In Klondike, face-down tableau cards are unknowns. In Spider, the initial face-down rows are mysteries. Hidden information introduces genuine luck — sometimes a card you need is simply inaccessible regardless of what you do.",
          "FreeCell deals all 52 cards face-up. Every card is visible from the first moment. This means no move ever depends on unknown information. Whether a deal is winnable depends entirely on the initial arrangement of cards — not on subsequent hidden reveals — and that arrangement can be analyzed in full from the start.",
        ],
      },
      {
        heading: "The Role of Free Cells",
        body: [
          "Free cells act as a universal buffer. Any card can go there, any time. This prevents the permanent lock-out situations common in other games where a needed card is buried under an immovable stack. In Klondike, a card buried under five face-down cards might require you to clear an entire column to reach it. In FreeCell, you can always move the cards on top to free cells or other tableau positions — the only question is whether you have enough space.",
          "The four free cells, combined with potentially empty tableau columns, give skilled players a remarkably large working space. Even a dense board with no obvious moves usually has a sequence of temporary relocations that breaks it open.",
        ],
      },
      {
        heading: "Why the Rare Deal Is Unsolvable",
        body: [
          "The two known unsolvable deals (#11982 and #146692 in the Microsoft numbering) are unsolvable because they create circular dependencies: the card needed to free pile A is trapped under pile B, which requires a card from pile C, which is blocked by pile A. No amount of free cell usage breaks the cycle because there simply isn't enough buffer space to hold all the cards needed for the maneuver simultaneously.",
          "These cases are extremely rare (roughly 1-in-16,000 deals) precisely because the free cell buffer is so powerful that circular dependencies almost never survive scrutiny.",
        ],
      },
      {
        heading: "Practical Implication",
        body: [
          "The near-100% solvability rate means that when you can't find a winning path in FreeCell, the deal almost certainly isn't the problem — your approach is. This reframe is useful: instead of 'I can't win this,' think 'I haven't found the path yet.' The hint system and undo button are legitimate tools for exploration, not signs of weakness.",
        ],
      },
    ],
  },

  // ─── Pyramid ───────────────────────────────────────────────────────────────

  {
    slug: "pyramid-solitaire-rules-and-pairing-guide",
    game: "pyramid",
    title: "Pyramid Solitaire Rules & Pairing Guide",
    description:
      "Complete rules for Pyramid Solitaire — how the pyramid is built, which cards pair together to make 13, how the stock and waste work, and what 'fully exposed' means.",
    intro:
      "Pyramid Solitaire challenges you to clear a 28-card pyramid by pairing cards that add up to 13. The math is simple but the strategy is surprisingly deep.",
    sections: [
      {
        heading: "Setup",
        body: [
          "28 cards are dealt face-up in a triangular pyramid: row 1 has one card at the top, row 2 has two, and so on through row 7 at the bottom with seven cards. A card is 'free' (eligible to be paired) only when both cards that overlap it from the row below have been removed. The remaining 24 cards form the stock.",
        ],
      },
      {
        heading: "The Pairs That Make 13",
        body: [
          "Ace = 1, 2 through 10 at face value, Jack = 11, Queen = 12, King = 13.",
          "Valid pairs: A+Q, 2+J, 3+10, 4+9, 5+8, 6+7. Kings are removed alone — they don't need a partner.",
          "You can pair two pyramid cards with each other (if both are free), a pyramid card with the top waste card, or the top waste card is auto-removed if it's a King. Two stock or waste cards cannot pair directly with each other — one card from the pair must always be in the pyramid (or be the current waste top).",
        ],
      },
      {
        heading: "Stock & Waste",
        body: [
          "Click the stock to flip one card to the waste pile. The top waste card is always available for pairing. When the stock is empty, you may optionally recycle the waste pile back into the stock — the number of allowed recycles varies by rule set (typically one or two recycles total).",
        ],
      },
      {
        heading: "Winning & Losing",
        body: [
          "You win by removing all 28 pyramid cards. The 24 stock/waste cards don't need to be cleared — only the pyramid. You lose when no more pairs can be formed and no recycles remain. Some deals are unwinnable regardless of play order; Pyramid has a lower theoretical win rate than Klondike.",
        ],
      },
    ],
  },

  {
    slug: "how-to-beat-pyramid-solitaire",
    game: "pyramid",
    title: "How to Beat Pyramid Solitaire More Often",
    description:
      "Practical Pyramid Solitaire strategy: which cards to clear first, how to use the stock cycles efficiently, and the blocking patterns that end most games prematurely.",
    intro:
      "Pyramid Solitaire can feel like pure luck, but play order matters more than most players realize. These strategies won't make every deal winnable, but they'll meaningfully improve your results.",
    sections: [
      {
        heading: "Clear the Top Rows First — Carefully",
        body: [
          "The pyramid's tip is the biggest blocker. Removing the top card opens access to two cards in row 2, which each open two more in row 3, and so on. Prioritize clearing upper rows to expand the number of free cards available. But don't clear upper cards if doing so removes a card you'll need as a partner later — check what pairs those cards form before removing them.",
        ],
      },
      {
        heading: "Conserve Kings",
        body: [
          "Kings can be removed alone at any time, which makes them feel like freebies. But a King sitting in the pyramid is blocking two row-6 cards and potentially four row-7 cards. Don't rush to remove a King if the cards beneath it aren't useful yet — plan the removal to coincide with needing access to those lower rows.",
        ],
      },
      {
        heading: "Track Which Pairs Are Still Available",
        body: [
          "If both 6s are buried deep in the pyramid under unavailable cards, your 7s are essentially useless until those 6s are uncovered. Mentally (or physically) note which pairing ranks are depleted or blocked. A 3 on the tableau with no accessible 10s is dead weight.",
        ],
      },
      {
        heading: "Use the Stock Strategically, Not Reflexively",
        body: [
          "Don't cycle through the stock just because you can't see an immediate move. Count the free cards in the pyramid carefully — sometimes a pair is available that you missed. Burning stock cycles unnecessarily reduces your options in the end game when you need specific cards to appear from the waste pile.",
        ],
      },
      {
        heading: "Recognize Dead Positions Early",
        body: [
          "The most common dead position: two paired cards (e.g. a 4 and a 9) are both buried deep in the pyramid under cards that require the other to be cleared first. This creates a blocking loop that no amount of stock cycling can resolve. Learning to spot this pattern early — rather than grinding to the inevitable loss — will save you time and frustration.",
        ],
      },
    ],
  },

  // ─── TriPeaks ──────────────────────────────────────────────────────────────

  {
    slug: "tripeaks-solitaire-rules-explained",
    game: "tripeaks",
    title: "TriPeaks Solitaire Rules Explained",
    description:
      "Everything you need to know about TriPeaks Solitaire — the three-peak layout, how chaining works, what makes a card playable, and how scoring rewards long streaks.",
    intro:
      "TriPeaks Solitaire was invented by Robert Hogue at Microsoft in 1994, and it's been one of the most popular casual card games ever since. Its fast pace and chain-combo scoring make it uniquely satisfying.",
    sections: [
      {
        heading: "The Layout",
        body: [
          "28 cards are arranged in three overlapping peaks (hence TriPeaks). Each peak is a pyramid of three rows: 1 card at the top, 2 below it, 3 at the base — but the three bases merge into a shared bottom row of 10 cards. Only the fully exposed bottom row starts face-up; cards in upper rows are face-down until the cards below them are removed. The remaining 24 cards form the stock.",
        ],
      },
      {
        heading: "What Makes a Card Playable",
        body: [
          "A card in the layout is playable when it is fully exposed — not covered by any other card. A card from the layout can be moved to the waste pile if its rank is exactly one higher or one lower than the current waste top. The sequence wraps: an Ace can go on a 2 or a King; a King can go on a Queen or an Ace.",
        ],
      },
      {
        heading: "The Stock",
        body: [
          "When no layout card is one rank away from the waste top, click the stock to flip a new waste card. The stock doesn't refill — when it's exhausted the game ends. This means wasting stock cards is costly; use the layout whenever possible.",
        ],
      },
      {
        heading: "Scoring & Streaks",
        body: [
          "Each card removed from the layout scores points. The key mechanic is the streak (or chain) bonus: consecutive layout cards removed without flipping the stock score increasing points. The first card in a chain scores 1 point, the second 2, the third 3, and so on — up to very large numbers for long chains. Building long chains is the primary skill of TriPeaks and what separates good scores from great ones.",
        ],
      },
      {
        heading: "Winning vs Losing",
        body: [
          "The game ends when either all 28 layout cards are cleared (a win) or the stock runs out with cards still on the layout (a loss). Unlike Klondike, TriPeaks doesn't always have a clean 'win condition' — the game can be completed in some implementations just by achieving a high score before the stock runs out.",
        ],
      },
    ],
  },

  {
    slug: "tripeaks-strategy-chain-combos-and-streaks",
    game: "tripeaks",
    title: "TriPeaks Strategy: Chain Combos & Maximizing Streaks",
    description:
      "Advanced TriPeaks Solitaire strategy — how to plan chains before you start, when to break a streak intentionally, how to uncover peaks efficiently, and why card-rank sequencing is everything.",
    intro:
      "TriPeaks Solitaire rewards players who plan their chains before making a single move. The score difference between reactive play (taking cards as they come) and planned play (building chains deliberately) is enormous.",
    sections: [
      {
        heading: "Scan Before You Play",
        body: [
          "Before removing any card, scan the entire bottom row and count your current options. Identify sequences of cards where one removal enables another. For example: if the waste top is a 7, and there's an 8 in the bottom row covering a 9, and another 10 is exposed next to it — that's a potential 3-card chain (8→9→10 or in reverse). Seeing these chains before you start is the single most valuable habit in TriPeaks.",
        ],
      },
      {
        heading: "Plan Unblocking Sequences",
        body: [
          "Upper peak cards are face-down until the cards below them are removed. Prioritize removing cards that uncover higher-row cards — especially if those upper-row cards connect to your current waste rank. A single well-chosen removal that flips a face-down card and extends your chain is worth more than grabbing two easy adjacent removes that don't help your chain.",
        ],
      },
      {
        heading: "When to Burn Stock Intentionally",
        body: [
          "Breaking a chain by drawing from the stock feels wrong, but it's sometimes correct. If the current waste top is a 6 and you have strong chains available from a 2 or a Jack, drawing stock cards to shift the waste top may be worth the streak reset. Count how many stock cards you have remaining before making this calculation — if you're low on stock, preserve every card.",
        ],
      },
      {
        heading: "The Wrap Rule Is Your Friend",
        body: [
          "The Ace-King wrap (A can connect to K and 2; K can connect to Q and A) is easy to forget but creates chain opportunities that appear closed. If your waste top is an Ace and you have a King in the bottom row, you can take it. Always check for these wrap connections when a chain appears to dead-end.",
        ],
      },
      {
        heading: "Target the Tallest Peak First",
        body: [
          "Not all peaks are equal. The peak with the most face-down cards is the highest-risk one — if it stays locked late in the game, you may run out of stock before clearing it. Direct early chains toward uncovering the most-blocked peak. Once its bottom row is cleared, the cards above become accessible and you'll have more room to build chains across all three peaks.",
        ],
      },
    ],
  },

  // ─── Mahjong ───────────────────────────────────────────────────────────────

  {
    slug: "mahjong-solitaire-rules-and-tile-guide",
    game: "mahjong",
    title: "Mahjong Solitaire Rules & Complete Tile Guide",
    description:
      "Learn the rules of Mahjong Solitaire — what makes a tile 'free,' how matching works, the special flower and season tiles, and the difference between Mahjong Solitaire and the multiplayer tile game.",
    intro:
      "Mahjong Solitaire (sometimes called Shanghai Solitaire) is frequently confused with the multiplayer Mahjong tile game. They share pieces but play completely differently — this is a single-player puzzle about clearing a stacked tile layout, not a draw-and-discard game.",
    sections: [
      {
        heading: "Setup: The Turtle Layout",
        body: [
          "The classic Mahjong Solitaire layout is called the Turtle (or Tortoise). 144 tiles are stacked in a specific formation: a wide, flat base of tiles on the first layer, narrower layers on top, a central spine running through multiple levels, and a single tile at the very top. The exact shape varies between versions but always involves multiple layers stacked on top of each other.",
        ],
      },
      {
        heading: "What Makes a Tile 'Free'",
        body: [
          "A tile is free — and eligible to be matched — when two conditions are met: it is not covered by any tile on a higher layer, and it is free on either its left or its right side (meaning no tile is directly touching it on at least one horizontal side). A tile blocked on both left and right by other tiles in the same layer cannot be selected, even if its top surface is exposed.",
        ],
      },
      {
        heading: "Matching Rules",
        body: [
          "Two free tiles match if they are identical. You click one tile to select it, then click its match to remove both. Most tile groups have four identical copies — two pairs to clear.",
          "Flower tiles are a special exception: the four different flower tiles (each has a unique image) all match each other. Similarly, the four season tiles each have a unique image but all match each other. You don't need to find the exact same flower — any flower matches any other flower.",
        ],
      },
      {
        heading: "The Full Tile Set",
        body: [
          "Circles (1–9, four copies each): tiles showing dot patterns from one to nine circles.",
          "Bamboo (1–9, four copies each): tiles showing bamboo stalks. The 1-bamboo typically shows a bird rather than a single stalk.",
          "Characters / Wan (1–9, four copies each): tiles showing Chinese numerals with the 'ten-thousand' character.",
          "Winds (East, South, West, North — four copies each): tiles bearing the Chinese characters for the four cardinal directions.",
          "Dragons (three types — four copies each): the Red, Green, and White dragons.",
          "Flowers (four tiles, one copy each — match any other flower).",
          "Seasons (four tiles, one copy each — match any other season).",
        ],
      },
      {
        heading: "Winning & Getting Stuck",
        body: [
          "You win by clearing all 144 tiles. You lose (or get stuck) when no two free tiles match. Not all deals are solvable — some random shuffles create impossible configurations where the only matching pairs are all blocked by each other. Most implementations offer a shuffle option when stuck.",
        ],
      },
    ],
  },

  {
    slug: "mahjong-solitaire-strategy-layers-and-blocking",
    game: "mahjong",
    title: "Mahjong Solitaire Strategy: Managing Layers & Unblocking",
    description:
      "Practical Mahjong Solitaire strategy — how to read the layout, prioritize which tiles to clear, avoid unwinnable traps, and use the shuffle and hint features effectively.",
    intro:
      "Mahjong Solitaire has a reputation as a relaxing, meditative game — and it is. But there's real strategy underneath the calm surface, and players who understand it will clear more boards and get stuck far less often.",
    sections: [
      {
        heading: "Think in Layers, Not in Pairs",
        body: [
          "The most common mistake in Mahjong Solitaire is hunting for any available match and taking it. Better players think in layers: which tiles on the top layers are accessible, and which matches will expose tiles underneath. A match that clears a top-layer tile to expose two lower-layer tiles is better than a match that clears two edge tiles with nothing beneath them.",
        ],
      },
      {
        heading: "Prioritize the Spine",
        body: [
          "In the Turtle layout, the central spine of tiles is the most congested part of the board. Tiles on the spine are typically blocked both above and on their sides. Clearing the spine tiles early (when they do become free) prevents a late-game gridlock where only spine tiles remain and none of them are accessible because their neighbors haven't been cleared.",
        ],
      },
      {
        heading: "Don't Pair the Last Two of a Set Too Early",
        body: [
          "If you have three of four identical tiles cleared and the fourth is deep in the layout, don't rush to match the last visible pair. Once that pair is cleared, the buried fourth tile can never be matched — it becomes a permanent blocker. Leave at least one copy of each tile type visible until you can confirm the buried copies are accessible.",
          "This is especially critical for tiles that appear in only one copy, like flowers and seasons — you have only one chance to match each, so verify the partner is accessible before selecting.",
        ],
      },
      {
        heading: "Reading Blocked Pairs",
        body: [
          "When you can see two matching tiles but can't reach them (both are blocked), trace the path to free each one. Sometimes clearing an unrelated tile will free a blocker, creating a chain of unblocking moves. Planning two or three moves ahead in Mahjong is exactly this: 'if I take A, that frees B, which pairs with C, which uncovers D.' Once you start thinking this way the game becomes a puzzle rather than a matching exercise.",
        ],
      },
      {
        heading: "When to Use Shuffle vs Hint",
        body: [
          "The hint feature shows you an available match. Use it when you genuinely can't find any free pair — the board can be dense and tiles hard to distinguish visually. The shuffle feature randomizes the remaining tiles (maintaining the same positions but reassigning which tile is where). Use shuffle only when you're truly stuck with no legal moves, and use it sparingly — in some versions it counts against your score.",
        ],
      },
    ],
  },

  // ─── General ───────────────────────────────────────────────────────────────

  {
    slug: "history-of-solitaire",
    game: "general",
    title: "History of Solitaire: From 18th-Century Europe to Your Browser",
    description:
      "The fascinating history of solitaire card games — from their likely origins in Northern Europe and Scandinavia, through their popularization in 19th-century France and England, to the Windows 3.0 era and today's browser-based play.",
    intro:
      "Solitaire is one of the oldest and most widely played games in the world. Its origins are surprisingly obscure for something so ubiquitous — and its journey from handmade cards on Baltic estate tables to a built-in Windows application to instant browser play is a remarkable story.",
    sections: [
      {
        heading: "The Murky Origins",
        body: [
          "The earliest clear references to solitaire card games appear in Northern Europe — specifically the Baltic region, Germany, and Scandinavia — in the late 18th century. The 1783 German book 'Das neue Königliche L'Hombre-Spiel' contains early descriptions of patience games (the European term for solitaire). The word 'patience' itself, still used in British English, suggests the games may have developed as exercises in, well, patience — perhaps during long Nordic winters.",
          "Some historians speculate that solitaire games were first played in Scandinavia and brought to France by prisoners during the Napoleonic wars. This origin story is likely apocryphal, but it reflects a real truth: by the early 19th century, patience games had become extremely popular in France and among French-speaking aristocracy across Europe.",
        ],
      },
      {
        heading: "19th-Century France: La Belle Lucie and Beyond",
        body: [
          "Napoleon Bonaparte was reportedly an avid patience player during his exile on Saint Helena, lending the games a certain romantic cachet. Whether this is true or legend, patience games flourished in 19th-century France. Many classic solitaire variants — including Klondike (possibly named for the Klondike Gold Rush region), FreeCell (formalized in the 1940s), and dozens of others — were developed and codified during this era.",
          "Lady Cadogan's 1870 book 'Illustrated Games of Patience' was the first major English-language reference and helped standardize rules across the many regional variants. Victorian England embraced patience as a genteel pastime suitable for ladies of leisure — a reputation that, fairly or not, followed solitaire for decades.",
        ],
      },
      {
        heading: "The Windows 3.0 Effect",
        body: [
          "In 1990, Microsoft shipped Windows 3.0 with a game called simply 'Solitaire' — Klondike solitaire, built by intern Wes Cherry with art from intern Susan Kare. The purpose was explicitly pedagogical: teach mouse skills (dragging) to a generation of PC users who had never used one before. The click-to-deal and drag-to-move mechanics were a perfect mouse tutorial.",
          "The effect was staggering. Within a few years, Klondike became arguably the most-played computer game in history by sheer number of sessions. Millions of office workers discovered they could minimize it instantly when their boss walked by. Microsoft's own research suggested that Solitaire represented a significant fraction of all time spent on Windows PCs in the 1990s.",
        ],
      },
      {
        heading: "Spider, FreeCell, and the Variations",
        body: [
          "Microsoft added FreeCell to Windows 3.1 in 1991 and Spider Solitaire to Windows 98. FreeCell's unusual property of being almost always solvable made it a cult favorite among competitive and analytical players. Spider Solitaire's two-deck complexity attracted players who found Klondike too quick. Both became standards.",
          "Pyramid, TriPeaks, and Mahjong Solitaire all have older roots — Pyramid and Mahjong Solitaire descend from traditional matching games, and TriPeaks was invented by Microsoft's Robert Hogue in 1994. But all gained mainstream exposure through digital versions.",
        ],
      },
      {
        heading: "Solitaire Today",
        body: [
          "Browser-based solitaire removed the last barrier: platform. Games that once required a Windows PC now run on any device with a browser. Mobile apps made solitaire the most-played mobile game category worldwide. Estimates suggest several hundred million people play some form of solitaire at least once a month.",
          "The game has come full circle from its origins as a solitary patience exercise on a Baltic estate in the 1700s — now connected, shared, played on phones during commutes and on tablets at kitchen tables. The fundamental appeal — simple rules, endless variability, a satisfying interplay of skill and luck — hasn't changed at all.",
        ],
      },
    ],
  },

  {
    slug: "solitaire-glossary",
    game: "general",
    title: "Solitaire Glossary: Key Terms Across All Six Games",
    description:
      "A clear, jargon-free glossary of solitaire terms used across Klondike, Spider, FreeCell, Pyramid, TriPeaks, and Mahjong Solitaire — foundations, tableau, free cells, stock, waste, and more.",
    intro:
      "Solitaire games share a vocabulary built up over centuries of play. If you've ever wondered what 'tableau' means, why the discard pile is called the 'waste,' or what exactly a 'foundation' is, this glossary has you covered.",
    sections: [
      {
        heading: "Core Layout Terms",
        body: [
          "Tableau — The main playing area where most action happens. In Klondike, the seven columns of face-up and face-down cards. In Spider, the ten columns. Cards on the tableau are built into sequences and eventually moved to the foundation.",
          "Foundation — The target piles where you build sequences to win. In Klondike and FreeCell, four piles (one per suit) built Ace through King. In Spider, eight piles (one per completed King-through-Ace sequence). Getting all cards to the foundation wins the game.",
          "Stock (or Draw Pile) — The pile of undealt cards. In Klondike, it sits in the top-left and is flipped one or three cards at a time. In Spider, it deals one card to every column when clicked. In Pyramid and TriPeaks, it is clicked to reveal cards to the waste.",
          "Waste (or Talon) — The pile of cards flipped from the stock. The top card of the waste is usually the only one accessible for play. In Pyramid, the waste top is compared against pyramid cards to find pairs.",
        ],
      },
      {
        heading: "Move Types",
        body: [
          "Build — To place a card on a tableau pile following the game's sequencing rules (e.g., alternating color and descending rank in Klondike).",
          "Sequence (or Run) — A group of cards on the tableau that can be moved together as a unit because they follow the building rules in an unbroken chain.",
          "Auto-move — When the game automatically moves a card to the foundation because it's the correct next card. Most implementations offer this as an option to speed up the end game.",
          "Deal — To flip new cards from the stock. In Spider, dealing one card to every column. In Klondike, flipping the top stock card to waste.",
        ],
      },
      {
        heading: "Game-Specific Terms",
        body: [
          "Free Cell — In FreeCell Solitaire specifically, the four empty buffer cells in the top-left where individual cards can be parked temporarily. Not to be confused with 'FreeCell' (the game name).",
          "Empty Column — A tableau column with no cards. Extremely valuable in most solitaire variants as a temporary parking space or for holding Kings.",
          "In-Suit Sequence — In Spider, a sequence of cards that are all the same suit. Only in-suit sequences can be moved as a group.",
          "Free Tile — In Mahjong Solitaire, a tile that is not covered and has at least one open side. Only free tiles can be matched.",
          "Chain / Streak — In TriPeaks, a run of consecutive layout cards removed without drawing from the stock. Longer chains score exponentially more points.",
          "Pair — In Pyramid Solitaire, two cards whose ranks sum to 13. Matched pairs are removed from the game.",
        ],
      },
      {
        heading: "Strategy Terms",
        body: [
          "Dead Position — A state from which no more progress is possible regardless of future play. In Klondike, a common dead position is when every needed card is trapped under an immovable stack and the stock has been exhausted.",
          "Stranded Card — In Draw 3 Klondike, a card in the stock that never appears at the top of the waste due to the three-card cycling math. With certain stock sizes, some cards surface less frequently or only in specific cycle counts.",
          "Blocking — A situation where a needed card cannot be accessed because other cards are on top of or adjacent to it. Most solitaire losses come from unresolvable blocking.",
          "Patience — The original British term for solitaire card games. Still used in the UK and much of Europe. From the French 'patience,' reflecting the temperament these games reward.",
        ],
      },
    ],
  },

  // ─── Klondike (additional) ─────────────────────────────────────────────────

  {
    slug: "klondike-solitaire-common-mistakes",
    game: "klondike",
    title: "Top Klondike Mistakes That Cost You the Game",
    description:
      "The most common Klondike Solitaire errors — from moving Aces too early to misusing empty columns — explained with clear fixes you can apply immediately.",
    intro:
      "Most Klondike losses aren't random bad luck. They follow predictable patterns: the same handful of mistakes appear again and again. Recognizing them is the fastest route to a higher win rate.",
    sections: [
      {
        heading: "Moving Every Available Card to the Foundation Immediately",
        body: [
          "This feels like the point of the game, but moving mid-range cards (5s through 9s) to the foundation prematurely can strand sequences that needed them. A black 6 on the foundation can no longer accept a red 5 — if that red 5 is the only card that can unlock a column, you've created an unresolvable block.",
          "The fix: move Aces and 2s to the foundation freely. Hold off on 3s through 9s unless you can confirm no tableau sequence will need them as a base.",
        ],
      },
      {
        heading: "Filling Empty Columns with the First Available King",
        body: [
          "An empty column is the most valuable resource on the board — it's a free parking space and a place to start a new sequence. Dropping any King into it without a plan wastes that flexibility.",
          "The fix: before placing a King in an empty column, ask what the move accomplishes. Ideally, the King should have a Queen waiting to go on it, which has a Jack, and so on — a whole sequence ready to build. A lone King with nothing behind it is usually wasted potential.",
        ],
      },
      {
        heading: "Ignoring the Stock for Too Long",
        body: [
          "Some players obsess over the tableau and forget to cycle the stock. Cards in the stock can break open a stuck position — an Ace in the stock is invisible until you flip it.",
          "The fix: after each significant tableau move, do a quick stock cycle to see if anything useful has surfaced. Don't cycle mindlessly, but don't ignore it either.",
        ],
      },
      {
        heading: "Moving Tableau Cards Without a Purpose",
        body: [
          "Every move that doesn't reveal a face-down card or enable a foundation move is essentially neutral — it shuffles cards around without advancing the game. Chains of lateral moves are seductive (they look like progress) but can actually make the board harder to read and leave fewer options.",
          "The fix: before any tableau-to-tableau move, ask: does this reveal a face-down card? Does it set up a foundation move? If the answer is no to both, reconsider.",
        ],
      },
      {
        heading: "Giving Up Too Early",
        body: [
          "Klondike can look dead when it isn't. Players often stop cycling the stock after one or two passes, not realizing that a different order of tableau moves would open a new path. The game has more depth than it appears.",
          "The fix: before resetting, try at least three full stock cycles with active tableau play between cycles. If no progress is made over three complete passes, the deal is likely unwinnable — but don't stop at one.",
        ],
      },
    ],
  },

  {
    slug: "klondike-solitaire-vegas-mode-explained",
    game: "klondike",
    title: "Vegas Scoring Mode Explained: Rules, Strategy & Payouts",
    description:
      "A complete guide to Vegas Scoring in Klondike Solitaire — how the wager and payout system works, what the pass limit means strategically, and how to maximize your return.",
    intro:
      "Vegas mode transforms Klondike from a puzzle into an economic problem. Every card you move to the foundation earns money; every pass through the stock costs you. Understanding the math changes how you play every hand.",
    sections: [
      {
        heading: "The Basic Wager System",
        body: [
          "In Vegas scoring, you start with a virtual wager of -$52 (one dollar per card in the deck). Each card you successfully move to a foundation pile pays out $5. A complete win — all 52 cards on the foundation — returns $208 net, for a profit of $156 over your wager.",
          "Breaking even requires 11 cards on the foundation ($55 - $52 wager = $3, or technically 11 cards at $5 = $55 against the $52 wager). Most sessions will land somewhere between 5 and 30 cards, making a small loss the average result — which is exactly why Vegas casinos offered this game as real-money play.",
        ],
      },
      {
        heading: "The Stock Pass Limit",
        body: [
          "Vegas mode typically limits you to one or three passes through the stock (depending on Draw 1 or Draw 3). In standard Klondike you can recycle the stock unlimited times; Vegas mode eliminates that safety net. Once the stock is exhausted, you're playing with only what's accessible on the tableau and waste.",
          "This pass limit is the defining strategic constraint of Vegas mode. Cards that you'd normally catch on a later stock pass are now gone if you miss them. Timing your stock cycling is therefore more important than in standard mode.",
        ],
      },
      {
        heading: "Draw 1 Vegas vs Draw 3 Vegas",
        body: [
          "Draw 1 Vegas with one pass gives you exactly 24 opportunities to play waste cards. This makes card tracking relatively manageable — you know that each stock card will appear exactly once. Play any playable card immediately, because it won't come back.",
          "Draw 3 Vegas is the hardest mainstream Klondike variant. Three-card cycling means some cards may never surface in a single pass depending on stock size. The house edge in this version is severe — average players will lose their wager on most hands. It rewards players who can mentally track card positions across three-card groups.",
        ],
      },
      {
        heading: "Adapting Your Strategy for Vegas",
        body: [
          "In Vegas mode, greed is rational. Unlike standard Klondike where you might hold a card in play for flexibility, Vegas mode rewards moving every possible card to the foundation as quickly as possible — each one is worth $5 and the clock is ticking on your stock passes.",
          "Empty columns become less sacred than in standard mode. Using an empty column aggressively to accelerate foundation building is often the right call, because the payoff ($5 per card) is immediate and concrete whereas the flexibility an empty column provides is speculative.",
          "Accept losses gracefully. Even skilled Vegas mode players will lose money on most individual hands. The goal is minimizing losses on unwinnable deals and maximizing returns on winnable ones — not winning every hand.",
        ],
      },
    ],
  },

  // ─── Spider (additional) ───────────────────────────────────────────────────

  {
    slug: "spider-solitaire-empty-columns-strategy",
    game: "spider",
    title: "Mastering Empty Columns in Spider Solitaire",
    description:
      "Empty tableau columns are the most powerful resource in Spider Solitaire. This guide explains when to create them, how to use them, and why protecting them separates intermediate from advanced players.",
    intro:
      "In Klondike, an empty column is valuable. In Spider, it is almost irreplaceable. The ability to create, protect, and exploit empty columns is the single biggest skill gap between players who clear boards regularly and those who get stuck.",
    sections: [
      {
        heading: "Why Empty Columns Matter So Much",
        body: [
          "Spider allows moving multi-card sequences as a group only if they are in-suit. Mixed-suit sequences — the norm on most boards — must be moved one card at a time. Moving them one at a time requires a destination for each card. Empty columns are those destinations.",
          "Without an empty column, a mixed-suit sequence of 5 cards is effectively immovable. With one empty column, you can move up to two extra cards temporarily. With two empty columns, up to four. The formula is: maximum movable sequence length = 2^(empty columns). Each additional empty column doubles your maneuverability.",
        ],
      },
      {
        heading: "How to Create an Empty Column",
        body: [
          "Creating an empty column requires clearing all cards from one of the ten tableau piles. This is easiest early in the game before stock deals add more cards. Target the shortest column — whichever pile has the fewest cards is cheapest to clear.",
          "Look for a column where the face-up cards form a valid sequence that can be distributed onto other columns. You don't need to remove the face-down cards — if you clear everything face-up, the face-down cards will flip, and you can deal with them next.",
        ],
      },
      {
        heading: "How Not to Waste an Empty Column",
        body: [
          "The most common mistake: filling an empty column with a King just because it's available. Unless that King is part of a specific sequence you're building, you've just spent your most valuable resource for no gain.",
          "A close second: using the empty column as permanent storage for a card you're not sure what to do with. Empty columns are best used as transit spaces — move a card there temporarily to unlock a move, then move it again immediately to its proper destination. A column that stays parked with a single card for multiple turns is probably a wasted opportunity.",
        ],
      },
      {
        heading: "Using Multiple Empty Columns Simultaneously",
        body: [
          "When you have two or more empty columns, treat them like hands in a card trick — coordinated tools, not independent slots. To move a 4-card mixed-suit sequence from column A to column B, you might need to use column C and column D as temporary holds for individual cards while you reassemble the sequence on column B one card at a time.",
          "Planning these multi-column maneuvers before starting them is essential. Starting a reorganization without a complete mental map often results in a worse position than where you started.",
        ],
      },
    ],
  },

  {
    slug: "spider-solitaire-when-to-deal",
    game: "spider",
    title: "When to Deal in Spider Solitaire (and When to Wait)",
    description:
      "Dealing from the stock in Spider Solitaire is irreversible and adds complexity. This guide explains the right conditions for dealing, what to do before each deal, and how to avoid burying progress.",
    intro:
      "Each deal in Spider adds 10 new cards across all occupied columns — burying whatever was on top of each pile and resetting your options. The best Spider players treat dealing as a last resort, not a reflex.",
    sections: [
      {
        heading: "The Cost of Dealing",
        body: [
          "When you deal, every occupied column gets a new card on top. Cards you've carefully organized — particularly partially completed in-suit sequences — can be buried under a random card that breaks the sequence. An 8 of spades sitting ready to receive a 7 of spades might suddenly have a 3 of hearts on top of it.",
          "Dealing also increases board complexity. With 10 more face-up cards in play, there are more potential moves — but also more distracting possibilities that pull attention from the most important ones. Many players find the board hardest to read immediately after a deal.",
        ],
      },
      {
        heading: "Conditions Worth Waiting For Before Dealing",
        body: [
          "Before dealing, check: is there an empty column? If yes, try harder to use it productively before burying it under a new card. Dealing into an empty column fills it, costing you that flexibility. Fill the empty column strategically — or protect it by making another column empty first — before dealing.",
          "Also check whether any in-suit sequences are nearly complete. A 6-card in-suit run from King to 8 is close to becoming a completed sequence (K through A removes it). Dealing one card away from completion when you're 6 steps out is reasonable. Dealing when you're 2 steps out is almost always wrong.",
        ],
      },
      {
        heading: "Signs You Should Deal",
        body: [
          "If you have no empty columns and no legal moves that build in-suit sequences, dealing is probably correct. If you have empty columns but can't figure out any productive way to use them after careful review, dealing may be the right call to get fresh cards.",
          "Also deal if the board is highly fragmented — many short mixed-suit columns with no clear consolidation paths. Sometimes a fresh set of cards randomizes the board enough to create new options, even if it feels backward.",
        ],
      },
      {
        heading: "Never Deal Into an Empty Column",
        body: [
          "This is the most expensive dealing mistake. If any column is empty, dealing will place a card there — permanently consuming that empty column for a single random card. Before every deal, make sure all 10 columns are occupied. If a column just became empty, either use it productively right now or decide to leave that column empty and skip dealing until you're ready.",
        ],
      },
    ],
  },

  {
    slug: "spider-solitaire-building-in-suit",
    game: "spider",
    title: "Why Building In-Suit Is the Key to Spider Solitaire",
    description:
      "Spider allows off-suit builds but only rewards in-suit ones. This guide explains why mixed-suit sequences create long-term traps, how to break them up, and how to retrain your instincts for in-suit play.",
    intro:
      "Spider Solitaire lets you place any card on any card one rank higher — suits don't matter for legality. This flexibility is a trap. Mixed-suit builds feel like progress but create rigid, unmovable structures that eventually block the entire board.",
    sections: [
      {
        heading: "The Rule and Why It Matters",
        body: [
          "A sequence of cards can only be moved as a group if every card in that sequence is the same suit. A 9-8-7-6-5 all in spades can be picked up and moved as one unit. The same sequence in mixed suits — 9 spades, 8 hearts, 7 spades, 6 clubs, 5 hearts — must be moved one card at a time, requiring empty columns for each intermediary move.",
          "This restriction means mixed-suit sequences are expensive to work with. A five-card mixed sequence requires four empty columns to fully relocate. If you only have one empty column, a five-card mixed sequence is effectively immovable.",
        ],
      },
      {
        heading: "How Mixed-Suit Sequences Become Traps",
        body: [
          "Imagine you've built a long mixed-suit sequence across a column. You need to move it to free a card underneath. The move requires more empty columns than you have. You look for ways to create empty columns — but doing so requires moving other mixed-suit sequences that are equally locked. The board grinds to a halt.",
          "This is the classic Spider endgame trap: a board full of long mixed-suit sequences with no empty columns and no in-suit sequences ready to complete. Nearly every game lost to this configuration could have been avoided with more aggressive in-suit building in the earlier phases.",
        ],
      },
      {
        heading: "Practical In-Suit Discipline",
        body: [
          "When you have a choice between two tableau moves — one that builds off-suit and one that builds in-suit — always prefer in-suit, even if the off-suit move looks more productive in the moment. The short-term cost of a less intuitive in-suit move is almost always worth the long-term benefit.",
          "When you must build off-suit (no in-suit option exists), keep the mixed sequence as short as possible. A two-card mixed sequence is annoying but manageable. A seven-card mixed sequence is often fatal to the position.",
        ],
      },
      {
        heading: "Breaking Up Mixed Sequences",
        body: [
          "When a mixed-suit sequence already exists and you need to break it up, start from the top. Move the top card somewhere in-suit if possible, then reassess. Each card you peel off and re-route to an in-suit destination cleans up the position. This is slow, methodical work — but it's often the only path forward on a stuck board.",
        ],
      },
    ],
  },

  // ─── FreeCell (additional) ─────────────────────────────────────────────────

  {
    slug: "freecell-solitaire-beginner-guide",
    game: "freecell",
    title: "FreeCell for Beginners: Your First 10 Moves",
    description:
      "A beginner-friendly FreeCell Solitaire guide — how to read the initial layout, which moves to make first, and the three principles that will make every deal feel more manageable.",
    intro:
      "FreeCell is intimidating at first: 52 face-up cards and seemingly infinite choices. But the opening moves follow a clear logic, and once you understand the three beginner principles, the game unlocks quickly.",
    sections: [
      {
        heading: "Read the Whole Board Before Moving Anything",
        body: [
          "This is the biggest difference between FreeCell and most card games: because all 52 cards are visible, you have all the information you need before making your first move. Most beginners start moving cards immediately. Better players spend 30 seconds scanning the board.",
          "What to look for: Are any Aces accessible immediately? Are any Aces buried under one or two cards? Which suits are most blocked? Where are the 2s relative to their matching Aces? This scan shapes your first five moves.",
        ],
      },
      {
        heading: "Principle 1: Get the Aces and 2s Out",
        body: [
          "Aces must reach the foundation for any progress to happen. Your first priority is always clearing the path to Aces — moving one or two cards from free cells or other tableau columns to expose them. Once an Ace is on the foundation, move its matching 2 as soon as possible.",
          "Low cards on the foundation are almost never needed back in the tableau. Aces, 2s, and 3s can go up as soon as they're accessible without strategic risk.",
        ],
      },
      {
        heading: "Principle 2: Use Free Cells as a Last Resort, Not a First Move",
        body: [
          "Every card in a free cell reduces the maximum number of cards you can move as a group. With all four free cells occupied, you can only move one card at a time to any destination. That turns every sequence reorganization into a one-card-at-a-time puzzle.",
          "Use free cells only when there is no tableau destination for a card you need to move. Then empty them as quickly as possible. A free cell that holds a card for 20 moves is almost always a sign of an earlier strategic mistake.",
        ],
      },
      {
        heading: "Principle 3: Build Long Alternating-Color Sequences",
        body: [
          "The tableau builds in descending rank and alternating color. Look for opportunities to extend existing sequences by adding the next card in color-rank order. A long sequence is easier to manage than many short scattered piles — and it leaves more columns free, which multiplies your moving power.",
          "If you have a black 7 and a red 6 exposed, placing the 6 on the 7 consolidates two separate piles into one and clears a column position. Chain these consolidations together and you'll find the board opening up naturally.",
        ],
      },
      {
        heading: "Your First 10 Moves in Practice",
        body: [
          "1. Identify all accessible Aces — move any to the foundation immediately. 2. Move whatever is blocking the remaining Aces to free cells or valid tableau spots. 3. Move matching 2s to the foundation. 4. Look for tableau moves that create or extend alternating-color sequences without using a free cell. 5. Use a free cell only if it's the only way forward. 6. Repeat, always preferring tableau moves over free cell moves.",
        ],
      },
    ],
  },

  {
    slug: "freecell-supermoves-explained",
    game: "freecell",
    title: "FreeCell Supermoves: How to Move Groups of Cards",
    description:
      "FreeCell technically moves one card at a time, but the supermove rule lets you move sequences as a group. This guide explains the math, how to maximize your group move size, and why empty columns matter more than free cells.",
    intro:
      "A common misconception about FreeCell is that you can only move one card at a time. You can move sequences as a group — but only if you have the free space to do so. Understanding exactly how much space you need changes how you plan every position.",
    sections: [
      {
        heading: "What Is a Supermove?",
        body: [
          "A supermove is when the game simulates moving a sequence of alternating-color, descending cards all at once. Under the hood, the game is moving them one at a time through free cells and empty columns — but it happens instantly if you have enough space.",
          "The maximum number of cards you can move as a group equals: (number of empty free cells + 1) \u00d7 2^(number of empty tableau columns). This formula is the most important calculation in intermediate and advanced FreeCell play.",
        ],
      },
      {
        heading: "Breaking Down the Formula",
        body: [
          "With no empty free cells and no empty columns: you can move 1 card. With 1 empty free cell and no empty columns: 2 cards. With 2 empty free cells and no empty columns: 3 cards. With 3 empty free cells and no empty columns: 4 cards. With all 4 free cells empty and no empty columns: 5 cards.",
          "Now add an empty column: with 4 empty free cells and 1 empty column, you can move 10 cards. With 2 empty free cells and 2 empty columns: (2+1) \u00d7 4 = 12 cards. Empty columns contribute exponentially; free cells contribute linearly. This is why advanced players prioritize emptying entire columns over preserving free cells.",
        ],
      },
      {
        heading: "Practical Application",
        body: [
          "Before attempting to move a long sequence, count: how many free cells are empty? How many tableau columns are empty? Apply the formula. If your sequence has 7 cards and the formula says you can only move 5, you need to either shorten the sequence or create more space first.",
          "The most common error is attempting a move intuitively, having it fail, and not understanding why. The formula eliminates that confusion — you always know exactly how many cards you can move before trying.",
        ],
      },
      {
        heading: "Creating Space Before You Need It",
        body: [
          "Since empty columns contribute exponentially to your move capacity, the best time to create an empty column is before you need to make a big move. If you can see that in three moves you'll need to shift a 6-card sequence, plan to empty a column now so that the space is available when you need it.",
          "This forward-planning mindset — creating resources before they are needed — is what separates a good FreeCell player from a great one. The game always plays better when you're preparing for the next constraint rather than reacting to it.",
        ],
      },
    ],
  },

  {
    slug: "freecell-solitaire-hardest-deals",
    game: "freecell",
    title: "The Hardest FreeCell Deals and How to Think About Them",
    description:
      "Some FreeCell deals are genuinely brutal even for experienced players. This guide explains what makes a deal difficult, how to recognize a hard layout, and the thinking process for working through the toughest positions.",
    intro:
      "Nearly every FreeCell deal is solvable, but \u2018solvable\u2019 and \u2018easy to solve\u2019 are very different things. Some layouts require 30+ move sequences planned in advance. Here\u2019s how to approach them.",
    sections: [
      {
        heading: "What Makes a Deal Hard",
        body: [
          "Hard FreeCell deals share common characteristics: Aces are deeply buried under multiple cards in long columns. Low cards (3s, 4s, 5s) that are needed early are scattered across different columns without accessible paths. The initial alternating-color opportunities are minimal, forcing early free cell use.",
          "The hardest deals also have what players call \u2018tightly coupled\u2019 card positions — where freeing card A requires card B, which requires card C, which requires card A again. These circular dependencies demand creative routing through free cells and empty columns.",
        ],
      },
      {
        heading: "The Two Unsolvable Deals",
        body: [
          "Deal #11982 and deal #146692 (in the Microsoft FreeCell numbering) are provably unsolvable. Both create irreducible circular dependencies where no amount of free cell usage can break the loop. If you encounter these exact deals, no solution exists — and that\u2019s not a reflection of your skill.",
          "For all other deals, a solution exists. If you\u2019re stuck on a non-unsolvable deal, the issue is always your approach, not the deal itself.",
        ],
      },
      {
        heading: "Working Through a Hard Position",
        body: [
          "On a difficult deal, work backwards from the desired outcome. Ask: what does the foundation need next? What card would enable that? Where is that card? What\u2019s blocking it? This reverse-engineering process often reveals a 6 or 8 move sequence that isn\u2019t obvious from a forward scan.",
          "Use the undo feature freely on hard deals. FreeCell is a planning game, not a memory game. Testing a line of play for 10 moves, finding it leads to a dead end, and undoing back to explore a different path is legitimate strategy.",
        ],
      },
      {
        heading: "When to Use the Hint System",
        body: [
          "Hints show you a legal next move, not necessarily the best one. On a hard deal, the hint system is most useful for escaping a feeling of total paralysis — it can reveal a move you hadn\u2019t considered, and from there you can evaluate whether it fits your broader plan.",
          "Don\u2019t follow hints blindly on hard deals. A hint might be technically valid but strategically counterproductive. Use it as one input among many, not as a substitute for planning.",
        ],
      },
    ],
  },

  // ─── Pyramid (additional) ──────────────────────────────────────────────────

  {
    slug: "pyramid-solitaire-stock-cycling-strategy",
    game: "pyramid",
    title: "Pyramid Solitaire Stock Cycling Strategy",
    description:
      "How to use the stock and waste piles strategically in Pyramid Solitaire — when to draw, when to hold, how many recycles to expect, and the card-counting approach that improves your win rate.",
    intro:
      "The stock in Pyramid Solitaire is your lifeline when the pyramid has no free pairs. How you use it — and how many times you cycle through it — often determines whether you win or lose.",
    sections: [
      {
        heading: "The Stock as a Pairing Resource",
        body: [
          "The waste pile\u2019s top card is always available to pair with a free pyramid card. This means the stock doesn\u2019t just provide new cards to pair between themselves — it provides a card that can partner with any free pyramid card of the right rank. Drawing a 6 when three 7s are free in the pyramid gives you an immediate play.",
          "Think of the stock as a rotary dial: you cycle through cards, looking for the right complement to whatever is exposed in the pyramid. The more free pyramid cards you have at any moment, the more useful each new stock card becomes.",
        ],
      },
      {
        heading: "Recycle Counts: How Many Passes Do You Get?",
        body: [
          "Most Pyramid Solitaire versions allow one or two recycles of the waste back into the stock, giving you two or three total passes through the stock. With 24 cards in the stock and typically 28 in the pyramid, three passes gives you 72 stock card views — but each pass plays differently because the order changes based on what you removed.",
          "Don\u2019t burn your recycles early. Save at least one recycle for the endgame, when only a handful of pyramid cards remain and you need specific waste cards to appear for the final pairings.",
        ],
      },
      {
        heading: "When to Draw vs When to Pair",
        body: [
          "If two free pyramid cards can pair directly (they sum to 13), pair them without drawing from the stock first. Stock draws are precious; direct pyramid pairs cost nothing. Always exhaust direct pyramid pairs before drawing.",
          "When no direct pairs exist, draw from the stock and immediately check: does this new waste card pair with any free pyramid card? If yes, make the pair. If no, draw again. Only stop drawing when you either make a pairing or exhaust the stock pass.",
        ],
      },
      {
        heading: "Watching for Dangerous Waste Pairs",
        body: [
          "A subtle trap: if the current waste top is a 6, drawing a 7 creates a direct waste pair. But pairing them removes both from play before you can use either against the pyramid. Sometimes it\u2019s worth intentionally skipping a waste-to-waste pair to preserve one of those cards for a pyramid card that needs it.",
          "This only matters when the pyramid card in question is the only one that matches — for example, if the 6 of spades is the only accessible 6 and a 7 is buried in the pyramid, pairing the waste 6 and 7 leaves that pyramid 7 permanently stranded.",
        ],
      },
    ],
  },

  {
    slug: "pyramid-solitaire-variants-and-rules",
    game: "pyramid",
    title: "Pyramid Solitaire Variants: Classic, Relaxed & Timer Modes",
    description:
      "Not all Pyramid Solitaire games play the same. This guide explains the differences between Classic, Relaxed, and Timer variants — recycle counts, scoring systems, and which mode suits different players.",
    intro:
      "Pyramid Solitaire exists in several distinct variants with meaningfully different rules. Knowing which version you\u2019re playing — and what its specific constraints are — changes how you approach every hand.",
    sections: [
      {
        heading: "Classic Pyramid",
        body: [
          "The original rule set. You get one or two recycles of the waste pile (two or three total passes through the stock, depending on the implementation). Pairs that sum to 13 are removed; Kings leave alone. You win by clearing all 28 pyramid cards.",
          "Classic Pyramid has a relatively low theoretical win rate — around 1 in 50 deals is winnable with optimal play, depending on the exact recycle count allowed. Many implementations improve this significantly by allowing more recycles or adjusting the pyramid layout.",
        ],
      },
      {
        heading: "Relaxed Pyramid",
        body: [
          "Relaxed mode allows unlimited recycles through the stock. This dramatically increases the win rate — most deals become theoretically winnable with enough passes. The challenge shifts from \u2018can I win\u2019 to \u2018can I win efficiently\u2019 (with a good score or low cycle count).",
          "Relaxed mode is ideal for players learning the game, since it removes the pressure of limited stock passes and lets you focus on the pairing logic and pyramid unblocking strategies without losing to a missed recycle opportunity.",
        ],
      },
      {
        heading: "Timer Mode",
        body: [
          "Timer mode adds a countdown clock, typically 10 to 15 minutes. The goal is clearing as many pyramid cards as possible before time runs out, with scoring bonuses for clearing the full pyramid. Efficient play — minimizing unnecessary draws, taking direct pairs immediately, unblocking the pyramid top first — becomes critical.",
          "Timer mode rewards players who have already learned the strategic principles of Classic Pyramid. It\u2019s a poor teaching mode (the clock pressure discourages careful thinking) but an excellent test of whether those principles have become instinct.",
        ],
      },
      {
        heading: "Scoring Variations",
        body: [
          "Basic scoring: 5 points per pyramid card removed, 100 bonus for clearing the full pyramid. Some versions add streak bonuses for removing multiple pyramid cards in a row without drawing from stock. Others add time bonuses in timer mode, or multiply points by recycle count efficiency (fewer recycles = higher multiplier).",
          "Understanding the scoring system in your specific version tells you which behaviors to optimize. If streak bonuses exist, prioritize chains of direct pyramid pairs before drawing. If recycle efficiency is scored, work harder to solve with fewer stock passes.",
        ],
      },
    ],
  },

  {
    slug: "pyramid-solitaire-odds-and-statistics",
    game: "pyramid",
    title: "Pyramid Solitaire Win Rates and Odds",
    description:
      "How winnable is Pyramid Solitaire really? This guide covers theoretical win rates, how recycle limits affect solvability, why Pyramid is harder than it looks, and what the numbers mean for your experience.",
    intro:
      "Pyramid Solitaire has the lowest theoretical win rate of the solitaire games on this site. Understanding why — and what the actual numbers look like — helps set realistic expectations and sharpen your strategy.",
    sections: [
      {
        heading: "Theoretical Win Rate",
        body: [
          "With two recycles allowed (three total stock passes), the theoretical win rate for optimal Pyramid Solitaire play is approximately 1 in 50 deals, or around 2%. Some analyses place it slightly higher (up to 5%) depending on exact rule variations. Compare this to Klondike (Draw 1) at roughly 82% theoretical winnability — Pyramid is in a different difficulty class entirely.",
          "This low win rate is not a failure of the game design. It\u2019s intentional. Pyramid plays many very quick hands, and the low win rate creates a strong positive reinforcement effect when a win does occur.",
        ],
      },
      {
        heading: "Why Pyramid Is Hard to Analyze",
        body: [
          "Unlike FreeCell (all cards visible from the start) or even Klondike (one decision tree), Pyramid\u2019s complexity comes from the interaction between the hidden stock order and the pyramid exposure sequence. The optimal play order depends on what cards are coming next in the stock — information you don\u2019t have until they arrive.",
          "This hidden information means that even \u2018optimal play\u2019 must be probabilistic. You might make a choice that is statistically correct (preserves the most future winning lines) but still lose because of an unfortunate stock order.",
        ],
      },
      {
        heading: "Recycle Count and Solvability",
        body: [
          "With zero recycles (one stock pass only), fewer than 1% of deals are winnable. With one recycle (two passes), about 1\u20132%. With two recycles (three passes), about 2\u20135%. With unlimited recycles, most deals become theoretically solvable given enough passes, though some layouts create irreducible loops even with infinite recycles.",
          "The sharp jump in win rate from zero to one recycle illustrates how much difference a single additional pass makes. This is why the recycle limit is the most impactful single parameter in Pyramid Solitaire\u2019s difficulty.",
        ],
      },
      {
        heading: "What This Means for Your Play",
        body: [
          "If you\u2019re playing classic Pyramid and losing most games, you are playing correctly — most deals are unwinnable. A loss in Pyramid does not necessarily mean you made a mistake. A win in Pyramid is a genuine accomplishment.",
          "Focus your improvement energy on maximizing the number of pyramid cards cleared per hand rather than winning outright. Consistently clearing 20\u201325 of 28 pyramid cards is a mark of good play, even on hands where the final few cards can\u2019t be cleared.",
        ],
      },
    ],
  },

  // ─── TriPeaks (additional) ─────────────────────────────────────────────────

  {
    slug: "tripeaks-solitaire-scoring-guide",
    game: "tripeaks",
    title: "TriPeaks Solitaire Scoring: Streaks, Stars & Maximizing Points",
    description:
      "A complete breakdown of how TriPeaks Solitaire scoring works — the streak multiplier, how to build long chains, what stars require, and the specific plays that maximize your score on every hand.",
    intro:
      "TriPeaks scoring rewards streaks exponentially. A player who builds two 10-card chains will outscore a player who clears the whole board with ten 2-card chains. Understanding the math behind the scoring changes how you prioritize every move.",
    sections: [
      {
        heading: "How the Streak Multiplier Works",
        body: [
          "Each consecutive card removed from the layout without drawing from the stock scores an increasing number of points. The first card in a chain scores 1 point, the second scores 2, the third scores 3, and so on — the n-th card in a chain scores n points. The total score for a chain of length n is n(n+1)/2.",
          "A chain of 5 cards scores 15 points. A chain of 10 cards scores 55 points. A chain of 15 cards scores 120 points. The exponential growth means that building one long chain is drastically more efficient than building many short ones — a single 10-card chain (55 pts) scores more than three 5-card chains (45 pts total) even though a 5-card chain uses fewer cards.",
        ],
      },
      {
        heading: "Streak Reset vs Stock Draw",
        body: [
          "Drawing from the stock resets your streak to zero. This means every stock draw is both a card spent and a streak lost. The cost of a stock draw is therefore: (the points you would have earned by extending your current chain by at least one more card).",
          "If your current streak is at 8 cards, the next card in the chain would score 9 points. If drawing from stock gives you a card that starts a new chain, your first new card scores just 1 point. That\u2019s an 8-point loss from the streak reset alone. High streaks make stock draws increasingly costly.",
        ],
      },
      {
        heading: "Stars and Completion Bonuses",
        body: [
          "Many TriPeaks implementations use a star rating system: 1 star for completing the hand, 2 stars for completing it with stock cards remaining, 3 stars for completing it with a minimum number of stock draws or a minimum score. The exact thresholds vary by implementation.",
          "To consistently earn 3 stars, aim for: clearing all three peaks, maintaining at least one streak of 10+ cards, and finishing with 5 or more stock cards undrawn. These targets are achievable on favorable deals if you plan your chains before playing.",
        ],
      },
      {
        heading: "Plays That Maximize Score",
        body: [
          "Identify your longest possible chain before making any move. Scan the bottom row for rank sequences (3-4-5 or 10-9-8, wrapping A-K or K-A) and trace how each sequence could continue upward into the peaks as they uncover. The chain that extends most naturally through unblocking moves is your target.",
          "Sacrifice a shorter chain start to preserve a longer one. If playing a 6 now would start a 4-card chain, but that 6 is also the bridge into an 8-card chain later once a peak uncovers, hold off. Let the peak uncover first, then chain through the 6 into the longer sequence.",
        ],
      },
    ],
  },

  {
    slug: "tripeaks-solitaire-beginner-guide",
    game: "tripeaks",
    title: "TriPeaks Solitaire Beginner\u2019s Guide: Rules, Tips & First Strategies",
    description:
      "Everything a new TriPeaks Solitaire player needs to know — how the game works, why it\u2019s different from Klondike, the wrap rule, and three strategies to start winning immediately.",
    intro:
      "TriPeaks Solitaire is one of the fastest and most satisfying solitaire games to learn. The rules are simple, a session takes 3\u20137 minutes, and the streak mechanic makes every good run feel rewarding. Here\u2019s how to get started.",
    sections: [
      {
        heading: "The Key Difference from Other Solitaire Games",
        body: [
          "Most solitaire games build sequences. TriPeaks chains cards. You\u2019re not building ascending or descending piles — you\u2019re chaining from the current waste card, one rank up or one rank down, as many times in a row as possible. The layout is a board to clear, not a sequence to build.",
          "This makes TriPeaks feel more like a matching puzzle than a sorting game. The strategy is about finding the longest possible chain through the available cards — a very different skill from Klondike or FreeCell.",
        ],
      },
      {
        heading: "The One Rule That Surprises New Players",
        body: [
          "The sequence wraps at both ends: a King can play on a Queen or on an Ace, and an Ace can play on a King or on a 2. This means no card is a dead end in a chain — there\u2019s always a valid neighbor on both sides. Many beginners think a chain ends when it hits an Ace or King and are surprised to discover the wrap.",
          "The wrap rule frequently extends chains that appear to have ended. Always check whether a chain can continue past an Ace or King before drawing from the stock.",
        ],
      },
      {
        heading: "Three Starter Strategies",
        body: [
          "1. Look two or three steps ahead before taking any card. Don\u2019t just play the first valid card you see — trace out where that play leads. If taking a 7 now leads to an 8 then a 9 then a 10, that\u2019s better than taking a 7 that leads to a 6 and then nothing.",
          "2. Prioritize plays that uncover face-down cards. Upper-peak cards are face-down until their bottom neighbors are removed. Removing a card that flips a face-down card gives you more chain options, which is almost always worth a small chain sacrifice.",
          "3. Save the stock. Every stock draw resets your streak and costs a card you can\u2019t get back. When you\u2019re tempted to draw, pause and scan the layout once more — you may have missed a valid card in the bottom row.",
        ],
      },
      {
        heading: "What a Good vs Bad Score Looks Like",
        body: [
          "A beginner clearing the full layout with 10\u201312 stock draws and mostly 2\u20133 card chains will score around 50\u201380 points. An intermediate player clearing the same layout with 3\u20135 stock draws and one or two 8+ card chains will score 150\u2013200+ points. The scoring gap is almost entirely explained by chain length.",
          "Don\u2019t worry about your score in your first 10 games. Focus first on learning the wrap rule and on scanning two moves ahead. Points will follow naturally once chain-building becomes instinct.",
        ],
      },
    ],
  },

  {
    slug: "tripeaks-solitaire-advanced-planning",
    game: "tripeaks",
    title: "Advanced TriPeaks Planning: Reading the Board Before Move One",
    description:
      "Advanced TriPeaks strategy for experienced players — how to map potential chains across all three peaks, sequence unblocking moves, and plan 8\u201312 card chains before making the first play.",
    intro:
      "The gap between a good TriPeaks player and a great one comes down to pre-move board reading. Advanced players don\u2019t react to cards as they appear — they identify the best chain architecture before touching anything.",
    sections: [
      {
        heading: "Map the Bottom Row First",
        body: [
          "The bottom row (10 cards) is the only fully visible part of the layout at the start. Start there: identify all rank sequences in the bottom row. Look for groups of consecutive ranks — 4, 5, 6 in adjacent positions, or a 9-10-J-Q spread across the row. These are chain nuclei.",
          "For each chain nucleus, trace what happens when you use it: which card(s) above it would uncover? What ranks are those uncovered cards? Can the chain continue through them? This analysis — done mentally before move one — tells you which chain is worth building toward.",
        ],
      },
      {
        heading: "Unblocking Sequencing",
        body: [
          "Every upper-row card is unlocked by removing two specific lower-row cards. Before planning a chain, identify which bottom-row cards block the upper cards you\u2019ll need. If your best chain requires a specific upper card in the second row, make sure both its blocking lower cards appear in your chain plan before you reach the point where you need it.",
          "This is the hardest skill in TriPeaks: not just seeing chains but seeing the unblocking order within chains. A chain that naturally uncovers the cards it needs to continue is self-sustaining. A chain that uncovers cards it can\u2019t use is just accelerating toward a dead end.",
        ],
      },
      {
        heading: "When to Split a Chain Deliberately",
        body: [
          "Sometimes the optimal play is to deliberately break a chain — accept a streak reset via stock draw — to reset the waste card to a rank that opens a longer chain. This is justified when: your current chain has naturally ended (no valid adjacent ranks), and a specific stock card would extend a partially-uncovered chain that would otherwise be unreachable from the current waste top.",
          "Advanced players count the remaining stock cards and mentally track which ranks are still in the stock. If you know a 3 is in the stock and you have a 2 and 4 exposed in the layout, drawing toward that 3 is a calculated investment, not a random gamble.",
        ],
      },
      {
        heading: "Peak Priority",
        body: [
          "Not all three peaks are equally important to attack first. Prioritize the peak that is most \u2018connected\u2019 to your first planned chain — whose bottom cards appear earliest in your chain sequence. Clearing a peak fully (removing its top card) is only worth the effort if you can do it in-chain, adding points rather than drawing from stock to reach it.",
          "Leaving a peak partially cleared is fine. A peak with only its top card remaining is not a crisis — that top card is fully exposed and joins your available options whenever its rank fits the chain.",
        ],
      },
    ],
  },

  // ─── Mahjong (additional) ──────────────────────────────────────────────────

  {
    slug: "mahjong-solitaire-layouts-guide",
    game: "mahjong",
    title: "Mahjong Solitaire Layouts: Turtle, Dragon, Pyramid & More",
    description:
      "A guide to the most common Mahjong Solitaire layouts — the classic Turtle, the linear Dragon, the challenging Pyramid, and others — with tips on how layout shape affects difficulty and strategy.",
    intro:
      "Mahjong Solitaire can be played on dozens of different tile layouts. The layout doesn\u2019t just change the aesthetics — it fundamentally alters the strategic challenges, which tiles become bottlenecks, and how often the game is winnable.",
    sections: [
      {
        heading: "The Classic Turtle (Tortoise)",
        body: [
          "The Turtle is the most widely recognized Mahjong Solitaire layout, used in virtually every digital version of the game. It features a wide base of tiles in a roughly rectangular shape on the first layer, two narrower layers on top, a central horizontal spine running through multiple levels, and a single tile at the very top.",
          "The central spine is the defining challenge of the Turtle layout. Spine tiles are blocked on both sides by their neighbors in the same layer, making them accessible only after their neighbors have been removed. Experienced players direct early chains toward clearing the spine before working the edges.",
        ],
      },
      {
        heading: "The Dragon Layout",
        body: [
          "The Dragon layout arranges tiles in a long horizontal line with various branching shapes suggesting a dragon\u2019s body, tail, and head. It tends to be narrower and longer than the Turtle, with fewer stacked layers in most sections.",
          "Dragon layouts typically have more accessible tiles (more tiles free on both sides) than Turtle layouts, making the early game feel more open. The challenge is managing the head and tail regions, which often have a higher density of stacked tiles and fewer accessible free tiles.",
        ],
      },
      {
        heading: "Pyramid Layouts",
        body: [
          "Pyramid layouts stack tiles in a triangular formation — wide at the base, narrowing to a single tile at the top. Unlike the Turtle\u2019s horizontal sprawl, Pyramids have a strong vertical emphasis.",
          "Pyramid layouts are typically harder than Turtle layouts because the tiered structure means lower-row tiles block many upper-row tiles simultaneously. Clearing the base exposes the middle, which exposes the top — but the base often has many tiles blocked by the layer above them, creating an access paradox you must work through carefully.",
        ],
      },
      {
        heading: "How Layout Affects Strategy",
        body: [
          "Regardless of layout, the core principle holds: prioritize tiles that are blocking the most other tiles. In a Turtle, that\u2019s spine tiles. In a Dragon, that\u2019s the high-density head and tail. In a Pyramid, that\u2019s the uppermost accessible layer.",
          "Some layouts are genuinely more solvable than others for a given shuffle. Wider, flatter layouts with fewer stacking layers tend to have higher win rates because more tiles start in accessible (free) positions. Layouts with deep stacking or narrow access corridors are harder.",
        ],
      },
    ],
  },

  {
    slug: "mahjong-solitaire-tile-recognition",
    game: "mahjong",
    title: "How to Read Mahjong Tiles Quickly",
    description:
      "A visual guide to recognizing Mahjong Solitaire tile types at a glance — how to tell Bamboo from Characters, distinguish Wind tiles, and handle the special Flower and Season tiles that confuse new players.",
    intro:
      "Mahjong tile recognition is a skill that improves dramatically with practice. New players spend a lot of time squinting at tiles to figure out which suit they belong to. This guide will cut that learning curve significantly.",
    sections: [
      {
        heading: "The Three Suited Tiles",
        body: [
          "Circles (also called Dots or Wheels): Each tile shows a pattern of circular dots, from one dot (the 1-Circle) to nine dots (the 9-Circle). The 1-Circle often features a decorative design rather than a plain dot in stylized sets. Look for circular shapes arranged in a grid pattern.",
          "Bamboo (also called Sticks or Bams): Each tile shows bamboo stalks stacked vertically, from one stalk to nine stalks. The 1-Bamboo is a special case — it typically shows a bird (sometimes a peacock or crane) rather than a single bamboo stalk. If you see a bird tile with bamboo context, that\u2019s your 1-Bamboo.",
          "Characters (also called Wan or Man): Each tile shows a large Chinese numeral at the top with a smaller character (the character for \u201cten-thousand\u201d or \u201cman\u201d) at the bottom. You don\u2019t need to read Chinese to use these tiles — just count the number of distinct strokes in the top character, which correspond to 1 through 9.",
        ],
      },
      {
        heading: "The Honor Tiles",
        body: [
          "Winds (East, South, West, North): Four tiles, one for each cardinal direction, each showing the corresponding Chinese character. There are four identical copies of each wind — so four East tiles, four South tiles, and so on. Matching is straightforward: two East tiles match, two South tiles match, etc.",
          "Dragons (Red, Green, White): Three types, four copies each. The Red Dragon shows the Chinese character for \u2018center\u2019 in red. The Green Dragon shows the character for \u2018prosperity\u2019 in green. The White Dragon is typically a blank tile or shows an outlined rectangle — the \u2018nothing\u2019 dragon.",
        ],
      },
      {
        heading: "The Special Tiles: Flowers and Seasons",
        body: [
          "Flowers (four tiles, one copy each): Each flower tile has a unique design — typically labeled 1 through 4 with a floral image. Unlike other tiles, all four flower tiles match each other. You don\u2019t need to find a pair of identical flowers; any flower matches any other flower.",
          "Seasons (four tiles, one copy each): Similarly, each season tile has a unique design representing spring, summer, autumn, and winter. Any season tile matches any other season tile.",
          "Flowers and Seasons are easy to spot because they\u2019re typically more ornate or colorful than the suited and honor tiles. When you see two unusually decorative tiles, check whether they\u2019re both flowers or both seasons — if so, they match.",
        ],
      },
      {
        heading: "Speed Recognition Tips",
        body: [
          "For Circles: count dots. For Bamboo: count stalks (or spot the bird for 1-Bamboo). For Characters: look at the top numeral character. For Winds and Dragons: learn the four wind characters and three dragon appearances as a short vocabulary — you only need to recognize 7 distinct symbols.",
          "The Flower and Season tiles are the easiest to match once you know they work as a group. Prioritize matching them whenever they\u2019re both free — they\u2019re guaranteed pairs that never form blocking dependencies.",
        ],
      },
    ],
  },

  {
    slug: "mahjong-solitaire-common-mistakes",
    game: "mahjong",
    title: "Common Mahjong Solitaire Mistakes (and How to Fix Them)",
    description:
      "The most frequent errors in Mahjong Solitaire — matching pairs that create unbreakable blocks, ignoring layer depth, removing the last accessible copy of a tile — explained with practical fixes.",
    intro:
      "Mahjong Solitaire mistakes are easy to make and often invisible until several moves later when the board suddenly has no valid pairs. These are the patterns that end games prematurely.",
    sections: [
      {
        heading: "Matching the Last Two Accessible Tiles of a Set Too Early",
        body: [
          "Each non-special tile type has exactly four copies. If you\u2019ve already matched two of them and the remaining two are accessible, you might match them immediately. But if a third or fourth copy is buried deep in the layout, removing the two accessible ones leaves those buried copies permanently unmatched.",
          "Before matching any pair, check: are the other two copies of this tile buried or accessible? If buried, the pair you\u2019re looking at may be your only chance to match those tiles — which means leaving them until the buried copies are accessible, then matching all remaining copies in sequence.",
        ],
      },
      {
        heading: "Ignoring Tile Depth",
        body: [
          "Not all tiles are equally accessible. A tile on the top layer of the stack with nothing above it and an open side is free immediately. A tile in the middle of the base layer with two layers above it and tiles on both sides may not become free for 20 more matches.",
          "Players who ignore tile depth tend to match easy surface tiles and then find themselves stuck with only deeply buried tiles remaining — none of which are free because their neighbors haven\u2019t been cleared. The fix: periodically assess how many tiles are currently free, and aim to increase that number with each match rather than just taking the most obvious pair.",
        ],
      },
      {
        heading: "Not Using Hints or Shuffle Proactively Enough",
        body: [
          "Many players treat hints as an admission of defeat. But hints in Mahjong Solitaire are a navigation tool — they tell you which pairs are currently legal. On a dense board with 50+ tiles, it\u2019s easy to miss a pair that\u2019s tucked in a corner. Using hints to confirm you\u2019ve seen all options is efficient, not a weakness.",
          "Similarly, shuffle is available when no legal pairs exist. Some players try to avoid it out of pride. But in Mahjong, some shuffles are un-stuck-able — the tiles are arranged such that no sequence of matches can clear the board. Using shuffle is the correct response to a genuinely locked position.",
        ],
      },
      {
        heading: "Matching Flowers and Seasons Out of Turn",
        body: [
          "Flowers and seasons match any other flower or season, respectively. This makes them easy matches — any time two flowers or two seasons are free, they can be removed. But this also means they can be removed prematurely.",
          "If a flower tile is blocking two other important tiles, removing it for a quick flower match might be less valuable than waiting until those blocked tiles are the specific ones you need. Think of flowers and seasons as flexible resources — use them when the pairing serves a broader purpose, not just because the match is available.",
        ],
      },
    ],
  },

  // ─── General (additional) ──────────────────────────────────────────────────

  {
    slug: "which-solitaire-game-should-you-play",
    game: "general",
    title: "Which Solitaire Game Should You Play? A Beginner\u2019s Guide",
    description:
      "Not sure which solitaire game to start with? This guide matches different player types and preferences to the right game — whether you want quick sessions, deep strategy, all-skill play, or a meditative experience.",
    intro:
      "Six solitaire games live on this site, each with a distinct feel, difficulty level, and time commitment. This guide cuts through the choice paralysis with a direct recommendation for every player type.",
    sections: [
      {
        heading: "If You Want the Classic Experience",
        body: [
          "Play Klondike. It\u2019s the game that defined the word \u2018solitaire\u2019 for most people, the one that shipped with Windows, and the one with the most written strategy. Draw 1 is the right starting mode — approachable, quick to learn, genuinely winnable. Draw 3 becomes available once you want a harder challenge.",
          "Klondike sessions run 5\u201315 minutes. The win rate is satisfying without being trivial: you\u2019ll lose some unwinnable deals, but you\u2019ll win enough to feel skilled.",
        ],
      },
      {
        heading: "If You Want Pure Strategy With No Luck",
        body: [
          "Play FreeCell. All 52 cards are visible from the first move, and nearly every deal is winnable — meaning every loss is a strategy error, not a luck failure. FreeCell players who genuinely internalize this become very deliberate, very good, very quickly.",
          "FreeCell rewards patience and planning. Sessions run 10\u201320 minutes. It\u2019s the best game on the site for players who find luck-based outcomes frustrating.",
        ],
      },
      {
        heading: "If You Want a Bigger, Longer Challenge",
        body: [
          "Play Spider. Two decks, ten columns, and a suit-matching mechanic that creates complex strategic landscapes. Spider 1-suit is a good warm-up; Spider 2-suit is the sweet spot for most experienced players. Spider 4-suit is one of the hardest mainstream solitaire variants in existence.",
          "Spider sessions run 15\u201330 minutes. The game rewards the same careful planning as FreeCell but adds the complexity of hidden cards in the initial deal.",
        ],
      },
      {
        heading: "If You Want Quick, Casual Sessions",
        body: [
          "Play TriPeaks or Pyramid. Both play in under 5 minutes. TriPeaks has a satisfying chain/streak mechanic that makes every good run feel rewarding. Pyramid is a matching puzzle with a low win rate but quick hands — you\u2019ll play many games in the time Klondike takes one.",
          "Both are perfect for short breaks, commutes, or a few minutes between tasks.",
        ],
      },
      {
        heading: "If You Want Something Meditative and Different",
        body: [
          "Play Mahjong Solitaire. Matching pairs of tiles across a layered layout is visually distinctive and mentally calming. Sessions run 10\u201320 minutes. The tile recognition learning curve is a few games, and once you know the suits, the game has a gentle, exploratory quality none of the card games quite match.",
        ],
      },
    ],
  },

  {
    slug: "solitaire-mental-benefits",
    game: "general",
    title: "The Mental Benefits of Playing Solitaire",
    description:
      "Research and reasoning behind why solitaire is genuinely good for your brain — cognitive benefits, stress relief, pattern recognition, and why a short session might be better than scrolling.",
    intro:
      "Solitaire has a reputation as a way to pass time. The research suggests it\u2019s doing more than that — it engages attention, planning, and pattern recognition in ways that passive entertainment simply doesn\u2019t.",
    sections: [
      {
        heading: "Focused Attention Without Stress",
        body: [
          "Solitaire requires sustained, active attention — you must track card positions, evaluate options, and make decisions continuously. But the stakes are low and the pace is self-directed. This combination — focused engagement without performance anxiety — is what psychologists call a \u2018flow\u2019 state. Flow states are associated with reduced cortisol (the stress hormone) and improved mood.",
          "This is partly why solitaire has persisted as a workplace pastime for decades. A 5-minute Klondike game between tasks isn\u2019t pure procrastination — it\u2019s a structured mental break that re-engages attention without the passive over-stimulation of social media.",
        ],
      },
      {
        heading: "Planning and Working Memory",
        body: [
          "Games like FreeCell and Spider explicitly exercise working memory — the cognitive system responsible for holding and manipulating information in the short term. Planning several moves ahead requires holding a mental model of the board, tracking what changes with each step, and evaluating multiple paths simultaneously.",
          "Regular exercise of working memory is associated with improved general cognitive performance, better real-world planning ability, and slower age-related cognitive decline. This doesn\u2019t mean solitaire is a silver bullet — but it\u2019s a more cognitively demanding activity than most casual entertainment.",
        ],
      },
      {
        heading: "Pattern Recognition",
        body: [
          "All six solitaire games on this site require recognizing patterns: rank-color alternation in Klondike and FreeCell, in-suit sequences in Spider, rank pairs in Pyramid, rank adjacency in TriPeaks, tile matching in Mahjong. Repeated exposure to these patterns builds a low-level visual processing fluency that transfers to other contexts.",
          "Mahjong Solitaire is particularly notable here — distinguishing between 144 tiles across multiple suit types exercises visual discrimination in a meaningful way. Many players report that Mahjong tile recognition becomes nearly instantaneous after 20\u201330 games, which is a measurable improvement in a specific perceptual skill.",
        ],
      },
      {
        heading: "Emotional Regulation Through Loss",
        body: [
          "Solitaire is a controlled environment for experiencing and processing failure. Most Klondike games are lost. Most Pyramid games are lost. Learning to reset quickly — to view an unwinnable deal as external, not personal, and to start the next hand without frustration — builds emotional resilience in a low-stakes context.",
          "This sounds trivial, but it isn\u2019t. The ability to disengage from a failed endeavor quickly and reset cleanly is a genuinely useful skill. Solitaire gives you dozens of structured opportunities to practice it per session.",
        ],
      },
      {
        heading: "A Note on Balance",
        body: [
          "None of this is an argument for playing solitaire for hours at a stretch instead of working, sleeping, or engaging socially. The benefits are real but incremental, and they\u2019re maximized by short, regular sessions rather than marathon play. A 10-minute Klondike session during a break is beneficial. Three hours of TriPeaks instead of sleeping is not.",
        ],
      },
    ],
  },


  // ─── Golf ──────────────────────────────────────────────────────────────────

  {
    slug: "golf-solitaire-rules-and-scoring",
    game: "golf",
    title: "Golf Solitaire Rules & How to Score",
    description:
      "A complete guide to Golf Solitaire — how the tableau, stock, and waste pile work, how strokes are counted, and what separates a good round from a bad one.",
    intro:
      "Golf Solitaire earns its name from its scoring: each unplayed card at the end of a round counts as a stroke, and the goal is to finish with as few strokes as possible across multiple rounds — just like real golf. It's one of the fastest-playing solitaire variants and rewards sharp sequencing decisions under pressure.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "Thirty-five cards are dealt face-up into seven columns of five cards each, forming the tableau. The remaining seventeen cards become the stock. The top card of the stock is flipped to start the waste pile.",
          "All cards in the tableau are playable from the top of each column — there are no face-down cards, so the full state of the game is always visible.",
        ],
      },
      {
        heading: "How Play Works",
        body: [
          "You move cards from the tops of tableau columns onto the waste pile if they are exactly one rank higher or lower than the current top waste card, regardless of suit. Sequences can zigzag: 7–8–7–6–7–8 is perfectly legal. Aces and Kings do not wrap — a King cannot play onto an Ace, nor an Ace onto a King.",
          "When no tableau card can be played, you must deal a new card from the stock to the waste pile. If the stock runs out and no moves remain, the round ends.",
        ],
      },
      {
        heading: "Scoring",
        body: [
          "Every card still in the tableau at the end of a round adds one stroke to your score. Clear the entire tableau and you score a hole-in-one — any remaining stock cards subtract one stroke each from your running total, letting you go below zero for a round.",
          "Golf is typically played over nine rounds (deals). Your final score is the sum of all nine rounds. A scratch score is zero; elite players regularly finish negative across a full nine-round game.",
        ],
      },
      {
        heading: "What Makes a Deal Hard",
        body: [
          "Golf deals vary enormously in difficulty. A deal where the waste card values cluster — many 5s, 6s, and 7s near each other on the tableau — is generous because long sequential chains are easy to build. A deal where high and low cards are isolated with no neighbors creates dead ends that force stock draws and leave leftover cards.",
          "Win rate for Golf is roughly 40–60% depending on the specific variant and whether Kings are blocking or terminal. The visible-card nature of the game means every loss is at least partially foreseeable, which makes planning ahead the central skill.",
        ],
      },
    ],
  },

  {
    slug: "golf-solitaire-strategy",
    game: "golf",
    title: "Golf Solitaire Strategy: Clearing the Tableau Fast",
    description:
      "Key Golf Solitaire strategies — how to build long chains, when to draw from the stock, and how to protect yourself against dead-end columns.",
    intro:
      "Golf Solitaire looks like pure luck, but card-sequence awareness can meaningfully reduce your average stroke count. The entire tableau is face-up from the start, which means every move is an informed choice.",
    sections: [
      {
        heading: "Prioritize Long Chains Over Short Ones",
        body: [
          "Before making any move, scan the tableau for the longest sequential chain you can build from the current waste card. A chain of six moves is worth far more than two separate chains of three — not just because it clears more cards, but because it generates a new waste card position that may unlock further chains.",
          "Think of the waste pile top as a pivot value. Ask: 'If I play this card, what value does it leave me on?' Then look ahead to see whether that new value has good options. A move that leaves you at a value with four reachable tableau tops is better than a move that clears a card but leaves you stranded.",
        ],
      },
      {
        heading: "Preserve Stock Cards as Long as Possible",
        body: [
          "The stock is your emergency resource. Every time you draw from it, you lose the chance to use that card as a value pivot later. Exhaust all possible tableau moves before drawing. Even a single extra tableau move before each draw can improve your score by two to three strokes over a full nine-hole round.",
          "When you do have to draw, try to anticipate what new value you'll get if you know which cards remain in the stock — or at least be aware of the current waste top before drawing so you can plan which tableau tops to prioritize afterward.",
        ],
      },
      {
        heading: "Unblock Buried Columns Early",
        body: [
          "Columns with only one or two cards are easy to clear but not urgent. Columns with five cards that have their bottom cards entangled in critical sequences are the real problem. Identify which column tops can unlock the most cards beneath them and prioritize clearing those columns first.",
          "Specifically: look for columns where the top card bridges two separate chains. Playing it in one direction may close off the other. If you can reach the same chain pivot by another route, take that route first and preserve the bridging card.",
        ],
      },
      {
        heading: "King and Ace Management",
        body: [
          "Kings and Aces are dead ends — no card can be played onto a King going up, and no card can be played onto an Ace going down (unless the variant allows wrapping, which the standard rules do not). A King or Ace buried mid-column forces you to either clear it via a descending or ascending chain that reaches it exactly, or leave it stranded.",
          "When you see a King or Ace near the top of a long column, plan the chain specifically to land on it before moving past it. Landing on a King or Ace changes your waste pivot to an extreme value, which is often a blessing when the tableau has matching neighbors.",
        ],
      },
    ],
  },

  // ─── Forty Thieves ─────────────────────────────────────────────────────────

  {
    slug: "forty-thieves-solitaire-rules",
    game: "fortythieves",
    title: "Forty Thieves Solitaire Rules & Setup",
    description:
      "Everything you need to know to play Forty Thieves Solitaire — the two-deck setup, tableau rules, foundation building, and why this is one of the most challenging patience games.",
    intro:
      "Forty Thieves — also called Napoleon at St. Helena, Big Forty, or Roosevelt at San Juan — is one of the classic two-deck solitaire games. Its austere rules give you very little room to maneuver, making it far harder than Klondike despite looking deceptively similar.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "Two standard 52-card decks (104 cards total) are shuffled together. Forty cards are dealt face-up into ten tableau columns of four cards each — hence 'Forty Thieves.' All cards are face-up; there are no hidden cards. The remaining 64 cards form the stock.",
          "Eight foundation piles sit above the tableau, two per suit. Each foundation is built up from Ace to King in suit. The goal is to move all 104 cards onto the eight foundations.",
        ],
      },
      {
        heading: "Tableau and Stock Rules",
        body: [
          "Cards in the tableau are built in descending order and same suit — unlike Klondike's alternating-color rule. Only the top card of each column is playable; you cannot move sequences. This is the most restrictive rule in the game: you must move cards one at a time.",
          "Click the stock to deal one card at a time to a single waste pile. Only the top waste card is playable. The stock can only be dealt through once — there is no redeal. When the stock is empty and no moves remain, the game is over.",
        ],
      },
      {
        heading: "Why Forty Thieves Is So Hard",
        body: [
          "The combination of same-suit-only stacking, one-card-at-a-time movement, and a no-redeal stock makes Forty Thieves brutally difficult. Human win rates hover between 5% and 10%. The two-deck structure means duplicates exist, but they often block each other — two black Aces of Spades may both be buried deep with no way to reach them in order.",
          "Empty columns (created by clearing all four cards from a column) are the most valuable resource in the game. Each empty column allows temporary parking of a single card, enabling the one-at-a-time constraint to work around blockages. Protecting and timing the use of empty columns is the central skill.",
        ],
      },
      {
        heading: "Foundation Strategy",
        body: [
          "Unlike many solitaire games, you should generally move cards to the foundations as quickly as possible in Forty Thieves. Because you can only move one card at a time, keeping playable cards in the tableau doesn't create flexibility — it creates clutter. Get Aces to foundations immediately and push each suit upward whenever possible.",
          "The exception: don't move a card to a foundation if doing so blocks the only path to a card you need in the immediate next moves. Think one or two moves ahead before committing.",
        ],
      },
    ],
  },

  {
    slug: "forty-thieves-strategy-guide",
    game: "fortythieves",
    title: "Forty Thieves Strategy: Mastering a Near-Impossible Game",
    description:
      "Advanced Forty Thieves Solitaire strategy — how to manage empty columns, survive a no-redeal stock, and maximize your win rate in one of solitaire's hardest variants.",
    intro:
      "Forty Thieves has a win rate so low that even strong players expect to lose most games. The goal isn't mastery in the traditional sense — it's learning to recognize winnable deals quickly and squeezing every possible move out of them.",
    sections: [
      {
        heading: "Treat Empty Columns as Gold",
        body: [
          "An empty tableau column is the most powerful resource in Forty Thieves. It lets you temporarily park a card, which effectively gives you one extra 'hand' to reorganize a blocked area. Guard empty columns fiercely — only fill them when you have a specific plan for what the move unlocks.",
          "Creating an empty column early requires clearing an entire four-card column from the start. This is only possible if those four cards are either playable to foundations or can be stacked elsewhere. When you see such an opportunity in the opening layout, prioritize it above almost anything else.",
        ],
      },
      {
        heading: "Plan the Stock Draw",
        body: [
          "Because the stock cannot be redealt, every card drawn is a one-time resource. Before drawing, make sure you've exhausted every tableau move. After drawing, don't immediately play the waste card to the tableau unless doing so unlocks further moves — parking it in the tableau just to get it off the waste often blocks a column position you'll need later.",
          "If the waste card can go to a foundation, always do it. Foundations are permanent progress. If it can go to the tableau and reveal useful plays, do it. If it can only go to the tableau as dead weight, consider leaving it and drawing again — but remember the waste pile is only one card deep; drawing again buries the current card permanently.",
        ],
      },
      {
        heading: "Same-Suit Sequencing",
        body: [
          "The same-suit-only rule for tableau building is the game's most punishing constraint. To build a sequence, you need both the right rank and the right suit. With two decks, each suit has 26 cards, but they're interspersed — the card you need to continue a sequence may be at the bottom of another column.",
          "Prioritize building sequences in the suits whose Aces appeared early. Once an Ace is on a foundation, every subsequent card in that suit becomes a potential foundation move, reducing tableau clutter. Suits with buried Aces may need to be nearly abandoned until the Ace surfaces.",
        ],
      },
      {
        heading: "Recognizing a Lost Position",
        body: [
          "Forty Thieves positions collapse slowly and then all at once. Warning signs of a lost game: all empty columns filled, stock half-exhausted with no foundation progress beyond two suits, and multiple columns where the needed card is buried three or four deep beneath unsuitable cards. When you see this pattern, most experienced players restart rather than grind through a statistically hopeless endgame.",
        ],
      },
    ],
  },

  // ─── Yukon ─────────────────────────────────────────────────────────────────

  {
    slug: "yukon-solitaire-rules",
    game: "yukon",
    title: "Yukon Solitaire Rules Explained",
    description:
      "How to play Yukon Solitaire — the rules that make it unique from Klondike, including moving face-down cards and what that means for strategy.",
    intro:
      "Yukon Solitaire looks like Klondike at first glance, but its one key rule difference changes everything: you can move any face-up card and all cards on top of it as a group, regardless of whether they form a proper sequence. This single change transforms Yukon from a card game into a spatial puzzle.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "A standard 52-card deck is dealt into seven tableau columns. Column 1 has one card, column 2 has two cards, and so on. The twist: after the initial deal, all remaining cards (those beyond the first card in each column) are dealt face-up on top of the columns — five extra cards land on columns 2–6, four on column 7. There is no stock pile. All 52 cards are visible from the start.",
          "Four foundation piles sit above the tableau. Build each foundation up by suit from Ace to King.",
        ],
      },
      {
        heading: "The Core Rule: Moving Groups",
        body: [
          "In Yukon, any face-up card in the tableau can be moved, along with all cards resting on top of it, regardless of order or color. So a pile of randomly-ordered face-up cards can be picked up and placed on any tableau card that accepts the bottom card of the group (descending rank, alternating color).",
          "This rule means you can unbury needed cards without first dismantling what's above them — you just move the pile. The tradeoff is that you may create chaotic, hard-to-use piles in the process.",
        ],
      },
      {
        heading: "Face-Down Cards",
        body: [
          "The bottom card(s) of each column may be face-down from the initial deal. A face-down card is revealed and flipped face-up once all face-up cards on top of it have been moved away. The face-down cards are the hidden information in Yukon — and since there is no stock, uncovering them is the only way to gain new information during the game.",
          "Empty columns in Yukon can be filled by any King (or group starting with a King), just as in Klondike.",
        ],
      },
      {
        heading: "Foundations and Winning",
        body: [
          "Move Aces to foundations as they are uncovered and build each suit upward. You win when all 52 cards are on the foundations. Because there is no stock or waste pile, every card in the game is accessible — but accessibility doesn't mean reachability. Cards buried under incompatible piles may require many preparatory moves to free.",
        ],
      },
    ],
  },

  {
    slug: "yukon-solitaire-strategy",
    game: "yukon",
    title: "Yukon Solitaire Strategy: Using Free Moves to Win",
    description:
      "Yukon Solitaire strategy guide — how to use the free group-move rule to unbury key cards, manage empty columns, and navigate the no-stock constraint.",
    intro:
      "Yukon is significantly more winnable than Klondike — win rates around 85% are achievable with strong play — because all cards are visible and group moves are unconstrained. The challenge is spatial: reorganizing piles without creating chaos that blocks your own progress.",
    sections: [
      {
        heading: "Expose Face-Down Cards Systematically",
        body: [
          "With no stock to draw from, the only new cards you'll ever see are face-down cards in the tableau. Uncovering them is your top priority. Before any other plan, identify which columns have the most face-down cards and work to clear the face-up cards above them.",
          "Because you can move groups freely, uncovering face-down cards is often just one or two moves — but those moves may create disordered piles elsewhere. Accept that trade willingly: one new face-down card revealed is almost always worth a messy pile in another column.",
        ],
      },
      {
        heading: "Use Group Moves to Sort, Not Just Relocate",
        body: [
          "The temptation in Yukon is to move groups quickly to expose face-down cards, then deal with the mess later. This works up to a point, but messy piles eventually lock up the game. When moving a group, try to place it on a card that at least partially sorts the group — even if it's not perfect. A group that moves onto a card of the right color and rough rank is easier to work with than one dropped wherever fits.",
        ],
      },
      {
        heading: "Empty Column Management",
        body: [
          "Empty columns in Yukon are more powerful than in Klondike because you can move large groups in and out. Use an empty column as a temporary parking space to 'rotate' a pile: move the top portion to the empty column, access the card beneath, then combine them again elsewhere.",
          "Don't let empty columns stay filled with Kings that aren't going anywhere. A King with a well-sorted sequence beneath it is worth the column. A King with a mess on top of it that you can't sequence into the foundations is just blocking a valuable resource.",
        ],
      },
      {
        heading: "Foundation Timing",
        body: [
          "In Yukon, moving cards to foundations early is generally good because it reduces tableau clutter. However, a low card (2 or 3) that is sitting on top of a large useful group may be better left in place temporarily — the group is more valuable as a unit than the card is on a foundation. Once you've used the group to achieve something, then send the card up.",
        ],
      },
    ],
  },

  // ─── Scorpion ──────────────────────────────────────────────────────────────

  {
    slug: "scorpion-solitaire-rules",
    game: "scorpion",
    title: "Scorpion Solitaire Rules & Setup",
    description:
      "Learn how to play Scorpion Solitaire — the tableau layout, the free group-move rule, the three reserve cards, and why building in suit matters from move one.",
    intro:
      "Scorpion Solitaire is a challenging single-deck game that combines Yukon's free group-move rule with Spider's in-suit building goal. The result is a game where spatial reasoning and suit discipline are both essential — and where a single misplaced King can lock up the entire board.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "A standard 52-card deck is dealt into seven tableau columns. The first four columns receive seven cards each; the last three receive six cards each. In each column, the bottom three cards are face-down and the rest are face-up. Three cards are set aside as a reserve (stock).",
          "Unlike Klondike, there are no foundation piles at the start. You build foundations within the tableau itself by creating complete in-suit sequences from King down to Ace within a single column.",
        ],
      },
      {
        heading: "Moving Cards",
        body: [
          "Like Yukon, any face-up card can be moved along with all cards on top of it, as a group. The receiving card must be exactly one rank higher and the same suit as the card being moved. This in-suit restriction is what separates Scorpion from Yukon and makes it considerably harder.",
          "Empty columns can be filled with any King (and its attached cards). When you're stuck, deal the three reserve cards — one face-up card goes to each of the first three columns. Once the reserve is used it cannot be replenished.",
        ],
      },
      {
        heading: "Winning",
        body: [
          "You win by building four complete in-suit sequences — King through Ace — within the tableau columns. When a full sequence is formed, it is removed from play. The game ends when all four sequences are completed or no more moves are possible.",
        ],
      },
      {
        heading: "Key Difficulty",
        body: [
          "Scorpion is harder than it looks because the in-suit rule means you're essentially trying to sort a shuffled deck by suit while only being able to pick up cards of the right suit. Out-of-suit cards in a column are almost impossible to move unless they happen to sit on top of a card you need elsewhere. Face-down cards at the column bases are the biggest obstacle — clearing them requires sustained in-suit sequences to move above them.",
        ],
      },
    ],
  },

  {
    slug: "scorpion-solitaire-strategy",
    game: "scorpion",
    title: "Scorpion Strategy: Building In-Suit From the Start",
    description:
      "Scorpion Solitaire strategy — why in-suit discipline from move one is the key to winning, and how to manage the reserve cards and Kings for maximum effect.",
    intro:
      "Scorpion's win rate sits around 20–30% for careful players. The game punishes reactive play — moving whatever fits — and rewards a clear suit-by-suit roadmap established in the first dozen moves.",
    sections: [
      {
        heading: "Commit to Suits Early",
        body: [
          "The biggest mistake in Scorpion is making moves that mix suits on a column just to uncover face-down cards. A mixed-suit column may never be sorted and becomes dead weight. From the very first move, ask: 'Does this advance one of my four suits or does it just shuffle the mess?'",
          "Pick one or two suits to prioritize based on what's visible in the opening layout — usually the suits with the most face-up high cards visible — and funnel moves toward building those sequences first.",
        ],
      },
      {
        heading: "Kings Are Pivots, Not Goals",
        body: [
          "Kings are the start of each complete sequence, but placing a King in an empty column only helps if you can immediately begin building the correct suit's sequence on top of it. An empty column filled with a King that attracts off-suit cards is worse than leaving the column empty.",
          "The best use of an empty column is as a temporary parking space to free a face-down card or to extract a misplaced card from a column. Only fill it permanently with a King when you have a clear plan for building at least four or five of the right suit down from it.",
        ],
      },
      {
        heading: "Reserve Card Timing",
        body: [
          "The three reserve cards are dealt to the first three columns, which may disrupt half-built sequences. Use the reserve as a last resort when you're genuinely stuck — not just when progress slows. Before dealing, make sure you've exhausted every in-suit move available.",
          "If possible, clear the top cards from the first three columns before dealing the reserve, so they land on something manageable rather than burying progress.",
        ],
      },
      {
        heading: "Face-Down Cards Are the Game",
        body: [
          "Scorpion is ultimately about uncovering the 12 face-down cards at the bottoms of the first four columns. Every strategy decision should be evaluated in terms of how it advances toward revealing those cards. A move that uncovers a face-down card while maintaining suit discipline is almost always the right move, even if it looks slow.",
        ],
      },
    ],
  },

  // ─── Eight Off ─────────────────────────────────────────────────────────────

  {
    slug: "eight-off-solitaire-rules",
    game: "eightoff",
    title: "Eight Off Solitaire Rules & How It Differs from FreeCell",
    description:
      "A complete guide to Eight Off Solitaire — the setup, rules, and the key differences from FreeCell that make Eight Off both easier and harder depending on how you approach it.",
    intro:
      "Eight Off is FreeCell's older sibling — the game that FreeCell was directly based on. It looks nearly identical but plays differently in two important ways: columns are built by suit (not alternating color), and there are eight free cells instead of four. These changes create a very different strategic environment.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "A standard 52-card deck is dealt into eight tableau columns of six cards each (48 cards), with the remaining four cards placed one each in four of the eight free cells to start. All cards are face-up. Four foundation piles sit in the corners, built up by suit from Ace to King.",
        ],
      },
      {
        heading: "Movement Rules",
        body: [
          "Tableau columns are built in descending rank and same suit — a 7 of Hearts can only go on an 8 of Hearts. Only the top card of each column is movable (unlike Yukon or Scorpion's group moves). Any single card can be placed into one of the eight free cells for temporary storage. A card can move from a free cell to the tableau or directly to a foundation.",
          "Empty tableau columns act as additional free cells — any single card can fill them. Unlike FreeCell, there are no rules about moving groups; since only individual cards are movable, the question of 'supermoves' doesn't arise.",
        ],
      },
      {
        heading: "Eight Off vs. FreeCell",
        body: [
          "FreeCell uses alternating-color tableau building; Eight Off uses same-suit building. Same-suit is more restrictive — each card has only one valid destination in the tableau (rather than two in FreeCell). This makes tableau sequencing harder.",
          "However, Eight Off compensates with eight free cells versus FreeCell's four. More free cells mean more temporary storage, which gives you more flexibility to rearrange without being trapped. The net result is that Eight Off has a slightly higher practical win rate than FreeCell (roughly 99% of deals are theoretically solvable for both, but Eight Off is more forgiving of suboptimal play).",
        ],
      },
      {
        heading: "Foundation Strategy",
        body: [
          "Because same-suit building means tableau sequences are naturally aligned with foundations, moving cards to foundations in Eight Off is generally more fluid than in FreeCell. When a card can go to a foundation, it usually should — it frees the free cell or tableau slot and advances the game.",
        ],
      },
    ],
  },

  {
    slug: "eight-off-solitaire-strategy",
    game: "eightoff",
    title: "Eight Off Solitaire Strategy: Making the Most of Eight Free Cells",
    description:
      "How to use Eight Off's eight free cells and same-suit building rule to your advantage — sequencing strategy, free-cell conservation, and how to avoid the common trap of filling all eight cells.",
    intro:
      "Eight Off is more forgiving than FreeCell, but players who treat the eight free cells as an unlimited buffer quickly find themselves with all cells occupied and no moves left. Disciplined cell use is the game's central challenge.",
    sections: [
      {
        heading: "Don't Fill All Eight Cells",
        body: [
          "Eight free cells sound like an enormous luxury, but filling all eight at once is a losing position in almost every case. With all cells occupied and a blocked tableau, the only moves left are foundations — and if foundations aren't available, the game is over.",
          "Treat free cells the way a chess player treats tempo: use them to enable one or two key moves, then empty them as soon as possible. Aim to keep at least three cells free at any point in the middle game.",
        ],
      },
      {
        heading: "Same-Suit Sequencing",
        body: [
          "Because tableau moves require same-suit, you're essentially building four separate same-suit ladders across eight columns. Think of the game as four parallel sorting problems. For each suit, identify the highest face-up card and work backward — what needs to move for the next card in that suit's sequence to become accessible?",
          "Off-suit cards blocking a suit's column are the main obstacle. Use free cells to temporarily park them, rearrange the column, then return them. This 'park-and-return' pattern is the core tactical loop of Eight Off.",
        ],
      },
      {
        heading: "Empty Columns as Wild Free Cells",
        body: [
          "An empty tableau column effectively acts as a ninth free cell — any single card can sit there temporarily. Creating empty columns early is therefore very valuable. When a column has only one or two cards left, prioritize clearing it completely rather than building on the remaining cards.",
        ],
      },
      {
        heading: "Foundations Over Tableau",
        body: [
          "Every card moved to a foundation is permanently out of the way. In same-suit building, foundation-ready cards are naturally at the tops of sorted sequences, so moving them up is usually low-cost. Make foundation moves aggressively — they reduce clutter and simplify the sorting problem.",
        ],
      },
    ],
  },

  // ─── Canfield ──────────────────────────────────────────────────────────────

  {
    slug: "canfield-solitaire-rules-and-history",
    game: "canfield",
    title: "Canfield Solitaire Rules & History",
    description:
      "The rules of Canfield Solitaire — including its unusual random starting foundation, reserve pile, and stock rotation — plus the casino origins that gave the game its name.",
    intro:
      "Canfield is named after Richard A. Canfield, an American casino owner who sold the game to customers in the 1890s: you paid $52 for a deck, earned $5 per card played to the foundations, and averaged a loss of around $25 per session. The clever mechanism that drives both the game's appeal and its difficulty is its random starting foundation rank.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "Thirteen cards are dealt face-down into a reserve pile; the top card is turned face-up. Four tableau columns each receive one face-up card. One card is turned face-up to begin the first foundation — and critically, the rank of that card determines the base rank for all four foundations. If a 7 starts a foundation, all four foundations must begin with 7s.",
          "The remaining cards form the stock. Foundations are built up by suit in a wrapping sequence — after King comes Ace, then 2, and so on until the foundation base rank minus one.",
        ],
      },
      {
        heading: "Tableau and Reserve Rules",
        body: [
          "The tableau is built in descending rank and alternating color, just like Klondike. Only the top card of each column is movable individually. The top card of the reserve is always available to play. Empty tableau columns are automatically filled from the reserve (not from your hand — you have no choice).",
          "Stock cards are dealt three at a time to a waste pile (Draw 3). The waste cycles infinitely until no moves remain anywhere.",
        ],
      },
      {
        heading: "What Makes Canfield Hard",
        body: [
          "The wrapping foundation is disorienting at first — you must mentally track which ranks have been played and which wrap around zero. The automatic refill of empty columns from the reserve removes one of the most powerful tools in solitaire (the intentional empty column), because you can never voluntarily leave a column empty. Win rates for Canfield are among the lowest of any solitaire variant: roughly 3–5% of deals produce a full clear.",
        ],
      },
      {
        heading: "Scoring and Casino Mode",
        body: [
          "In casino scoring, you pay 52 units and earn 5 per foundation card. A perfect game returns 208 units for a net profit of 156. In practice, the expected return is strongly negative — historically around −$27 per game in Canfield's original casino, which is why it was so profitable for the house.",
        ],
      },
    ],
  },

  {
    slug: "how-to-win-canfield-solitaire",
    game: "canfield",
    title: "How to Win at Canfield Solitaire (and Why Most Games End Early)",
    description:
      "Canfield Solitaire strategy — working with the reserve pile, using waste cycling, and recognizing the deal conditions that give you a realistic chance of winning.",
    intro:
      "Canfield is one of solitaire's hardest variants, with a full-clear win rate under 5%. Playing it well is less about achieving perfection and more about maximizing cards played before the game locks — and recognizing the rare deal that's actually clearable.",
    sections: [
      {
        heading: "Manage the Reserve as Your Primary Resource",
        body: [
          "The reserve's top card is always available. Before drawing from the stock, check whether the reserve top card can play to the tableau or foundations. Reserve cards are precious because empty columns refill from the reserve automatically — the faster you clear the reserve, the sooner you'll have real empty-column flexibility.",
          "Aim to play reserve cards to foundations whenever possible, even if tableau moves are also available. Every reserve card on a foundation removes it from the mandatory refill rotation.",
        ],
      },
      {
        heading: "Foundation Rank Awareness",
        body: [
          "The wrapping foundation is the most cognitively demanding part of Canfield. Before moving a card, confirm its suit-sequence position relative to the base rank. A simple mental model: count up from the base rank, and if you pass King, wrap to Ace. If the base is 8, the sequence is 8–9–10–J–Q–K–A–2–3–4–5–6–7.",
          "Focus on getting all four base-rank cards to foundations first. Until all four foundations are started, you can't build any suit further, and the tableau quickly becomes a storage problem.",
        ],
      },
      {
        heading: "Stock Cycling",
        body: [
          "The stock cycles infinitely, which sounds generous but is misleading — the same three-card grouping rotates every time, so a card that isn't reachable this pass isn't reachable next pass either unless something else changes first. Make a tableau or foundation move between stock cycles whenever possible to shift the cycling order.",
        ],
      },
      {
        heading: "Recognizing a Good Deal",
        body: [
          "A good Canfield deal has the base rank's cards distributed across different columns and not buried deep in the reserve. If two or three base-rank cards are visible immediately, the game is likely playable. If all three remaining base-rank cards are deep in the reserve, winning is nearly impossible regardless of play quality.",
        ],
      },
    ],
  },

  // ─── Addiction ─────────────────────────────────────────────────────────────

  {
    slug: "addiction-solitaire-rules",
    game: "addiction",
    title: "Addiction Solitaire Rules Explained",
    description:
      "How Addiction Solitaire works — the four-row grid, moving cards next to matching suits, what the empty spaces do, and how reshuffles work.",
    intro:
      "Addiction Solitaire is unlike any other solitaire game. There are no foundations, no stock, and no tableau sequences. Instead, a 4×13 grid of cards must be sorted into four complete suit rows — purely by sliding cards into empty spaces. It's part solitaire, part sliding puzzle, and wholly addictive.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "A standard 52-card deck is dealt face-up into a 4×13 grid. The four Aces are then removed, creating four empty spaces. Each row should ultimately contain one complete suit from 2 through King, with the 2 at the far left of the row.",
        ],
      },
      {
        heading: "How Moves Work",
        body: [
          "A card can move into an empty space if the card immediately to the left of that space is the same suit and one rank lower. So a space to the right of the 6♠ can only receive the 7♠. If a space is at the far left of a row (no card to its left), only a 2 of any suit can move there — the row must start with a 2.",
          "Kings can never move — a space to the right of a King is permanently blocked. This is why Kings are considered the hardest obstacle in the game.",
        ],
      },
      {
        heading: "Reshuffles",
        body: [
          "When no legal moves remain, you can reshuffle. All cards that are not correctly sequenced (i.e., not in the right position in a correct suit run starting from a 2) are gathered and reshuffled randomly back into the empty positions. The correctly-placed cards stay where they are. You typically get three reshuffles per game.",
          "Win rate for Addiction with optimal play and three reshuffles is roughly 30–45%. The game's difficulty is highly variable depending on how reshuffles distribute problem cards.",
        ],
      },
      {
        heading: "Winning",
        body: [
          "You win when all four rows each contain a complete in-suit run from 2 to King. The order of rows (which suit is on which row) doesn't matter — only the internal ordering within each row counts.",
        ],
      },
    ],
  },

  {
    slug: "addiction-solitaire-strategy",
    game: "addiction",
    title: "Addiction Solitaire Strategy: Managing Reshuffles",
    description:
      "Addiction Solitaire strategy — how to sequence moves to lock in as many cards as possible before reshuffling, how to handle Kings, and how to read the board for optimal play.",
    intro:
      "Addiction rewards systematic play. Because moves are constrained — a card goes left of exactly the card one rank above it, same suit — there's rarely ambiguity about the best move. The real skill is sequencing moves to lock in runs and avoid King-block situations before reshuffles.",
    sections: [
      {
        heading: "Build Complete Runs Before Moving On",
        body: [
          "Each correctly-placed card is safe across reshuffles. Your goal in each phase of play is to lock in as many consecutive cards as possible before you run out of moves. Don't move a 4 into position unless you can also immediately position the 5 and 6 behind it — partial runs can get broken up in a reshuffle if the rest of the row isn't set.",
          "Start with whichever suit has its 2 most accessible and build that row as far as possible. Then repeat for the other suits.",
        ],
      },
      {
        heading: "King Awareness",
        body: [
          "Kings permanently block the space to their right. If a King appears in the middle or left of a row early in the game, it will likely eat up a space and force incomplete rows. Before placing a 2 in a row, check whether a King is positioned downstream — if so, that suit's row will eventually be blocked, and you may want to prioritize a different suit.",
          "Cards to the left of a King can still be sequenced up to the King, which is partial progress. A row that ends ...J–Q–K with three spaces beyond the King is essentially dead beyond Q.",
        ],
      },
      {
        heading: "Choosing Which Cards to Move",
        body: [
          "When multiple moves are available, prefer moves that: (1) continue or extend an existing correct sequence, (2) open up a space that unblocks another sequence, or (3) place a 2 into an open left-edge space. Avoid moves that deposit a card in a position it will need to leave in the near future — remember, once a card is placed, only a reshuffle or another empty-space move can displace it.",
        ],
      },
      {
        heading: "Reshuffle Timing",
        body: [
          "Don't trigger a reshuffle the moment you run out of moves. Make sure every possible move has been made first — sometimes a chain of moves unlocks that isn't obvious until you've moved two or three pieces. Reshuffles are limited, and each one may undo progress if the cards you've locked in are few. Aim to have at least 8–10 cards correctly locked before triggering a reshuffle.",
        ],
      },
    ],
  },

  // ─── Baker's Dozen ─────────────────────────────────────────────────────────

  {
    slug: "bakers-dozen-solitaire-rules",
    game: "bakersdozen",
    title: "Baker's Dozen Solitaire Rules & Setup",
    description:
      "How Baker's Dozen Solitaire works — the 13-column layout, the Kings-to-bottom rule, single-card moves, and why this fully visible game is still challenging.",
    intro:
      "Baker's Dozen is an unusually transparent solitaire variant: all 52 cards are dealt face-up at the start, and there is no stock or waste pile. Every card is visible, every move is knowable in advance — and yet the game is difficult because the one-card-at-a-time constraint and same-suit building create formidable organization problems.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "A 52-card deck is dealt face-up into 13 tableau columns of four cards each. Before play begins, any Kings are moved to the bottom of their column automatically — Kings cannot sit on top of other cards at the start. Four foundation piles are built up by suit from Ace to King.",
        ],
      },
      {
        heading: "Movement Rules",
        body: [
          "Only the top card of each column is movable, and only one card at a time. A card can move to a tableau column if it is exactly one rank lower than the current top card of that column — but there is no color or suit restriction for tableau building. Any 6 can sit on any 7.",
          "Any card can move to an empty column. Cards move to foundations in the usual ascending-by-suit order.",
        ],
      },
      {
        heading: "Why Baker's Dozen Is Hard",
        body: [
          "With no suit restriction for tableau moves, Baker's Dozen sounds easy. The difficulty is entirely about Kings. Kings can only be moved to empty columns — they cannot be placed on any tableau card because no rank is higher than King. A King in the middle of a column can only be freed by clearing all cards above it, and once freed, it needs an empty column to go to.",
          "Win rates are approximately 70–80% with good play. Most lost games come down to two or three Kings blocking critical paths with no empty columns available.",
        ],
      },
      {
        heading: "Foundation Strategy",
        body: [
          "With all cards visible, Baker's Dozen is almost a pure planning exercise. Before making your first move, scan for Aces and their paths to foundations. Cards that block Aces are the first priority. Work systematically by suit — clear one suit's path to foundation before cluttering other columns.",
        ],
      },
    ],
  },

  {
    slug: "bakers-dozen-strategy-guide",
    game: "bakersdozen",
    title: "Baker's Dozen Strategy: Planning Every Move in a Fully Visible Game",
    description:
      "Baker's Dozen Solitaire strategy — how to plan ahead in a fully visible game, manage Kings without empty columns, and find the move order that clears the most foundations.",
    intro:
      "Baker's Dozen is one of the most 'pure' solitaire puzzles: no luck after the deal, all information visible, single-card moves. The game is entirely about finding the correct sequence of moves, which makes it closer to a logic puzzle than a card game.",
    sections: [
      {
        heading: "Read the Board Before Moving",
        body: [
          "Because all 52 cards are visible, there's no reason to make an uninformed move. Before touching a card, trace the path for each Ace to its foundation and note which cards are blocking each path. The game is essentially asking: what is the optimal order to free these paths?",
          "A useful first scan: identify the four Aces and count how many cards are above each one. The Ace with the fewest blockers is your first priority. Then trace: what must move for each blocker to move?",
        ],
      },
      {
        heading: "King Management",
        body: [
          "Kings are immovable obstacles until an empty column appears. Proactively identify Kings that are buried mid-column and assess how many moves it would take to free them. If freeing a King requires emptying an entire column, ask whether you need that empty column for the King or for something more urgent.",
          "When you do create an empty column, decide immediately what you're using it for before placing anything there — empty columns are rare and should never be filled without a specific plan.",
        ],
      },
      {
        heading: "Rank-Only Sequencing Traps",
        body: [
          "Since tableau building ignores suit, you might place a 6♣ on a 7♦ only to need that 7♦ for a 8♥–7♦–6♦ foundation sequence later. The lack of suit restriction is deceptive — it gives you more legal moves but can create situations where a card is in the right rank position but the wrong suit context.",
          "When building tableau sequences, loosely prefer to keep same-suit cards together anyway. It's not required, but it reduces the chance of creating suit conflicts that are hard to untangle.",
        ],
      },
      {
        heading: "When to Create Empty Columns",
        body: [
          "An empty column in Baker's Dozen is only useful for housing a single card. Create one specifically when: (1) you need to park a King, (2) you need to temporarily extract a card from the middle of a sequence, or (3) you're two moves away from clearing a foundation Ace and one card is in the way. Don't create empty columns just to have flexibility — King management is the only legitimate reason to fight for one.",
        ],
      },
    ],
  },

  // ─── Baker's Game ──────────────────────────────────────────────────────────

  {
    slug: "bakers-game-rules",
    game: "bakersgame",
    title: "Baker's Game Rules: FreeCell's Harder Older Cousin",
    description:
      "How Baker's Game differs from FreeCell, the same-suit building rule that makes it significantly harder, and the complete rules for play.",
    intro:
      "Baker's Game is the direct ancestor of FreeCell. It is played identically, except that tableau columns are built by same suit rather than alternating color. That one word — 'same' instead of 'alternating' — roughly doubles the difficulty and produces a game that rewards deep planning over intuition.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "A standard 52-card deck is dealt face-up into eight tableau columns. Columns 1–4 receive seven cards; columns 5–8 receive six cards. Four free cells sit above the tableau, each holding at most one card. Four foundation piles are built up by suit from Ace to King.",
        ],
      },
      {
        heading: "Movement Rules",
        body: [
          "Only the top card of each tableau column is movable. A card moves to the tableau if it is one rank lower and the same suit as the column's top card. Any card can be placed in an empty free cell. Any card can be placed in an empty column.",
          "As in FreeCell, 'supermoves' — moving a group of sequenced cards — are technically a shorthand for a series of individual card moves via free cells and empty columns. The number of cards in a group you can effectively move equals (free cells + 1) × 2^(empty columns).",
        ],
      },
      {
        heading: "Baker's Game vs. FreeCell",
        body: [
          "FreeCell's alternating-color rule means each card has two possible tableau destinations (e.g., a 7 can go on either a black 8 or a red 8). Baker's Game's same-suit rule means each card has at most one tableau destination (a 7♥ can only go on the 8♥). This restriction dramatically reduces your options and means many deals require precise, non-obvious move sequences to solve.",
          "Approximately 75–80% of Baker's Game deals are solvable (versus over 99% for FreeCell). Unsolvable deals are more common and less obvious — you may play a significant portion of the game before realizing the position is lost.",
        ],
      },
      {
        heading: "Foundation Approach",
        body: [
          "Because same-suit tableau building aligns with foundation-building, partially-built tableau sequences are essentially partial foundations. Moving cards to actual foundation piles frees space and simplifies the game. Be aggressive about foundation moves whenever a card is ready.",
        ],
      },
    ],
  },

  {
    slug: "bakers-game-strategy",
    game: "bakersgame",
    title: "Baker's Game Strategy: In-Suit Building and Free Cell Discipline",
    description:
      "Strategy guide for Baker's Game — how to build same-suit sequences, use free cells sparingly, and navigate a game that punishes FreeCell habits.",
    intro:
      "Players coming to Baker's Game from FreeCell often find their intuitions backfire. The same-suit restriction means many standard FreeCell patterns don't apply, and free cells that felt abundant in FreeCell become precious in Baker's Game.",
    sections: [
      {
        heading: "Think in Suits, Not Colors",
        body: [
          "The core mental shift from FreeCell: instead of thinking 'I need a black 7', think 'I need the 7 of Hearts' (or whichever suit). Each card has exactly one legal destination in the tableau. Before any move, ask whether that destination exists and whether the destination card is reachable.",
          "This makes Baker's Game more like solving four simultaneous same-suit sorting puzzles. Mentally track each suit's current state: what's on its foundation, what's accessible in the tableau, and what's buried.",
        ],
      },
      {
        heading: "Free Cells Are Scarce",
        body: [
          "With only four free cells and same-suit restrictions limiting tableau placements, free cells fill up fast. The 'park one, move one' pattern that works in FreeCell often leads to all four cells occupied in Baker's Game before you've made meaningful progress.",
          "Apply a stricter rule: only place a card in a free cell if you know specifically how it returns to the tableau within the next three to four moves. Avoid using free cells as general-purpose parking — use them as part of explicit, planned sequences.",
        ],
      },
      {
        heading: "Empty Columns as Move Multipliers",
        body: [
          "Empty columns are more valuable in Baker's Game than in FreeCell because they compensate for the tighter same-suit restriction. Each empty column effectively doubles your ability to move sequences. Work to create empty columns early by focusing on short columns and funneling their cards toward foundations.",
        ],
      },
      {
        heading: "Recognizing Unsolvable Positions",
        body: [
          "Baker's Game has a meaningfully higher rate of unsolvable deals than FreeCell. Signs of an unsolvable position: two or more suits with their foundation-needed cards both buried beneath cards of the same suit with no free cells available. If you see this pattern early, restarting may be more productive than prolonged struggle with a deal the solver can't break.",
        ],
      },
    ],
  },

  // ─── Clock ─────────────────────────────────────────────────────────────────

  {
    slug: "clock-solitaire-rules-and-odds",
    game: "clock",
    title: "Clock Solitaire Rules & Odds of Winning",
    description:
      "The complete rules of Clock Solitaire — how to set up the clock face, how cards are moved, and the exact mathematical probability of winning this purely luck-based game.",
    intro:
      "Clock Solitaire is the only major solitaire variant with no decisions whatsoever. Every move is forced, the outcome depends entirely on the initial shuffle, and the exact probability of winning is mathematically known. It is pure solitaire in the literal sense — you play alone, against nothing but the deck.",
    sections: [
      {
        heading: "The Setup",
        body: [
          "Fifty-two cards are dealt face-down into 13 piles arranged like a clock face: 12 piles of four cards in a circle (representing 1 through Queen) and one pile of four cards in the center (representing King). The position of each pile corresponds to its rank — the 1 o'clock pile is Aces, the 2 o'clock pile is 2s, and so on, with Kings in the center.",
        ],
      },
      {
        heading: "How to Play",
        body: [
          "Turn over the top card of the King pile (center). Slide it face-up under the pile at its corresponding clock position — a 7 goes face-up under the 7 o'clock pile. Then turn over the top card of that pile and repeat. If a card arrives at the pile of its matching rank and turns up all four cards there, the pile is 'complete' and you move to the top of whatever pile you came from next.",
          "Every move is automatic — you never make a choice. Just follow the card to its clock position, place it, and flip the next card.",
        ],
      },
      {
        heading: "Winning and Losing",
        body: [
          "You win if all 52 cards end up face-up in their correct piles before the fourth King is turned face-up. The fourth King is what ends the game — the moment it's revealed, play stops. If any card in any pile remains face-down, you lose.",
          "The game is won when all 12 numbered piles complete before the fourth King surfaces. This requires the fourth King to be the very last card turned — i.e., the bottom card of the King pile at the center of the clock.",
        ],
      },
      {
        heading: "The Exact Probability",
        body: [
          "The probability of winning Clock Solitaire is exactly 1 in 13 — approximately 7.7%. This is a mathematically proven result, not an estimate. Since there are no choices to make, the win probability cannot be improved by any strategy. You win precisely when the fourth King happens to be the last card in the deck under the shuffle.",
          "Clock is best understood as a ritual rather than a game: it's satisfying to play through, interesting to observe, and a clean illustration of how dramatically win rates vary across solitaire variants. Its complete lack of agency makes it a useful baseline for appreciating the skill components in every other variant.",
        ],
      },
    ],
  },

  {
    slug: "clock-solitaire-guide",
    game: "clock",
    title: "Clock Solitaire: The One Solitaire Game With No Strategy",
    description:
      "An exploration of Clock Solitaire — why it has no strategy, what makes it compelling despite that, and how it compares to every other solitaire variant in terms of player agency.",
    intro:
      "Clock Solitaire is worth understanding precisely because it eliminates the variable that defines every other solitaire: player skill. With no choices to make, Clock isolates the luck component of card games and makes it visible. Playing Clock is a reminder of how much agency other solitaire variants actually give you.",
    sections: [
      {
        heading: "Why There Is No Strategy",
        body: [
          "Every move in Clock is entirely determined by the face-up card you just placed. There is no point at which you choose which card to move, where to move it, or whether to move it. The game plays itself — you are the mechanism, not the player.",
          "This is unusual among solitaire variants. Even Canfield, which has a very low win rate, gives players dozens of meaningful decisions per game. Clock gives you zero. The outcome is fixed the moment the deck is shuffled.",
        ],
      },
      {
        heading: "What Clock Is Good For",
        body: [
          "Clock is excellent for younger players learning about card values and the structure of a deck — the clock face reinforces rank from Ace through King, and the mechanical gameplay keeps attention without overwhelming decision-making.",
          "For experienced solitaire players, Clock is a palette cleanser and a probability demonstration. After a frustrating run of lost Canfield or Forty Thieves games, a few rounds of Clock reminds you that some solitaire losses really are entirely the deck's fault.",
        ],
      },
      {
        heading: "Comparing Agency Across Solitaire Variants",
        body: [
          "At one extreme is Clock: 0% player agency, 7.7% win rate, all luck. At the other extreme is FreeCell: over 99% of deals are solvable, and a knowledgeable player can win almost every game — the limiting factor is player skill, not luck.",
          "Most variants fall between these poles. Klondike Draw 1 is roughly 43% with good human play versus 82% theoretical maximum — so roughly half the 'lost' games are skill deficits. Forty Thieves is so hard that even optimal play only wins 5–10% of games. Understanding where a game falls on the luck-skill spectrum helps set appropriate expectations for win rates.",
        ],
      },
      {
        heading: "Variants That Add Decisions",
        body: [
          "Some Clock variants add a small strategic element: instead of always going to the center King pile at the start, you may choose which pile to start from. This introduces one decision point per game, marginally improving win probability for informed choices. The improvement is modest — Clock's core mechanism is deterministic regardless — but it transforms the game from purely mechanical to 'almost a game.'",
        ],
      },
    ],
  },

];

export const GUIDE_GAMES: { tag: GameTag; label: string; emoji: string; path: string }[] = [
  { tag: "klondike",     label: "Klondike",      emoji: "🃏", path: "/klondike"      },
  { tag: "spider",       label: "Spider",        emoji: "🕷️", path: "/spider"        },
  { tag: "freecell",     label: "FreeCell",      emoji: "🔲", path: "/freecell"      },
  { tag: "pyramid",      label: "Pyramid",       emoji: "🔺", path: "/pyramid"       },
  { tag: "tripeaks",     label: "TriPeaks",      emoji: "⛰️", path: "/tripeaks"      },
  { tag: "mahjong",      label: "Mahjong",       emoji: "🀄", path: "/mahjong"       },
  { tag: "golf",         label: "Golf",          emoji: "⛳", path: "/golf"          },
  { tag: "fortythieves", label: "Forty Thieves", emoji: "🎴", path: "/forty-thieves" },
  { tag: "yukon",        label: "Yukon",         emoji: "🏔️", path: "/yukon"         },
  { tag: "scorpion",     label: "Scorpion",      emoji: "🦂", path: "/scorpion"      },
  { tag: "eightoff",     label: "Eight Off",     emoji: "8️⃣", path: "/eight-off"     },
  { tag: "canfield",     label: "Canfield",      emoji: "🎰", path: "/canfield"      },
  { tag: "addiction",    label: "Addiction",     emoji: "🧩", path: "/addiction"     },
  { tag: "bakersdozen",  label: "Baker's Dozen", emoji: "🍞", path: "/bakers-dozen"  },
  { tag: "bakersgame",   label: "Baker's Game",  emoji: "♠️", path: "/bakers-game"   },
  { tag: "clock",        label: "Clock",         emoji: "🕐", path: "/clock"         },
  { tag: "general",      label: "All Games",     emoji: "🎲", path: "/klondike"      },
];
