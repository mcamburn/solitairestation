import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Solitaire Station — Free Online Solitaire Games" },
      { name: "description", content: "About Solitaire Station — 16 free online solitaire games including Klondike, Spider, FreeCell, Pyramid, TriPeaks, Mahjong, Golf, Forty Thieves, Yukon, and more. No download, no sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "About Solitaire Station — Free Online Solitaire Games" },
      { property: "og:description", content: "Solitaire Station offers 16 free online solitaire games — Klondike, Spider, FreeCell, Pyramid, TriPeaks, Mahjong, Golf, Forty Thieves, Yukon, and more. No download, no sign-up." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
      { property: "og:image", content: `${SITE_URL}/og/klondike.png?v=6` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/og/klondike.png?v=6` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/about` },
    ],
  }),
});

function AboutPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[760px] px-4 py-10 sm:py-16">
      <Link
        to="/"
        className="text-xs uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
      >
        ← Back to game
      </Link>

      <h1
        className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        About Solitaire Station
      </h1>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Free online solitaire — sixteen games, zero friction
      </p>

      <div className="mt-8 space-y-10 text-sm leading-relaxed text-muted-foreground">

        <section>
          <h2 className="mb-3 text-base font-bold tracking-tight text-foreground">
            What is Solitaire Station?
          </h2>
          <p>
            Solitaire Station is a free online solitaire platform built for players who want a
            beautiful, distraction-free card game experience right in their browser. There is
            nothing to download, nothing to install, and no account required — just open the
            site and start playing instantly on any device.
          </p>
          <p className="mt-3">
            We offer sixteen of the most popular solitaire variants in a single, unified app.
            Every game shares the same polished neon aesthetic, consistent controls, and a
            full suite of quality-of-life features: undo, auto-save, move history, hints,
            and a timer — so you can focus on the cards.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold tracking-tight text-foreground">
            The sixteen games
          </h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-foreground">🃏 Klondike Solitaire</h3>
              <p className="mt-1">
                The game most people simply call "solitaire." Klondike Solitaire is the
                definitive free online solitaire experience — 52 cards, seven tableau
                columns, and the timeless goal of building four foundation piles from Ace
                to King. Choose Draw 1 for a relaxed game or Draw 3 for a stiffer
                challenge. Your progress is saved automatically so you can pick up exactly
                where you left off.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🕷️ Free Spider Solitaire</h3>
              <p className="mt-1">
                Free Spider Solitaire uses two decks and ten columns. Build complete
                same-suit sequences from King down to Ace to remove them from the board.
                Our version lets you choose your difficulty: 1 suit for beginners, 2 suits
                for intermediate players, or the full 4-suit challenge for seasoned card
                game veterans. Spider rewards careful planning — every move matters.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🔲 Free FreeCell Solitaire</h3>
              <p className="mt-1">
                Free FreeCell Solitaire is a strategy game where almost every deal is
                solvable with the right approach. Four free cells act as temporary parking
                spaces, giving you the flexibility to maneuver cards that would otherwise
                be stuck. Unlike many solitaire variants, FreeCell relies almost entirely
                on skill — patience and planning win far more often than luck.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🔺 Free Pyramid Solitaire</h3>
              <p className="mt-1">
                Free Pyramid Solitaire challenges you to clear a 28-card pyramid by
                pairing cards that sum to 13. Kings remove alone; every other card needs a
                partner — a Queen pairs with an Ace, a Jack with a Two, and so on. The
                stock and waste pile give you extra chances, but not every deal can be
                beaten. It is the perfect free online solitaire game for a quick, engaging
                session.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">⛰️ Free TriPeaks Solitaire</h3>
              <p className="mt-1">
                Free TriPeaks Solitaire sets 28 cards across three overlapping peaks.
                Clear them by chaining cards that are one rank above or below the current
                waste card. Build long streaks to rack up bonus points and clear the board
                before the stock runs out. Fast, satisfying, and endlessly replayable,
                free TriPeaks solitaire is one of the most popular casual card games
                online.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🀄 Free Mahjong Solitaire</h3>
              <p className="mt-1">
                Free Mahjong Solitaire — sometimes called Shanghai solitaire — presents a
                144-tile layout stacked in the classic turtle formation. Match pairs of
                identical free tiles (those not blocked on either side or above) to clear
                the board. Flower tiles match any other flower; season tiles match any
                other season. It is a meditative, satisfying puzzle that rewards a sharp
                eye and a steady hand.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">⛳ Free Golf Solitaire</h3>
              <p className="mt-1">
                Free Golf Solitaire is one of the quickest games in the collection. Seven
                columns of five cards form the "course," and you clear them by building a
                single waste pile — playing any card one rank above or below the current
                top card, regardless of suit. Sequences can wrap around (a King plays onto
                a Queen or an Ace). Empty the tableau before the stock runs out to shoot
                under par. Fast, satisfying, and endlessly replayable in short bursts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🎩 Free Forty Thieves</h3>
              <p className="mt-1">
                Forty Thieves is the most demanding game in the collection. Two full decks
                are dealt into ten tableau columns of four cards, all face-up, and you must
                build eight foundation piles — one per suit — from Ace to King. Only the
                top card of each column can move, and columns build by suit in descending
                rank, making every free space precious. Fewer than one deal in ten is
                winnable, so every clear board is a genuine achievement.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🌿 Free Yukon Solitaire</h3>
              <p className="mt-1">
                Yukon plays like Klondike with one liberating twist: any face-up card —
                even one buried mid-column — can be moved along with everything above it.
                There is no stock pile; every card is dealt to the tableau from the start.
                That open layout makes Yukon more strategic than Klondike but also more
                unforgiving, since there are no extra draws to bail you out. Building
                foundations by suit from Ace to King requires careful column management
                across the full board.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🦂 Free Scorpion Solitaire</h3>
              <p className="mt-1">
                Scorpion is a Spider cousin played with a single deck in seven columns. The
                goal is to build four King-to-Ace sequences within the tableau — completed
                sequences are removed automatically. Any face-up card can be moved with
                everything above it to any column where it fits in descending rank,
                regardless of suit. Three reserve cards sit aside to be dealt as a last
                resort. The game is beatable more often than it looks, but untangling the
                columns requires careful planning from the opening moves.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🗂️ Free Eight Off</h3>
              <p className="mt-1">
                Eight Off is FreeCell's strategic sibling. Eight tableau columns hold six
                cards each, all face-up, and eight free cells — twice as many as FreeCell —
                give you considerably more room to maneuver. Build four foundations by suit
                from Ace to King by carefully freeing the cards buried underneath. The
                extra free cells make Eight Off more approachable for newcomers to
                open-information solitaire, while still rewarding methodical, forward-
                thinking play.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🎲 Free Canfield Solitaire</h3>
              <p className="mt-1">
                Canfield — named after the 19th-century gambling house where players paid
                by the deck — is a fast, punishing game with a notoriously low win rate.
                Thirteen cards form a reserve stack, one card starts each foundation, and
                four tableau columns build in descending rank and alternating color. The
                stock cycles quickly, options are limited, and most deals cannot be won.
                It is the solitaire game that feels most like a wager against the deck.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🃏 Free Addiction Solitaire</h3>
              <p className="mt-1">
                Addiction begins with a standard deck laid in four rows of thirteen cards.
                Aces are removed, leaving four gaps. The rule is simple: move any card into
                a gap, provided the card to the left of that gap is the same suit and one
                rank lower. Twos must anchor the left of each row. When no legal move
                remains you may shuffle the non-positioned cards — up to three times total.
                The goal is to complete all four rows in ascending suit order, which is
                clean in concept and surprisingly tricky in practice.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">📋 Free Baker's Dozen</h3>
              <p className="mt-1">
                Baker's Dozen deals all 52 cards face-up into thirteen columns of four.
                Before play begins, Kings are automatically moved to the bottom of their
                columns. After that, no card moves between tableau columns — the only legal
                move is placing a card onto its foundation pile, built by suit from Ace to
                King. With the full layout visible from the first move, Baker's Dozen is a
                puzzle of pure sequencing: work out which Aces and suited runs you can
                free, and in exactly what order.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">♟️ Free Baker's Game</h3>
              <p className="mt-1">
                Baker's Game uses the same four-free-cell, eight-column layout as FreeCell
                but with one rule change that makes it significantly harder: tableau columns
                must be built by suit in descending rank, not alternating color. That
                restriction sharply limits where cards can be placed, demanding deeper
                planning and making the free cells far more valuable. Fewer deals are
                solvable than in FreeCell, and sequences unravel quickly when the free
                cells fill up — a rewarding challenge for players who want more from their
                open-cell solitaire.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">🕐 Free Clock Solitaire</h3>
              <p className="mt-1">
                Clock Solitaire is the only game in the collection where skill plays no
                part — the outcome is decided the moment the deck is shuffled. Cards are
                dealt face-down into thirteen piles arranged like a clock face, with Ace at
                one o'clock and King at the center. Each turn, the top card of the current
                pile is flipped and tucked face-up beneath its matching clock position. You
                win if the King pile completes last; if all four Kings appear before every
                other pile is finished, the game is lost. Simple, fast, and oddly
                compelling.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold tracking-tight text-foreground">
            Features
          </h2>
          <ul className="space-y-2">
            {[
              ["No download required", "Every game runs entirely in your browser — desktop, tablet, or mobile."],
              ["Auto-save progress", "Your game state is saved automatically after every move using your browser's local storage. No account needed; your progress never leaves your device."],
              ["Undo & hints", "All sixteen games include unlimited undo and a built-in hint system so you never feel stuck."],
              ["Customisable card styles", "Choose from nine card back designs and nine card face styles to make the table feel like yours."],
              ["Completely free", "Solitaire Station is free to play with no paywalls, no mandatory sign-ups, and no ads interrupting your game."],
              ["Works on any device", "The layout adapts from a large desktop monitor down to a small phone screen, so you can play free online solitaire wherever you are."],
            ].map(([label, body]) => (
              <li key={label} className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground">{label}</span>
                <span>{body}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold tracking-tight text-foreground">
            Our philosophy
          </h2>
          <p>
            We believe the best free online solitaire experience is one that gets out of
            your way. Solitaire Station was designed from the ground up to load fast, feel
            responsive, and look great — without dark patterns, intrusive notifications, or
            paywalled features. The entire game runs client-side; no moves are sent to a
            server, and nothing about how you play is tracked beyond standard anonymous
            analytics.
          </p>
          <p className="mt-3">
            Whether you are a lifelong Klondike Solitaire fan looking for a clean modern
            version, or you want to explore free Spider Solitaire, free FreeCell Solitaire,
            free Pyramid Solitaire, free TriPeaks Solitaire, or free Mahjong Solitaire for
            the first time, Solitaire Station is built for you.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold tracking-tight text-foreground">
            Legal
          </h2>
          <p>
            Use of Solitaire Station is subject to our{" "}
            <Link to="/privacy" className="text-foreground underline underline-offset-2 transition hover:opacity-75">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/terms" className="text-foreground underline underline-offset-2 transition hover:opacity-75">
              Terms of Use
            </Link>
            . All games and content are © 2026 Solitaire Station. All rights reserved.
          </p>
        </section>

      </div>
      <SiteFooter showBackLink />
    </main>
  );
}
