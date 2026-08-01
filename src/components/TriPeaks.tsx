import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import {
  newTriPeaksGame,
  tryPlayTPCard,
  drawTPStock,
  isTPAvailable,
  canPlayOnWaste,
  hasAnyTPMove,
  findTPHint,
  type TPHint,
  CARD_POS,
  type TriPeaksState,
} from "@/lib/tripeaks";
import { PlayingCard, type CardBackSkin, type CardFaceStyle } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { WinBanner } from "./WinBanner";

// Layout constants
const UNIT = 78;   // horizontal unit in px (card-position multiplier)
const CARD_W = 70; // px
const CARD_H = 100; // px
const ROW_H = 114; // px per row

const TOTAL_W = 9 * UNIT + CARD_W; // 702 + 70 = 772px
const TOTAL_H = 3 * ROW_H + CARD_H; // 342 + 100 = 442px

function formatTime(startedAt: number): string {
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function TriPeaks() {
  const [state, setState] = useState<TriPeaksState | null>(null);
  const [history, setHistory] = useState<TriPeaksState[]>([]);
  const [hint, setHint] = useState<TPHint | null>(null);
  const [stuck, setStuck] = useState(false);
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const saved = loadGame<TriPeaksState>("tripeaks");
    if (saved && saved.moves > 0) {
      setState(saved);
      if (!saved.won) setStuck(!hasAnyTPMove(saved));
    } else {
      if (saved) clearGame("tripeaks"); // discard stale zero-move save
      setState(newTriPeaksGame());
    }
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("tripeaks", state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Scale the board so the layout fits the available width on mobile.
  // Minimum scale 0.55 keeps cards readable; board may still scroll below that.
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const stateLoaded = state !== null;
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setScale(Math.max(0.55, Math.min(1, w / TOTAL_W)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stateLoaded]);
  // Also clamp by viewport height: 4 rows + stock/waste should fit.
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const maxCardH = Math.round(vh * 0.18);
  const hScale = Math.min(1, maxCardH / CARD_H);
  const effectiveScale = Math.min(scale, hScale);
  const unit   = Math.round(UNIT   * effectiveScale);
  const cardW  = Math.round(CARD_W * effectiveScale);
  const cardH  = Math.round(CARD_H * effectiveScale);
  const rowH   = Math.round(ROW_H  * effectiveScale);
  const totalW = Math.round(TOTAL_W * effectiveScale);
  const totalH = Math.round(TOTAL_H * effectiveScale);

  if (!state) {
    return (
      <div className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16">
        <div className="glass mt-4 h-[520px] animate-pulse rounded-2xl" />
      </div>
    );
  }

  const game = state;

  const commit = (next: TriPeaksState | null) => {
    if (!next) return false;
    setHistory((h) => [...h.slice(-30), game]);
    setState(next);
    setHint(null);
    if (!next.won) setStuck(!hasAnyTPMove(next));
    return true;
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setState(h[h.length - 1]);
      setHint(null);
      setStuck(false);
      return h.slice(0, -1);
    });
  };

  const reset = () => {
    clearGame("tripeaks");
    setHistory([]);
    setHint(null);
    setStuck(false);
    setState(newTriPeaksGame());
    showToast();
  };

  const showHint = () => {
    const h = findTPHint(game);
    setHint(h ?? { cardIdx: -1, description: "No moves available — try undoing or starting a new game." });
  };

  const handleCardClick = (idx: number) => {
    commit(tryPlayTPCard(game, idx));
  };

  const handleStockClick = () => {
    commit(drawTPStock(game));
  };

  const wasteTop = game.waste[game.waste.length - 1];
  const time = formatTime(game.startedAt);

  return (
    <div className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16">
      {/* Top bar */}
      <div className="glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Moves <span className="font-semibold text-foreground">{game.moves}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{time}</span>
          {game.streak > 1 && (
            <span className="font-semibold" style={{ color: "var(--neon)" }}>
              🔥 Streak ×{game.streak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={showHint}
            className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70"
          >
            Hint
          </button>
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70 disabled:opacity-40"
          >
            Undo
          </button>
          <button
            onClick={reset}
            className="rounded-lg px-2.5 py-1 text-primary-foreground transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}
          >
            New Game
          </button>
        </div>
      </div>

      {hint && (
        <div
          className="game-controls glass mt-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs"
          style={{ borderColor: "var(--neon)" }}
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--neon)", boxShadow: "0 0 8px var(--neon)" }} />
            <span className="font-medium">Hint</span>
            <span className="text-muted-foreground">{hint.description}</span>
          </div>
          <button onClick={() => setHint(null)} className="rounded-md px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground" aria-label="Dismiss hint">✕</button>
        </div>
      )}

      <AppearanceBar skin={skin} face={face} onSkinChange={setSkin} onFaceChange={setFace} />

      <NewGameToast visible={toastVisible} skin={skin} face={face} />

      {/* Board */}
      <div className="game-board-glass glass mt-4 overflow-x-auto rounded-2xl p-4 sm:p-6">
        {/* boardRef div measures available content width for scaling */}
        <div ref={boardRef}>
          {/* Three peaks — absolutely positioned */}
          <div className="mx-auto" style={{ width: totalW, position: "relative", height: totalH }}>
            {Array.from({ length: 28 }).map((_, idx) => {
              const card = game.cards[idx];
              const pos = CARD_POS[idx];
              const x = Math.round(pos.x * unit);
              const y = Math.round(pos.row * rowH);
              const available = card ? isTPAvailable(game.cards, idx) : false;
              const playable = available && canPlayOnWaste(card!, wasteTop);

              return (
                <div
                  key={idx}
                  className="absolute card-slot-container"
                  style={{
                    left: x,
                    top: y,
                    width: cardW,
                    height: cardH,
                    cursor: playable ? "pointer" : "default",
                    zIndex: pos.row * 10 + 1,
                  }}
                  onClick={() => playable && handleCardClick(idx)}
                >
                  {card ? (
                    <PlayingCard
                      card={card}
                      hinted={hint?.cardIdx === idx}
                      backSkin={skin}
                      faceStyle={face}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if (playable) handleCardClick(idx);
                      }}
                      interactive={playable}
                    />
                  ) : (
                    // Invisible placeholder so z-stacking doesn't shift
                    <div style={{ width: cardW, height: cardH }} className="opacity-0 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stock + Waste */}
          <div className="mt-5 flex items-center justify-center gap-5">
            {/* Stock */}
            <div
              onClick={handleStockClick}
              className={`card-slot-container${game.stock.length > 0 ? " cursor-pointer" : " cursor-default"}`}
              style={{ width: cardW, height: cardH }}
            >
              {game.stock.length > 0 ? (
                <PlayingCard
                  card={{ ...game.stock[game.stock.length - 1], faceUp: false }}
                  backSkin={skin}
                  faceStyle={face}
                  onPointerDown={(e) => { e.stopPropagation(); handleStockClick(); }}
                  interactive
                />
              ) : (
                <div className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-xs text-muted-foreground/40">
                  Empty
                </div>
              )}
            </div>

            {/* Waste */}
            <div className="card-slot-container" style={{ width: cardW, height: cardH }}>
              {wasteTop ? (
                <PlayingCard
                  card={wasteTop}
                  backSkin={skin}
                  faceStyle={face}
                  onPointerDown={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="slot-empty h-full w-full rounded-[var(--card-radius)]" />
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>Stock: {game.stock.length}</div>
              <div>Waste: {game.waste.length}</div>
            </div>
          </div>
        </div>
      </div>

      {stuck && !game.won && (
        <div
          className="glass mt-6 rounded-2xl px-8 py-8 text-center"
          style={{ borderColor: "#f59e0b", boxShadow: "0 0 30px -8px #f59e0b" }}
        >
          <div className="text-4xl">⛰️</div>
          <h2 className="mt-3 text-xl font-bold tracking-tight">No more moves</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The stock is empty and no board card plays on the waste top. Try undoing or start a new game.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="rounded-xl border border-border px-5 py-2 text-sm transition hover:bg-secondary/70 disabled:opacity-40"
            >
              Undo
            </button>
            <button
              onClick={reset}
              className="rounded-xl px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}
            >
              New Game
            </button>
          </div>
        </div>
      )}

      {game.won && (
        <WinBanner
          message={`All peaks cleared in ${game.moves} moves!`}
          onNew={reset}
        />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Play cards one rank above or below the waste pile top. Aces wrap around Kings.
      </p>
    </div>
  );
}
