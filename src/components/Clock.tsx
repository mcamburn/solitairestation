import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import { recordWin, recordLoss, type GameStats } from "@/lib/stats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import {
  newClockGame,
  clockStep,
  clockHasNextCard,
  clockFaceDownCount,
  type ClockState,
} from "@/lib/clock";
import { PlayingCard, type CardBackSkin, type CardFaceStyle } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { DailyWinBanner } from "./DailyWinBanner";

const CARD_W = 56;
const CARD_H = 80;

function formatTime(startedAt: number): string {
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Clock positions: index 0-11 = 1 o'clock through 12 o'clock
// Standard clock: 12 at top, 3 at right, 6 at bottom, 9 at left
// Position i corresponds to rank i+1
// i=0 → 1 o'clock, i=11 → 12 o'clock
function clockPosition(index: number, radius: number): { x: number; y: number } {
  // i=11 is 12 o'clock (top), i=0 is 1 o'clock
  // angle = ((i + 1) / 12) * 2π - π/2  (start at top, go clockwise)
  const angle = ((index + 1) / 12) * 2 * Math.PI - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

interface PileDisplayProps {
  pile: ClockState["piles"][0];
  label: string;
  isActive: boolean;
  cardW: number;
  cardH: number;
  skin: CardBackSkin;
  face: CardFaceStyle;
}

function PileDisplay({ pile, label, isActive, cardW, cardH, skin, face }: PileDisplayProps) {
  const faceUpCards = pile.filter(c => c.faceUp);
  const faceDownCount = pile.filter(c => !c.faceUp).length;

  return (
    <div
      className="flex flex-col items-center gap-0.5"
      style={{
        width: cardW + 8,
      }}
    >
      <div className="relative" style={{ width: cardW, height: cardH }}>
        {/* Face-down stack indicator */}
        {faceDownCount > 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-[var(--card-radius)]"
            style={{
              border: isActive
                ? "2px solid var(--neon)"
                : "2px solid color-mix(in oklab, var(--border) 70%, transparent)",
              boxShadow: isActive ? "0 0 12px var(--neon)" : undefined,
              background: "color-mix(in oklab, var(--surface) 60%, transparent)",
            }}
          >
            <span className="text-xs font-bold text-muted-foreground">{faceDownCount}</span>
          </div>
        )}
        {/* Show top face-up card on top if any */}
        {faceUpCards.length > 0 && (
          <div className="absolute inset-0 card-slot-container">
            <PlayingCard
              card={faceUpCards[faceUpCards.length - 1]}
              backSkin={skin}
              faceStyle={face}
              style={
                isActive
                  ? { boxShadow: "0 0 16px var(--neon), 0 0 4px var(--neon)" }
                  : undefined
              }
            />
            {faceUpCards.length > 1 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                style={{ background: "var(--neon)", color: "var(--primary-foreground)" }}
              >
                {faceUpCards.length}
              </span>
            )}
          </div>
        )}
        {/* Empty pile */}
        {pile.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-[var(--card-radius)] text-muted-foreground/20"
            style={{ border: "2px dashed" }}
          >
            ✓
          </div>
        )}
      </div>
      <span
        className="text-[10px] font-semibold tabular-nums"
        style={{ color: isActive ? "var(--neon)" : "var(--muted-foreground)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function Clock() {
  const [state, setState] = useState<ClockState | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef(false);
  const statsRef = useRef(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const dailyModeRef = useRef(false);
  const { dailySeed, dailyTrigger, onDailyWin } = useDailyChallenge();
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [, forceUpdate] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(480);

  useEffect(() => {
    const saved = loadGame<ClockState>("clock");
    if (saved && saved.moves > 0) {
      setState(saved);
      if (saved.won || saved.lost) statsRef.current = true;
    } else {
      if (saved) clearGame("clock");
      setState(newClockGame());
    }
  }, []);

  useEffect(() => {
    if (statsRef.current) return;
    if (state?.won) {
      statsRef.current = true;
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      setGameStats(recordWin("clock", elapsed, state.moves, dailyModeRef.current));
      if (dailyModeRef.current) { onDailyWin(); dailyModeRef.current = false; }
    } else if (state?.lost) {
      statsRef.current = true;
      setGameStats(recordLoss("clock", state.moves, dailyModeRef.current));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.won, state?.lost]);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("clock", state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Measure container for responsive sizing
  const stateLoaded = state !== null;
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setBoardSize(Math.min(520, Math.max(300, w - 32)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stateLoaded]);

  // Auto-play loop
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  useEffect(() => {
    if (!autoPlay || !state) return;
    if (state.won || state.lost || !clockHasNextCard(state)) {
      setAutoPlay(false);
      return;
    }
    const id = setTimeout(() => {
      if (!autoPlayRef.current) return;
      setState(prev => {
        if (!prev) return prev;
        const next = clockStep(prev);
        return next ?? prev;
      });
    }, 400);
    return () => clearTimeout(id);
  }, [autoPlay, state]);

  const reset = (seed?: number) => {
    if (!seed) dailyModeRef.current = false;
    clearGame("clock");
    setAutoPlay(false);
    statsRef.current = false;
    setGameStats(null);
    setState(newClockGame(seed));
    showToast();
  };

  useEffect(() => {
    if (dailyTrigger === 0) return;
    dailyModeRef.current = true;
    statsRef.current = false;
    reset(dailySeed);
  }, [dailyTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) {
    return (
      <div className="game-board-wrap mx-auto w-full sm:max-w-[900px] xl:max-w-[1200px] sm:px-4 xl:px-6 pb-16">
        <div className="glass mt-4 h-[520px] animate-pulse rounded-2xl" />
      </div>
    );
  }

  const game = state;

  const step = () => {
    const next = clockStep(game);
    if (next) setState(next);
  };

  const time = formatTime(game.startedAt);
  const remaining = clockFaceDownCount(game);
  const hasNext = clockHasNextCard(game);
  const gameEnded = game.won || game.lost;

  // Responsive card sizing based on boardSize
  const scaleFactor = boardSize / 480;
  const cardW = Math.max(28, Math.round(CARD_W * scaleFactor));
  const cardH = Math.round(cardW * 10 / 7);

  // Clock layout
  const clockRadius = (boardSize / 2) - cardW / 2 - 16;
  const centerX = boardSize / 2;
  const centerY = boardSize / 2;

  // Labels for clock positions (1–12)
  const clockLabels = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q"];

  return (
    <div className="game-board-wrap mx-auto w-full sm:max-w-[900px] xl:max-w-[1200px] sm:px-4 xl:px-6 pb-16">
      {/* Top bar */}
      <div className="game-controls glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Moves <span className="font-semibold text-foreground">{game.moves}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{time}</span>
          <span className="text-muted-foreground">
            Face-down <span className="font-semibold text-foreground">{remaining}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoPlay(v => !v)}
            disabled={gameEnded || !hasNext}
            className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70 disabled:opacity-40"
            style={autoPlay ? { borderColor: "var(--neon)", color: "var(--neon)" } : undefined}
          >
            {autoPlay ? "⏸ Pause" : "⏵ Auto"}
          </button>
          <button
            onClick={() => reset()}
            className="rounded-lg px-2.5 py-1 text-primary-foreground transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}
          >
            New Game
          </button>
        </div>
      </div>

      <AppearanceBar skin={skin} face={face} onSkinChange={setSkin} onFaceChange={setFace} />
      <NewGameToast visible={toastVisible} skin={skin} face={face} />

      {/* Board */}
      <div className="game-board-glass glass mt-4 rounded-2xl p-4 sm:p-6" ref={containerRef}>
        {/* Clock SVG layout */}
        <div className="relative mx-auto" style={{ width: boardSize, height: boardSize }}>
          {/* Clock positions 1–12 (pile indices 0–11) */}
          {game.piles.slice(0, 12).map((pile, i) => {
            const pos = clockPosition(i, clockRadius);
            const isActive = game.currentPile === i;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: centerX + pos.x - (cardW + 8) / 2,
                  top: centerY + pos.y - (cardH + 16) / 2,
                }}
              >
                <PileDisplay
                  pile={pile}
                  label={clockLabels[i]}
                  isActive={isActive}
                  cardW={cardW}
                  cardH={cardH}
                  skin={skin}
                  face={face}
                />
              </div>
            );
          })}

          {/* Center pile (King, index 12) */}
          <div
            className="absolute"
            style={{
              left: centerX - (cardW + 8) / 2,
              top: centerY - (cardH + 16) / 2,
            }}
          >
            <PileDisplay
              pile={game.piles[12]}
              label="K"
              isActive={game.currentPile === 12}
              cardW={cardW}
              cardH={cardH}
              skin={skin}
              face={face}
            />
          </div>
        </div>

        {/* Deal Next Card button */}
        {!gameEnded && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={step}
              disabled={!hasNext || autoPlay}
              className="rounded-xl px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}
            >
              Deal Next Card
            </button>
          </div>
        )}

        {/* Current state info */}
        {!gameEnded && (
          <div className="mt-3 text-center text-xs text-muted-foreground">
            {hasNext
              ? <>Current pile: <strong className="text-foreground">{
                  game.currentPile === 12 ? "K (center)" : clockLabels[game.currentPile]
                }</strong> — flip next face-down card</>
              : "No face-down cards left in current pile"}
          </div>
        )}
      </div>

      {game.lost && (
        <DailyWinBanner
          variant="stuck"
          message={`All 4 Kings revealed — the game ends. Better luck next time!`}
          onNew={reset}
          stats={gameStats}
        />
      )}

      {game.won && (
        <DailyWinBanner
          message={`Incredible! All cards revealed before the 4th King — you beat Clock Patience!`}
          onNew={reset}
          stats={gameStats}
        />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Fully automatic — deal cards to their matching clock position. 4 Kings revealed = lose.
      </p>
    </div>
  );
}
