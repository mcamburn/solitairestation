import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import { recordWin, type GameStats } from "@/lib/stats";
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
import { type Card } from "@/lib/solitaire";
import { PlayingCard } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { WinBanner } from "./WinBanner";
import { useDragMode, DragModeToggle } from "./DragModeToggle";

const SAVE_KEY = "fortythieves";
const DRAG_THRESHOLD = 6;

type DragInfo = {
  src: FTSource;
  card: Card;
  startX: number; startY: number;
  offsetX: number; offsetY: number;
  cardW: number; cardH: number;
  moved: boolean;
  onTap: () => void;
};

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
  const statsRef = useRef(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);

  useEffect(() => {
    if (!state?.won || statsRef.current) return;
    statsRef.current = true;
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    setGameStats(recordWin(SAVE_KEY, elapsed));
    setHistory([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.won]);

  const { dragMode, toggleDragMode } = useDragMode();
  const dragRef = useRef<DragInfo | null>(null);
  const commitDragRef = useRef<(dr: DragInfo, zone: string) => void>(() => {});
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [draggingSrc, setDraggingSrc] = useState<FTSource | null>(null);

  useEffect(() => {
    const saved = loadGame<FortyThievesState>(SAVE_KEY);
    if (saved && saved.moves > 0) {
      setState(saved);
      if (saved.won) statsRef.current = true;
    } else setState(newFortyThievesGame());
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
      const w = el.getBoundingClientRect().width - 32;
      const computed = Math.floor((w - cardGap * 9) / 10);
      setCardW(Math.max(36, Math.min(computed, 80)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [state !== null]);

  // Global pointer handlers for drag
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const dr = dragRef.current;
      if (!dr) return;
      if (Math.hypot(e.clientX - dr.startX, e.clientY - dr.startY) > DRAG_THRESHOLD) dr.moved = true;
      setGhostPos({ x: e.clientX, y: e.clientY });
      const els = document.elementsFromPoint(e.clientX, e.clientY) as Element[];
      setDropZone(els.find(el => el.hasAttribute?.("data-drop-zone"))?.getAttribute("data-drop-zone") ?? null);
    };
    const onUp = (e: PointerEvent) => {
      const dr = dragRef.current;
      if (!dr) return;
      dragRef.current = null;
      setGhostPos(null);
      setDropZone(null);
      setDraggingSrc(null);
      if (!dr.moved) { dr.onTap(); return; }
      const els = document.elementsFromPoint(e.clientX, e.clientY) as Element[];
      const zone = els.find(el => el.hasAttribute?.("data-drop-zone"))?.getAttribute("data-drop-zone") ?? null;
      if (zone) commitDragRef.current(dr, zone);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

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

  commitDragRef.current = (dr: DragInfo, zone: string) => {
    if (zone === "waste-to-foundation" || zone.startsWith("foundation-")) {
      commit(ftMoveToFoundation(state, dr.src));
    } else if (zone.startsWith("tableau-")) {
      const col = parseInt(zone.slice(8), 10);
      commit(ftMoveToTableau(state, dr.src, col));
    }
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
    statsRef.current = false;
    setGameStats(null);
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
    if (srcEqual(sel, src)) {
      if (!commit(ftMoveToFoundation(state, src))) setSel(null);
      return;
    }
    if (sel) {
      if (src.kind === "tableau") {
        const result = ftMoveToTableau(state, sel, src.col);
        if (result) { commit(result); return; }
      }
    }
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

  const startDrag = (e: React.PointerEvent<Element>, src: FTSource, card: Card, onTap: () => void) => {
    if (!dragMode) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      src, card,
      startX: e.clientX, startY: e.clientY,
      offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top,
      cardW: rect.width, cardH: cardH,
      moved: false, onTap,
    };
    setDraggingSrc(src);
    setGhostPos({ x: e.clientX, y: e.clientY });
  };

  const isDragging = ghostPos !== null;
  const dropHighlight = (zone: string) =>
    dropZone === zone ? "ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-transparent" : "";

  const time = formatTime(state.startedAt);
  const wasteTop = state.waste[state.waste.length - 1];

  return (
    <div
      className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16"
      style={isDragging ? { userSelect: "none", touchAction: "none" } : undefined}
    >
      {/* Top bar */}
      <div className="glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Moves <span className="font-semibold text-foreground">{state.moves}</span></span>
          <span className="tabular-nums text-muted-foreground">{time}</span>
          <span className="text-muted-foreground">Stock <span className="font-semibold text-foreground">{state.stock.length}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={showHint} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70">Hint</button>
          <button onClick={undo} disabled={history.length === 0} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70 disabled:opacity-40">Undo</button>
          <button onClick={reset} className="rounded-lg px-2.5 py-1 text-primary-foreground transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}>New Game</button>
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
        {/* Foundations row */}
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
                  backSkin={skin} faceStyle={face}
                  onPointerDown={e => { e.stopPropagation(); commit(ftDrawFromStock(state)); }}
                  interactive
                />
              ) : (
                <div className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-lg text-muted-foreground/50 border border-dashed border-border">⊘</div>
              )}
            </div>
            {/* Waste */}
            <div
              style={{ width: cardW, height: cardH, flexShrink: 0 }}
              onClick={() => !dragMode && handleSourceClick({ kind: "waste" })}
              className={wasteTop ? "cursor-pointer" : ""}
            >
              {wasteTop ? (
                <PlayingCard
                  card={wasteTop}
                  selected={sel?.kind === "waste"}
                  hinted={isHinted({ kind: "waste" })}
                  backSkin={skin} faceStyle={face}
                  interactive
                  style={{ opacity: draggingSrc?.kind === "waste" ? 0.35 : 1 }}
                  onPointerDown={e => startDrag(e, { kind: "waste" }, wasteTop, () => handleSourceClick({ kind: "waste" }))}
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
              const zone = `foundation-${i}`;
              return (
                <div
                  key={i}
                  data-drop-zone={zone}
                  style={{ width: cardW, height: cardH }}
                  onClick={() => handleFoundationClick(i)}
                  className={`cursor-pointer rounded-[var(--card-radius)] ${dropHighlight(zone)}`}
                >
                  {top ? (
                    <PlayingCard card={top} backSkin={skin} faceStyle={face} interactive={false} />
                  ) : (
                    <div className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-xs text-muted-foreground/50 border border-dashed border-border">A</div>
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
            const hintedCol = hint?.destKind === "tableau" && hint.destIndex === colIdx;
            const zone = `tableau-${colIdx}`;
            return (
              <div key={colIdx} style={{ width: cardW, flexShrink: 0 }} className="relative">
                {col.length === 0 ? (
                  <div
                    data-drop-zone={zone}
                    style={{ width: cardW, height: cardH }}
                    onClick={() => handleEmptyColumnClick(colIdx)}
                    className={`slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-xs text-muted-foreground/30 border border-dashed border-border cursor-pointer ${hintedCol ? "ring-2 ring-[var(--neon)]" : ""} ${dropHighlight(zone)}`}
                  />
                ) : (
                  <div
                    data-drop-zone={zone}
                    className="relative"
                    style={{ height: cardH + (col.length - 1) * Math.max(16, Math.round(cardH * 0.18)) }}
                  >
                    {col.map((card, idx) => {
                      const isTop = idx === col.length - 1;
                      const offset = idx * Math.max(16, Math.round(cardH * 0.18));
                      const isDraggingThis = draggingSrc?.kind === "tableau" && draggingSrc.col === colIdx;
                      return (
                        <div
                          key={card.id}
                          style={{
                            position: "absolute", top: offset,
                            width: cardW, height: cardH,
                            opacity: isTop && isDraggingThis ? 0.35 : 1,
                          }}
                          onClick={isTop && !dragMode ? () => handleSourceClick({ kind: "tableau", col: colIdx }) : undefined}
                          className={isTop ? "cursor-pointer" : ""}
                        >
                          <PlayingCard
                            card={card}
                            selected={isTop && isSrcCol}
                            hinted={isTop && (isHinted({ kind: "tableau", col: colIdx }) || hintedCol)}
                            backSkin={skin} faceStyle={face}
                            onPointerDown={isTop ? e => startDrag(e, { kind: "tableau", col: colIdx }, card, () => handleSourceClick({ kind: "tableau", col: colIdx })) : undefined}
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
        <WinBanner message={`All 104 cards on foundations in ${state.moves} moves!`} onNew={reset} stats={gameStats} />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Click stock to draw. Build tableau down in same suit. Move Aces to foundations first.
      </p>

      <DragModeToggle
        dragMode={dragMode}
        onToggle={toggleDragMode}
        dragHint="Drag cards to a tableau column or foundation"
        clickHint="Click a card to select, then click a destination"
      />

      {/* Drag ghost */}
      {isDragging && dragRef.current && (
        <div
          style={{
            position: "fixed",
            left: ghostPos!.x - dragRef.current.offsetX,
            top: ghostPos!.y - dragRef.current.offsetY,
            width: dragRef.current.cardW,
            height: dragRef.current.cardH,
            pointerEvents: "none",
            zIndex: 9999,
            opacity: 0.92,
            transform: "rotate(2deg)",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.55))",
          }}
        >
          <PlayingCard card={dragRef.current.card} backSkin={skin} faceStyle={face} />
        </div>
      )}
    </div>
  );
}
