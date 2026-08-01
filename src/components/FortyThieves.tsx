import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import {
  newFortyThievesGame,
  ftDrawFromStock,
  ftMoveToFoundation,
  ftMoveToTableau,
  findFTHint,
  canPlaceFTFoundation,
  type FortyThievesState,
  type FTSource,
  type FTHint,
} from "@/lib/fortythieves";
import { PlayingCard, type CardBackSkin, type CardFaceStyle } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { WinBanner } from "./WinBanner";

const SAVE_KEY = "fortythieves";

function formatTime(startedAt: number): string {
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function srcEqual(a: FTSource | null, b: FTSource | null): boolean {
  if (!a || !b) return false;
  if (a.kind !== b.kind) return false;
  if (a.kind === "tableau" && b.kind === "tableau") return a.col === b.col;
  return a.kind === "waste" && b.kind === "waste";
}

export function FortyThieves() {
  const [state, setState] = useState<FortyThievesState | null>(null);
  const [history, setHistory] = useState<FortyThievesState[]>([]);
  const [sel, setSel] = useState<FTSource | null>(null);
  const [hint, setHint] = useState<FTHint | null>(null);
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const saved = loadGame<FortyThievesState>(SAVE_KEY);
    if (saved && saved.moves > 0) {
      setState(saved);
    } else {
      setState(newFortyThievesGame());
    }
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame(SAVE_KEY, state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const boardRef = useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState(64);
  const cardH = Math.round(cardW * 10 / 7);
  const cardGap = Math.max(2, Math.round(cardW * 0.07));

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width - 32; // subtract padding
      // 10 columns + gaps
      const computed = Math.floor((w - cardGap * 9) / 10);
      setCardW(Math.max(36, Math.min(computed, 80)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [state !== null]);

  if (!state) {
    return (
      <div className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16">
        <div className="glass mt-4 h-[520px] animate-pulse rounded-2xl" />
      </div>
    );
  }

  const commit = (next: FortyThievesState | null): boolean => {
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

  const reset = () => {
    clearGame(SAVE_KEY);
    setHistory([]);
    setSel(null);
    setHint(null);
    setState(newFortyThievesGame());
    showToast();
  };

  const showHint = () => {
    const h = findFTHint(state);
    setHint(h ?? { src: { kind: "waste" }, destKind: "tableau", description: "No moves available — try drawing from stock or start a new game." });
  };

  const handleSourceClick = (src: FTSource) => {
    // Double-click / same source again → auto move to foundation
    if (srcEqual(sel, src)) {
      if (!commit(ftMoveToFoundation(state, src))) {
        setSel(null);
      }
      return;
    }

    if (sel) {
      // Try to move selected card to tableau column
      if (src.kind === "tableau") {
        const result = ftMoveToTableau(state, sel, src.col);
        if (result) { commit(result); return; }
      }
    }

    // Select this source
    const topCard = src.kind === "waste"
      ? state.waste[state.waste.length - 1]
      : state.tableau[src.col][state.tableau[src.col].length - 1];
    if (topCard) setSel(src);
    else setSel(null);
  };

  const handleEmptyColumnClick = (col: number) => {
    if (!sel) return;
    const result = ftMoveToTableau(state, sel, col);
    if (result) commit(result);
  };

  const handleFoundationClick = (pile: number) => {
    if (!sel) return;
    const card = sel.kind === "waste"
      ? state.waste[state.waste.length - 1]
      : state.tableau[sel.col][state.tableau[sel.col].length - 1];
    if (!card) return;
    if (!canPlaceFTFoundation(card, state.foundations[pile])) return;
    const next = ftMoveToFoundation(state, sel);
    if (next) commit(next);
  };

  const isHinted = (src: FTSource): boolean => {
    if (!hint) return false;
    return srcEqual(hint.src, src);
  };

  const time = formatTime(state.startedAt);
  const wasteTop = state.waste[state.waste.length - 1];

  return (
    <div className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16">
      {/* Top bar */}
      <div className="glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Moves <span className="font-semibold text-foreground">{state.moves}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{time}</span>
          <span className="text-muted-foreground">
            Stock <span className="font-semibold text-foreground">{state.stock.length}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={showHint} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70">
            Hint
          </button>
          <button onClick={undo} disabled={history.length === 0} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70 disabled:opacity-40">
            Undo
          </button>
          <button onClick={reset} className="rounded-lg px-2.5 py-1 text-primary-foreground transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}>
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

      <div className="game-board-glass glass mt-4 overflow-x-auto rounded-2xl p-4" ref={boardRef}>
        {/* Foundations row: 8 piles */}
        <div className="mb-3 flex justify-between">
          {/* Left: stock + waste */}
          <div className="flex gap-2 items-end">
            {/* Stock */}
            <div
              style={{ width: cardW, height: cardH, flexShrink: 0 }}
              onClick={() => commit(ftDrawFromStock(state))}
              className="cursor-pointer"
            >
              {state.stock.length > 0 ? (
                <PlayingCard
                  card={{ ...state.stock[state.stock.length - 1], faceUp: false }}
                  backSkin={skin}
                  faceStyle={face}
                  onPointerDown={e => { e.stopPropagation(); commit(ftDrawFromStock(state)); }}
                  interactive
                />
              ) : (
                <div className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-lg text-muted-foreground/50 border border-dashed border-border">
                  ⊘
                </div>
              )}
            </div>
            {/* Waste */}
            <div
              style={{ width: cardW, height: cardH, flexShrink: 0 }}
              onClick={() => handleSourceClick({ kind: "waste" })}
              className={wasteTop ? "cursor-pointer" : ""}
            >
              {wasteTop ? (
                <PlayingCard
                  card={wasteTop}
                  selected={sel?.kind === "waste"}
                  hinted={isHinted({ kind: "waste" })}
                  backSkin={skin}
                  faceStyle={face}
                  onPointerDown={e => { e.stopPropagation(); handleSourceClick({ kind: "waste" }); }}
                  interactive
                />
              ) : (
                <div className="slot-empty h-full w-full rounded-[var(--card-radius)]" />
              )}
            </div>
          </div>

          {/* Right: 8 foundation piles */}
          <div className="flex gap-1 items-end flex-wrap justify-end" style={{ maxWidth: cardW * 8 + 7 * 4 }}>
            {state.foundations.map((pile, i) => {
              const top = pile[pile.length - 1];
              return (
                <div
                  key={i}
                  style={{ width: cardW, height: cardH }}
                  onClick={() => handleFoundationClick(i)}
                  className="cursor-pointer"
                >
                  {top ? (
                    <PlayingCard card={top} backSkin={skin} faceStyle={face} interactive={false} />
                  ) : (
                    <div className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-xs text-muted-foreground/50 border border-dashed border-border">
                      A
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tableau: 10 columns */}
        <div className="flex gap-1" style={{ gap: cardGap }}>
          {state.tableau.map((col, colIdx) => {
            const isSrcCol = sel?.kind === "tableau" && sel.col === colIdx;
            const topCard = col[col.length - 1];
            const hintedCol = hint?.destKind === "tableau" && hint.destIndex === colIdx;
            return (
              <div
                key={colIdx}
                style={{ width: cardW, flexShrink: 0 }}
                className="relative"
              >
                {col.length === 0 ? (
                  <div
                    style={{ width: cardW, height: cardH }}
                    onClick={() => handleEmptyColumnClick(colIdx)}
                    className={`slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-xs text-muted-foreground/30 border border-dashed border-border cursor-pointer ${hintedCol ? "ring-2 ring-[var(--neon)]" : ""}`}
                  />
                ) : (
                  <div className="relative" style={{ height: cardH + (col.length - 1) * Math.max(16, Math.round(cardH * 0.18)) }}>
                    {col.map((card, idx) => {
                      const isTop = idx === col.length - 1;
                      const offset = idx * Math.max(16, Math.round(cardH * 0.18));
                      return (
                        <div
                          key={card.id}
                          style={{ position: "absolute", top: offset, width: cardW, height: cardH }}
                          onClick={isTop ? () => handleSourceClick({ kind: "tableau", col: colIdx }) : undefined}
                          className={isTop ? "cursor-pointer" : ""}
                        >
                          <PlayingCard
                            card={card}
                            selected={isTop && isSrcCol}
                            hinted={isTop && (isHinted({ kind: "tableau", col: colIdx }) || hintedCol)}
                            backSkin={skin}
                            faceStyle={face}
                            onPointerDown={isTop ? e => { e.stopPropagation(); handleSourceClick({ kind: "tableau", col: colIdx }); } : undefined}
                            interactive={isTop}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {state.won && (
        <WinBanner message={`All 104 cards on foundations in ${state.moves} moves!`} onNew={reset} />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Click stock to draw. Click a card then a destination to move. Build tableau down in same suit. Move Aces to foundations first.
      </p>
    </div>
  );
}
