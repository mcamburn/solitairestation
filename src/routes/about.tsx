import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Solitaire Station — Free Online Solitaire Games" },
      { name: "description", content: "About Solitaire Station — play free online solitaire including Klondike solitaire, free Spider Solitaire, free FreeCell, free Pyramid, free TriPeaks, and free Mahjong solitaire. No download, no sign-up." },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: "About Solitaire Station — Free Online Solitaire Games" },
      { property: "og:description", content: "Solitaire Station offers free online solitaire including Klondike, free Spider Solitaire, free FreeCell, free Pyramid, free TriPeaks, and free Mahjong solitaire." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
      { name: "twitter:card", content: "summary" },
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
        Free online solitaire — six games, zero friction
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
            We offer six of the most popular solitaire variants in a single, unified app.
            Every game shares the same polished neon aesthetic, consistent controls, and a
            full suite of quality-of-life features: undo, auto-save, move history, hints,
            and a timer — so you can focus on the cards.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold tracking-tight text-foreground">
            The six games
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
              ["Undo & hints", "All six games include unlimited undo and a built-in hint system so you never feel stuck."],
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
