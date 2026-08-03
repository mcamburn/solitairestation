import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import { recordWin, recordLoss, type GameStats } from "@/lib/stats";
import { useGameTopBarStats } from "@/hooks/useGameTopBarStats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import {
  newAddictionGame,
  addictionMove,
  addictionShuffle,
  isLocked,
  validGapsForCard,
  countValidMoves,
  findAddictionHint,
  type AddictionState,
  type AddictionHint,
} from "@/lib/addiction";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { DailyWinBanner } from "./DailyWinBanner";
import { rankLabel, suitGlyph, suitColor } from "@/lib/solitaire";

const SAVE_KEY = "addiction";

function formatTime(startedAt: number): string {
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function Addiction() {
  const [state, setState] = useState<AddictionState | null>(null);
  const [history, setHistory] = useState<AddictionState[]>([]);
  const [sel, setSel] = useState<[number, number] | null>(null); // [row, col]
  const [hint, setHint] = useState<AddictionHint | null>(null);
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [, forceUpdate] = useState(0);
  const statsRef = useRef(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const topBarStats = useGameTopBarStats(SAVE_KEY);
  const dailyModeRef = useRef(false);
  const { dailySeed, dailyTrigger, onDailyWin } = useDailyChallenge();

  useEffect(() => {
    const saved = loadGame<AddictionState>(SAVE_KEY);
    if (saved && saved.moves > 0) {
      setState(saved);
      if (saved.won) statsRef.current = true;
    } else {
      setState(newAddictionGame());
    }
  }, []);

  useEffect(() => {
    if (!state?.won || statsRef.current) return;
    statsRef.current = true;
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    setGameStats(recordWin(SAVE_KEY, elapsed, state.moves, dailyModeRef.current));
    if (dailyModeRef.current) { onDailyWin(); dailyModeRef.current = false; }
    setHistory([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.won]);

  useEffect(() => {
    if (state && state.moves > 0) saveGame(SAVE_KEY, state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const reset = (seed?: number) => {
    if (state && state.moves > 0 && !state.won && !statsRef.current) {
      setGameStats(recordLoss(SAVE_KEY, state.moves, dailyModeRef.current));
    }
    if (!seed) dailyModeRef.current = false;
    clearGame(SAVE_KEY);
    statsRef.current = false;
    setGameStats(null);
    setHistory([]);
    setSel(null);
    setHint(null);
    setState(newAddictionGame(seed));
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

  const commit = (next: AddictionState | null): boolean => {
    if (!next) return false;
    setHistory(h => [...h.slice(-50), state]);
    setState(next);
    setSel(null);
    setHint(null);
    return true;
  };

  const undo = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      setState(h[h.length - 1]);
      setSel(null);
      setHint(null);
      return h.slice(0, -1);
    });
  };

  const doShuffle = () => {
    const next = addictionShuffle(state);
    if (next) commit(next);
  };

  const showHint = () => {
    const h = findAddictionHint(state);
    setHint(h ?? { fromRow: 0, fromCol: 0, toRow: 0, toCol: 0, description: "No moves available — try shuffling or start a new game." });
  };

  const handleCardClick = (row: number, col: number) => {
    const card = state.grid[row][col];

    if (!card) {
      // Clicking a gap — try to move selected card here
      if (sel) {
        const [sr, sc] = sel;
        const moved = addictionMove(state, sr, sc, row, col);
        if (moved) { commit(moved); return; }
      }
      setSel(null);
      return;
    }

    // Clicking a card
    if (isLocked(state.grid, row, col)) {
      // locked card — deselect
      setSel(null);
      return;
    }

    if (sel) {
      const [sr, sc] = sel;
      if (sr === row && sc === col) {
        // Deselect same card
        setSel(null);
        return;
      }
      // If clicking another card, select it instead
      setSel([row, col]);
      return;
    }

    setSel([row, col]);
  };

  const time = formatTime(state.startedAt);
  const noMoves = countValidMoves(state) === 0;

  // Determine which gaps are valid for the selected card
  const validGaps = sel
    ? validGapsForCard(state.grid, state.grid[sel[0]][sel[1]]!)
    : [];
  const validGapSet = new Set(validGaps.map(([r, c]) => `${r},${c}`));

  const isHintFrom = (r: number, c: number) => hint && hint.fromRow === r && hint.fromCol === c;
  const isHintTo = (r: number, c: number) => hint && hint.toRow === r && hint.toCol === c;

  return (
    <div className="game-board-wrap mx-auto w-full sm:max-w-[900px] xl:max-w-[1200px] sm:px-4 xl:px-6 pb-16">
      {/* Top bar */}
      <div className="glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Moves <span className="font-semibold text-foreground">{state.moves}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{time}</span>
          <span className="text-muted-foreground">
            Shuffles <span className="font-semibold text-foreground">{state.shufflesLeft}</span>
          </span>
          {topBarStats.hasPlayed && (
            <span className="text-muted-foreground">Streak <span className="font-semibold tabular-nums" style={{ color: "var(--neon)" }}>{topBarStats.streak}</span></span>
          )}
          {topBarStats.hasPlayed && (
            <span className="text-muted-foreground"><span className="font-semibold tabular-nums" style={{ color: "var(--neon)" }}>{topBarStats.winRate}%</span> wins</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={showHint} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70">
            Hint
          </button>
          <button
            onClick={doShuffle}
            disabled={state.shufflesLeft <= 0}
            className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70 disabled:opacity-40"
          >
            Shuffle ({state.shufflesLeft})
          </button>
          <button onClick={undo} disabled={history.length === 0} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70 disabled:opacity-40">
            Undo
          </button>
          <button onClick={() => reset()} className="rounded-lg px-2.5 py-1 text-primary-foreground transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}>
            New Game
          </button>
        </div>
      </div>

      {hint && (
        <div className="glass mt-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs" style={{ borderColor: "var(--neon)" }}>
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

      <div className="game-board-glass glass mt-4 rounded-2xl p-3 sm:p-4">
        {/* 4×13 grid */}
        <div className="flex flex-col gap-2 sm:gap-1.5">
          {state.grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1">
              {row.map((card, colIdx) => {
                const locked = card ? isLocked(state.grid, rowIdx, colIdx) : false;
                const isSel = sel && sel[0] === rowIdx && sel[1] === colIdx;
                const isGap = card === null;
                const isValidGap = isGap && validGapSet.has(`${rowIdx},${colIdx}`);
                const hintFrom = isHintFrom(rowIdx, colIdx);
                const hintTo = isHintTo(rowIdx, colIdx);

                if (isGap) {
                  return (
                    <div
                      key={colIdx}
                      onClick={() => handleCardClick(rowIdx, colIdx)}
                      className={[
                        "flex-1 min-w-0 rounded-md border transition-all cursor-pointer",
                        "flex items-center justify-center",
                        "h-9 sm:h-10",
                        isValidGap
                          ? "border-[var(--neon)] bg-[var(--neon)]/10 shadow-[0_0_8px_var(--neon)]"
                          : hintTo
                          ? "border-amber-400 bg-amber-400/10"
                          : "border-dashed border-border/50 bg-transparent",
                      ].join(" ")}
                    >
                      {isValidGap && <span className="text-[8px] text-[var(--neon)] opacity-70">▼</span>}
                    </div>
                  );
                }

                const color = suitColor(card!.suit);
                const isRed = color === "red";

                return (
                  <button
                    key={colIdx}
                    onClick={() => handleCardClick(rowIdx, colIdx)}
                    disabled={locked}
                    className={[
                      "flex-1 min-w-0 rounded-md border text-center transition-all select-none",
                      "h-9 sm:h-10 px-0.5",
                      "flex flex-col items-center justify-center leading-none",
                      locked
                        ? "border-border/30 bg-secondary/30 opacity-60 cursor-default"
                        : isSel
                        ? "border-[var(--neon)] bg-[var(--neon)]/20 shadow-[0_0_10px_var(--neon)] cursor-pointer"
                        : hintFrom
                        ? "border-amber-400 bg-amber-400/15 cursor-pointer"
                        : "border-border bg-card hover:border-[var(--neon)]/60 hover:bg-secondary/50 cursor-pointer",
                    ].join(" ")}
                  >
                    <span
                      className="font-bold leading-none"
                      style={{
                        fontSize: "clamp(8px, 1.4vw, 13px)",
                        color: isRed ? "#e11d48" : "var(--foreground)",
                      }}
                    >
                      {rankLabel(card!.rank)}
                    </span>
                    <span
                      className="leading-none"
                      style={{
                        fontSize: "clamp(7px, 1.2vw, 11px)",
                        color: isRed ? "#e11d48" : "var(--foreground)",
                      }}
                    >
                      {suitGlyph(card!.suit)}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Column position labels */}
        <div className="mt-1 flex gap-1">
          {Array.from({ length: 13 }, (_, i) => (
            <div key={i} className="flex-1 min-w-0 text-center text-[9px] text-muted-foreground/40">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {noMoves && !state.won && (
        <div
          className="glass mt-6 rounded-2xl px-8 py-8 text-center"
          style={{ borderColor: "#f59e0b", boxShadow: "0 0 30px -8px #f59e0b" }}
        >
          <div className="text-4xl">🔀</div>
          <h2 className="mt-3 text-xl font-bold tracking-tight">No more moves</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No cards can be moved. {state.shufflesLeft > 0 ? `You have ${state.shufflesLeft} shuffle${state.shufflesLeft !== 1 ? "s" : ""} remaining.` : "No shuffles remaining."}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            {state.shufflesLeft > 0 && (
              <button
                onClick={doShuffle}
                className="rounded-xl border border-border px-5 py-2 text-sm transition hover:bg-secondary/70"
              >
                Shuffle ({state.shufflesLeft})
              </button>
            )}
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

      {state.won && (
        <DailyWinBanner message={`All rows complete in ${state.moves} moves!`} onNew={reset} stats={gameStats} />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Click a card to select, then click a gap to move it there. A card moves right of same-suit card one rank lower. 2s go in column 1.
      </p>
    </div>
  );
}
