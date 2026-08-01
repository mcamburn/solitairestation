import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import {
  newBakersDozenGame,
  bdMoveToTableau,
  bdMoveToFoundation,
  findBakersDozenHint,
  type BakersDozenState,
  type BakersDozenHint,
} from "@/lib/bakersdozen";
import { rankLabel, suitGlyph, type Card } from "@/lib/solitaire";
import { PlayingCard } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { WinBanner } from "./WinBanner";
import { useDragMode, DragModeToggle } from "./DragModeToggle";

const CARD_W = 64;
const CARD_H = 92;
const CARD_OVERLAP = 24;
const DRAG_THRESHOLD = 6;

type DragInfo = {
  srcCol: number;
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

export function BakersDozn() {
  const [state, setState] = useState<BakersDozenState | null>(null);
  const [history, setHistory] = useState<BakersDozenState[]>([]);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [hint, setHint] = useState<BakersDozenHint | null>(null);
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [, forceUpdate] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const { dragMode, toggleDragMode } = useDragMode();
  const dragRef = useRef<DragInfo | null>(null);
  const commitDragRef = useRef<(dr: DragInfo, zone: string) => void>(() => {});
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [draggingSrc, setDraggingSrc] = useState<number | null>(null);

  useEffect(() => {
    const saved = loadGame<BakersDozenState>("bakersdozen");
    if (saved && saved.moves > 0) setState(saved);
    else setState(newBakersDozenGame());
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("bakersdozen", state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const stateLoaded = state !== null;
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setScale(Math.min(1, w / 880));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stateLoaded]);

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

  const game = state;
  const cardW = Math.max(28, Math.round(CARD_W * scale));
  const cardH = Math.round(cardW * 10 / 7);
  const overlap = Math.max(12, Math.round(CARD_OVERLAP * scale));
  const colGap = Math.max(2, Math.round(4 * scale));

  const commit = (next: BakersDozenState | null) => {
    if (!next) return false;
    setHistory(h => [...h.slice(-30), game]);
    setState(next);
    setSelectedCol(null);
    setHint(null);
    return true;
  };

  commitDragRef.current = (dr: DragInfo, zone: string) => {
    if (zone.startsWith("foundation")) {
      commit(bdMoveToFoundation(game, dr.srcCol));
    } else if (zone.startsWith("tableau-")) {
      const destCol = parseInt(zone.slice(8), 10);
      commit(bdMoveToTableau(game, dr.srcCol, destCol));
    }
  };

  const undo = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      setState(h[h.length - 1]);
      setSelectedCol(null);
      setHint(null);
      return h.slice(0, -1);
    });
  };

  const reset = () => {
    clearGame("bakersdozen");
    setHistory([]);
    setSelectedCol(null);
    setHint(null);
    setState(newBakersDozenGame());
    showToast();
  };

  const showHint = () => {
    const h = findBakersDozenHint(game);
    setHint(h ?? { srcCol: -1, description: "No moves available — try undoing or starting a new game." });
  };

  const handleColumnClick = (col: number) => {
    const colCards = game.tableau[col];
    if (selectedCol === null) {
      if (colCards.length > 0) { setSelectedCol(col); setHint(null); }
      return;
    }
    if (selectedCol === col) { setSelectedCol(null); return; }
    const moved = bdMoveToTableau(game, selectedCol, col);
    if (moved) { commit(moved); return; }
    if (colCards.length > 0) setSelectedCol(col);
    else setSelectedCol(null);
  };

  const startDrag = (e: React.PointerEvent<Element>, col: number, card: Card) => {
    if (!dragMode) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      srcCol: col, card,
      startX: e.clientX, startY: e.clientY,
      offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top,
      cardW: rect.width, cardH: cardH,
      moved: false, onTap: () => handleColumnClick(col),
    };
    setDraggingSrc(col);
    setGhostPos({ x: e.clientX, y: e.clientY });
  };

  const isDragging = ghostPos !== null;
  const dropHighlight = (zone: string) =>
    dropZone === zone ? "ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-transparent" : "";

  const totalFoundationCards = game.foundations.reduce((sum, p) => sum + p.length, 0);

  return (
    <div
      className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16"
      style={isDragging ? { userSelect: "none", touchAction: "none" } : undefined}
    >
      {/* Top bar */}
      <div className="glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Moves <span className="font-semibold text-foreground">{game.moves}</span></span>
          <span className="tabular-nums text-muted-foreground">{formatTime(game.startedAt)}</span>
          <span className="text-muted-foreground">Foundation <span className="font-semibold text-foreground">{totalFoundationCards}/52</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={showHint} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70">Hint</button>
          <button onClick={undo} disabled={history.length === 0} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70 disabled:opacity-40">Undo</button>
          <button onClick={reset} className="rounded-xl px-2.5 py-1 text-primary-foreground transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}>New Game</button>
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

      {/* Foundations */}
      <div className="glass mt-4 rounded-2xl p-3 sm:p-4">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Foundations</div>
        <div className="flex gap-2">
          {game.foundations.map((pile, i) => {
            const top = pile[pile.length - 1];
            const zone = `foundation-${i}`;
            return (
              <div
                key={i}
                data-drop-zone={zone}
                style={{ width: cardW, height: cardH }}
                className={`card-slot-container cursor-pointer rounded-[var(--card-radius)] ${dropHighlight(zone)}`}
                onClick={() => selectedCol !== null && commit(bdMoveToFoundation(game, selectedCol))}
                title={top ? `${rankLabel(top.rank)}${suitGlyph(top.suit)}` : "Empty foundation"}
              >
                {top ? (
                  <PlayingCard
                    card={top} backSkin={skin} faceStyle={face} interactive
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      if (!dragMode && selectedCol !== null) commit(bdMoveToFoundation(game, selectedCol));
                    }}
                    onDoubleClick={() => commit(bdMoveToFoundation(game, i))}
                  />
                ) : (
                  <div
                    className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-lg text-muted-foreground/40"
                  >
                    A
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tableau */}
      <div className="game-board-glass glass mt-3 overflow-x-auto rounded-2xl p-3 sm:p-4">
        <div ref={boardRef}>
          <div className="flex" style={{ gap: colGap }}>
            {game.tableau.map((col, colIdx) => {
              const isSelected = selectedCol === colIdx;
              const isHintSrc = hint?.srcCol === colIdx && hint.destCol === undefined;
              const isHintDest = hint?.destCol === colIdx;
              const colHeight = col.length === 0 ? cardH : cardH + (col.length - 1) * overlap;
              const zone = `tableau-${colIdx}`;

              return (
                <div
                  key={colIdx}
                  data-drop-zone={zone}
                  style={{ width: cardW, position: "relative", height: colHeight + 4 }}
                  onClick={() => !dragMode && handleColumnClick(colIdx)}
                  className={`cursor-pointer rounded-[var(--card-radius)] ${dropHighlight(zone)}`}
                  title={`Column ${colIdx + 1}${col.length > 0 ? ` — ${col.length} cards` : " — empty"}`}
                >
                  {col.length === 0 ? (
                    <div className="slot-empty h-full w-full rounded-[var(--card-radius)]" style={{ height: cardH, width: cardW }} />
                  ) : (
                    col.map((card, cardIdx) => {
                      const isTop = cardIdx === col.length - 1;
                      const isHinted = (isHintSrc || isHintDest) && isTop;
                      const isDraggingThis = draggingSrc === colIdx;
                      return (
                        <div
                          key={card.id}
                          style={{
                            position: "absolute", top: cardIdx * overlap,
                            width: cardW, height: cardH, zIndex: cardIdx,
                            opacity: isTop && isDraggingThis ? 0.35 : 1,
                          }}
                        >
                          <PlayingCard
                            card={card}
                            selected={isSelected && isTop}
                            hinted={isHinted}
                            backSkin={skin} faceStyle={face}
                            interactive={isTop}
                            onPointerDown={isTop ? (e) => startDrag(e, colIdx, card) : undefined}
                            onDoubleClick={isTop ? () => commit(bdMoveToFoundation(game, colIdx)) : undefined}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {game.won && (
        <WinBanner message={`Baker's Dozen solved in ${game.moves} moves!`} onNew={reset} />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {dragMode
          ? "Drag a column's top card to move it. Double-click to send to foundation."
          : "Click a column to select its top card, then click a destination. Double-click to send to foundation."}
      </p>

      <DragModeToggle
        dragMode={dragMode}
        onToggle={toggleDragMode}
        dragHint="Drag a column's top card to another column or foundation"
        clickHint="Click a column to select its top card, then click a destination"
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
