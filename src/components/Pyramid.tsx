import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import { recordWin, recordLoss, type GameStats } from "@/lib/stats";
import { useGameTopBarStats } from "@/hooks/useGameTopBarStats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import {
  newPyramidGame,
  tryPyramidRemove,
  drawPyramidStock,
  isPyramidAvailable,
  hasAnyPyramidMove,
  findPyramidHint,
  type PyramidHint,
  type PyramidState,
  type PyramidSel,
} from "@/lib/pyramid";
import { PlayingCard, type CardBackSkin, type CardFaceStyle } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { DailyWinBanner } from "./DailyWinBanner";

const CARD_W = 74;
const CARD_H = 106;

function formatTime(startedAt: number): string {
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function Pyramid() {
  const [state, setState] = useState<PyramidState | null>(null);
  const [history, setHistory] = useState<PyramidState[]>([]);
  const [sel, setSel] = useState<PyramidSel | null>(null);
  const [hint, setHint] = useState<PyramidHint | null>(null);
  const [stuck, setStuck] = useState(false);
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [, forceUpdate] = useState(0);

  // Stats & daily challenge
  const statsRef = useRef(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const topBarStats = useGameTopBarStats("pyramid");
  const dailyModeRef = useRef(false);
  const dailyResetRef = useRef<(() => void) | null>(null);
  const { dailySeed, dailyTrigger, onDailyWin } = useDailyChallenge();

  useEffect(() => {
    const saved = loadGame<PyramidState>("pyramid");
    if (saved && saved.moves > 0) {
      // Normalise legacy saves that pre-date the streak field
      const normalised: PyramidState = { ...saved, streak: saved.streak ?? 0 };
      setState(normalised);
      if (!normalised.won) setStuck(!hasAnyPyramidMove(normalised));
    } else {
      if (saved) clearGame("pyramid"); // discard stale zero-move save
      setState(newPyramidGame());
    }
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("pyramid", state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (dailyTrigger === 0) return;
    dailyModeRef.current = true;
    statsRef.current = false;
    dailyResetRef.current?.();
  }, [dailyTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (statsRef.current || !state) return;
    if (state.won) {
      statsRef.current = true;
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      setGameStats(recordWin("pyramid", elapsed, state.moves, dailyModeRef.current));
      if (dailyModeRef.current) { onDailyWin(); dailyModeRef.current = false; }
    } else if (stuck) {
      statsRef.current = true;
      setGameStats(recordLoss("pyramid", state.moves, dailyModeRef.current));
      if (dailyModeRef.current) dailyModeRef.current = false;
    }
  }, [state?.won, stuck]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scale the board so the 7-card-wide pyramid fits the available width on mobile.
  // Design width: 7 × CARD_W + 6 × 6px gap = 7×74 + 36 = 554px.
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const stateLoaded = state !== null;
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setScale(Math.min(1, w / 554));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stateLoaded]);
  // Also clamp by viewport height so the pyramid fits on phone landscape.
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const maxCardH = Math.round(vh * 0.14); // 7 rows visible at once
  const cardW   = Math.max(32, Math.min(Math.round(CARD_W * scale), Math.round(maxCardH * 7 / 10)));
  const cardH   = Math.round(cardW * 10 / 7);
  const cardGap = Math.max(3, Math.round(6 * scale));

  if (!state) {
    return (
      <div className="game-board-wrap mx-auto w-full sm:max-w-[900px] xl:max-w-[1200px] sm:px-4 xl:px-6 pb-16">
        <div className="glass mt-4 h-[520px] animate-pulse rounded-2xl" />
      </div>
    );
  }

  const game = state;

  const commit = (next: PyramidState | null) => {
    if (!next) return false;
    setHistory((h) => [...h.slice(-30), game]);
    setState(next);
    setSel(null);
    setHint(null);
    if (!next.won) setStuck(!hasAnyPyramidMove(next));
    return true;
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setState(h[h.length - 1]);
      setSel(null);
      setHint(null);
      setStuck(false);
      return h.slice(0, -1);
    });
  };

  const reset = (seed?: number) => {
    if (state?.moves > 0 && !state?.won && !statsRef.current) {
      recordLoss("pyramid", state.moves, dailyModeRef.current);
    }
    if (!seed) dailyModeRef.current = false;
    statsRef.current = false;
    clearGame("pyramid");
    setHistory([]);
    setSel(null);
    setHint(null);
    setStuck(false);
    setState(newPyramidGame(seed));
    showToast();
  };
  dailyResetRef.current = () => reset(dailySeed);

  const showHint = () => {
    const h = findPyramidHint(game);
    setHint(h ?? { selA: { kind: "waste" }, selB: null, description: "No moves available — try undoing or starting a new game." });
  };

  const handlePyramidClick = (row: number, col: number) => {
    const card = game.pyramid[row][col];
    if (!card || !isPyramidAvailable(game.pyramid, row, col)) return;
    const thisSel: PyramidSel = { kind: "pyramid", row, col };

    // King: remove alone
    if (card.rank === 13) { commit(tryPyramidRemove(game, thisSel, null)); return; }

    if (!sel) { setSel(thisSel); return; }

    // Try to pair
    const result = tryPyramidRemove(game, sel, thisSel);
    if (result) { commit(result); return; }

    // Replace selection
    setSel(thisSel);
  };

  const handleWasteClick = () => {
    const wasteCard = game.waste[game.waste.length - 1];
    if (!wasteCard) return;
    const wasteSel: PyramidSel = { kind: "waste" };

    if (wasteCard.rank === 13) { commit(tryPyramidRemove(game, wasteSel, null)); return; }

    if (!sel) { setSel(wasteSel); return; }

    const result = tryPyramidRemove(game, sel, wasteSel);
    if (result) { commit(result); return; }
    setSel(wasteSel);
  };

  const handleStockClick = () => {
    commit(drawPyramidStock(game));
  };

  const time = formatTime(game.startedAt);
  const wasteTop = game.waste[game.waste.length - 1];
  const isSel = (row: number, col: number) =>
    sel?.kind === "pyramid" && sel.row === row && sel.col === col;
  const isWasteSel = sel?.kind === "waste";

  return (
    <div className="game-board-wrap mx-auto w-full sm:max-w-[900px] xl:max-w-[1200px] sm:px-4 xl:px-6 pb-16">
      {/* Top bar */}
      <div className="glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Moves <span className="font-semibold text-foreground">{game.moves}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{time}</span>
          <span className="text-muted-foreground">
            Stock <span className="font-semibold text-foreground">{game.stock.length}</span>
          </span>
          {game.streak > 0 && (
            <span className="text-muted-foreground">Run <span className="font-semibold tabular-nums" style={{ color: "var(--neon)" }}>{game.streak}</span></span>
          )}
          {topBarStats.hasPlayed && (
            <span className="text-muted-foreground">Streak <span className="font-semibold tabular-nums" style={{ color: "var(--neon)" }}>{topBarStats.streak}</span></span>
          )}
          {topBarStats.hasPlayed && (
            <span className="text-muted-foreground"><span className="font-semibold tabular-nums" style={{ color: "var(--neon)" }}>{topBarStats.winRate}%</span> wins</span>
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
            onClick={() => reset()}
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
          {/* Pyramid */}
          <div className="flex flex-col items-center" style={{ gap: cardGap }}>
            {game.pyramid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex" style={{ gap: cardGap }}>
                {row.map((card, colIdx) => (
                  <div
                    key={colIdx}
                    style={{ width: cardW, height: cardH }}
                    onClick={() => card && handlePyramidClick(rowIdx, colIdx)}
                    className={`card-slot-container${card && card.faceUp ? " cursor-pointer" : ""}`}
                  >
                    {card ? (
                      <PlayingCard
                        card={card}
                        selected={isSel(rowIdx, colIdx)}
                        hinted={
                          (hint?.selA.kind === "pyramid" && hint.selA.row === rowIdx && hint.selA.col === colIdx) ||
                          (hint?.selB?.kind === "pyramid" && hint.selB.row === rowIdx && hint.selB.col === colIdx)
                        }
                        backSkin={skin}
                        faceStyle={face}
                        onPointerDown={(e) => { e.stopPropagation(); handlePyramidClick(rowIdx, colIdx); }}
                        interactive={card.faceUp && isPyramidAvailable(game.pyramid, rowIdx, colIdx)}
                      />
                    ) : (
                      // Invisible placeholder keeps pyramid shape
                      <div style={{ width: cardW, height: cardH }} className="opacity-0" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Stock + waste */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {/* Stock */}
            <div
              style={{ width: cardW, height: cardH }}
              onClick={handleStockClick}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleStockClick(); } }}
              tabIndex={game.stock.length === 0 ? 0 : undefined}
              role={game.stock.length === 0 ? "button" : undefined}
              aria-label={game.stock.length === 0 ? "Recycle waste pile" : undefined}
              className="card-slot-container cursor-pointer"
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
                <div
                  className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-lg text-muted-foreground/50"
                  title="Recycle waste"
                >
                  ↺
                </div>
              )}
            </div>

            {/* Waste */}
            <div
              style={{ width: cardW, height: cardH }}
              onClick={handleWasteClick}
              className={`card-slot-container${wasteTop ? " cursor-pointer" : ""}`}
            >
              {wasteTop ? (
                <PlayingCard
                  card={wasteTop}
                  selected={isWasteSel}
                  hinted={hint?.selA.kind === "waste" || hint?.selB?.kind === "waste"}
                  backSkin={skin}
                  faceStyle={face}
                  onPointerDown={(e) => { e.stopPropagation(); handleWasteClick(); }}
                  interactive
                />
              ) : (
                <div className="slot-empty h-full w-full rounded-[var(--card-radius)]" />
              )}
            </div>

            <div className="text-xs text-muted-foreground">
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
          <div className="text-4xl">🃏</div>
          <h2 className="mt-3 text-xl font-bold tracking-tight">No more moves</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No pyramid cards can be paired and no drawable card creates a match. Try undoing or start fresh.
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
              onClick={() => reset()}
              className="rounded-xl px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}
            >
              New Game
            </button>
          </div>
        </div>
      )}

      {game.won && (
        <DailyWinBanner
          message={`Pyramid cleared in ${game.moves} moves!`}
          onNew={reset}
          stats={gameStats}
        />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Pair cards that sum to 13 to remove them. Kings remove alone. Click stock to draw.
      </p>
    </div>
  );
}
