import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import { recordWin, recordLoss, type GameStats } from "@/lib/stats";
import { useGameTopBarStats } from "@/hooks/useGameTopBarStats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import {
  newCanfieldGame,
  cloneCanfield,
  cfDrawFromStock,
  cfMoveWasteToFoundation,
  cfMoveReserveToFoundation,
  cfMoveWasteToTableau,
  cfMoveReserveToTableau,
  cfMoveTableauToTableau,
  cfMoveTableauToFoundation,
  findCanfieldHint,
  type CanfieldState,
  type CanfieldHint,
} from "@/lib/canfield";
import { rankLabel, suitGlyph, type Card } from "@/lib/solitaire";
import { PlayingCard } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { DailyWinBanner } from "./DailyWinBanner";
import { useDragMode, DragModeToggle } from "./DragModeToggle";

const CARD_W = 74;
const CARD_H = 106;
const CARD_OVERLAP = 26;
const DRAG_THRESHOLD = 6;

function formatTime(startedAt: number): string {
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type SelectionSource =
  | { kind: "waste" }
  | { kind: "reserve" }
  | { kind: "tableau"; col: number; fromIndex: number };

type DragSrc =
  | { kind: "waste" }
  | { kind: "reserve" }
  | { kind: "tableau"; col: number };

type DragInfo = {
  src: DragSrc;
  card: Card;
  startX: number; startY: number;
  offsetX: number; offsetY: number;
  cardW: number; cardH: number;
  moved: boolean;
  onTap: () => void;
};

export function Canfield() {
  const [state, setState] = useState<CanfieldState | null>(null);
  const [history, setHistory] = useState<CanfieldState[]>([]);
  const [selection, setSelection] = useState<SelectionSource | null>(null);
  const [hint, setHint] = useState<CanfieldHint | null>(null);
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [, forceUpdate] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const statsRef = useRef(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const topBarStats = useGameTopBarStats("canfield");
  const dailyModeRef = useRef(false);
  const { dailySeed, dailyTrigger, onDailyWin } = useDailyChallenge();

  useEffect(() => {
    if (!state?.won || statsRef.current) return;
    statsRef.current = true;
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    setGameStats(recordWin("canfield", elapsed, state.moves, dailyModeRef.current));
    if (dailyModeRef.current) { onDailyWin(); dailyModeRef.current = false; }
    setHistory([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.won]);

  const { dragMode, toggleDragMode } = useDragMode();
  const dragRef = useRef<DragInfo | null>(null);
  const commitDragRef = useRef<(dr: DragInfo, zone: string) => void>(() => {});
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [draggingSrc, setDraggingSrc] = useState<DragSrc | null>(null);

  useEffect(() => {
    const saved = loadGame<CanfieldState>("canfield");
    if (saved && saved.moves > 0) {
      setState(saved);
      if (saved.won) statsRef.current = true;
    } else setState(newCanfieldGame());
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("canfield", state);
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
      setScale(Math.min(1, w / 680));
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

  const reset = (seed?: number) => {
    if (state && state.moves > 0 && !state.won && !statsRef.current) {
      setGameStats(recordLoss("canfield", state.moves, dailyModeRef.current));
    }
    if (!seed) dailyModeRef.current = false;
    clearGame("canfield");
    statsRef.current = false;
    setGameStats(null);
    setHistory([]);
    setSelection(null);
    setHint(null);
    setState(newCanfieldGame(seed));
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
  const cardW = Math.max(28, Math.round(CARD_W * scale));
  const cardH = Math.round(cardW < 70 ? cardW * 1.5 : cardW * 10 / 7);
  const overlap = Math.max(14, Math.round(CARD_OVERLAP * scale));
  const colGap = Math.max(4, Math.round(8 * scale));

  const commit = (next: CanfieldState | null): boolean => {
    if (!next) return false;
    setHistory(h => [...h.slice(-30), game]);
    setState(next);
    setSelection(null);
    setHint(null);
    return true;
  };

  commitDragRef.current = (dr: DragInfo, zone: string) => {
    const src = dr.src;
    if (zone.startsWith("foundation")) {
      if (src.kind === "waste") commit(cfMoveWasteToFoundation(game));
      else if (src.kind === "reserve") commit(cfMoveReserveToFoundation(game));
      else if (src.kind === "tableau") commit(cfMoveTableauToFoundation(game, src.col));
    } else if (zone.startsWith("tableau-")) {
      const col = parseInt(zone.slice(8), 10);
      if (src.kind === "waste") commit(cfMoveWasteToTableau(game, col));
      else if (src.kind === "reserve") commit(cfMoveReserveToTableau(game, col));
      else if (src.kind === "tableau") commit(cfMoveTableauToTableau(game, src.col, game.tableau[src.col].length - 1, col));
    }
  };

  const undo = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      setState(h[h.length - 1]);
      setSelection(null);
      setHint(null);
      return h.slice(0, -1);
    });
  };

  const showHint = () => {
    const h = findCanfieldHint(game);
    setHint(h ?? { kind: "draw", description: "No moves available — try undoing or starting a new game." });
  };

  const applySelection = (dest: "foundation" | { tableauCol: number }): boolean => {
    if (!selection) return false;
    if (dest === "foundation") {
      if (selection.kind === "waste") return commit(cfMoveWasteToFoundation(game));
      if (selection.kind === "reserve") return commit(cfMoveReserveToFoundation(game));
      if (selection.kind === "tableau") return commit(cfMoveTableauToFoundation(game, selection.col));
    } else {
      const col = dest.tableauCol;
      if (selection.kind === "waste") return commit(cfMoveWasteToTableau(game, col));
      if (selection.kind === "reserve") return commit(cfMoveReserveToTableau(game, col));
      if (selection.kind === "tableau") return commit(cfMoveTableauToTableau(game, selection.col, selection.fromIndex, col));
    }
    return false;
  };

  const handleStockClick = () => { commit(cfDrawFromStock(game)); };

  const handleWasteClick = () => {
    if (selection?.kind === "waste") { setSelection(null); return; }
    if (commit(cfMoveWasteToFoundation(game))) return;
    const wasteTop = game.waste[game.waste.length - 1];
    if (wasteTop) setSelection({ kind: "waste" });
  };

  const handleWasteDblClick = () => { commit(cfMoveWasteToFoundation(game)); };

  const handleReserveClick = () => {
    if (selection?.kind === "reserve") { setSelection(null); return; }
    if (selection) setSelection(null);
    const reserveTop = game.reserve[game.reserve.length - 1];
    if (reserveTop) setSelection({ kind: "reserve" });
  };

  const handleReserveDblClick = () => { commit(cfMoveReserveToFoundation(game)); };

  const handleFoundationClick = (pileIdx: number) => {
    if (!selection) return;
    if (selection.kind === "waste") commit(cfMoveWasteToFoundation(game));
    else if (selection.kind === "reserve") commit(cfMoveReserveToFoundation(game));
    else if (selection.kind === "tableau") {
      const s = cloneCanfield(game);
      const col = s.tableau[selection.col];
      if (!col[col.length - 1]) return;
      if (selection.fromIndex !== col.length - 1) return;
      commit(cfMoveTableauToFoundation(game, selection.col));
    }
  };

  const handleTableauClick = (col: number, cardIndex: number) => {
    setHint(null);
    const colCards = game.tableau[col];
    if (selection) {
      if (selection.kind === "tableau" && selection.col === col) { setSelection(null); return; }
      const moved = applySelection({ tableauCol: col });
      if (moved) return;
      if (colCards.length > 0 && cardIndex < colCards.length) setSelection({ kind: "tableau", col, fromIndex: cardIndex });
      else setSelection(null);
      return;
    }
    if (colCards.length === 0) return;
    const idx = Math.min(cardIndex, colCards.length - 1);
    setSelection({ kind: "tableau", col, fromIndex: idx });
  };

  const handleTableauDblClick = (col: number) => { commit(cfMoveTableauToFoundation(game, col)); };

  const handleEmptyTableauClick = (col: number) => {
    if (!selection) return;
    applySelection({ tableauCol: col });
  };

  const startDrag = (e: React.PointerEvent<Element>, src: DragSrc, card: Card, onTap: () => void) => {
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

  const wasteTop = game.waste[game.waste.length - 1];
  const reserveTop = game.reserve[game.reserve.length - 1];
  const totalFoundationCards = game.foundations.reduce((sum, p) => sum + p.length, 0);

  const isSelWaste = selection?.kind === "waste";
  const isSelReserve = selection?.kind === "reserve";
  const hintedTableauCol = hint?.srcCol;
  const hintedTableauFromIndex = hint?.fromIndex;
  const hintedTableauDest = hint?.destCol;

  const isDraggingWaste = draggingSrc?.kind === "waste";
  const isDraggingReserve = draggingSrc?.kind === "reserve";

  return (
    <div
      className="game-board-wrap mx-auto w-full sm:max-w-[900px] xl:max-w-[1200px] sm:px-4 xl:px-6 pb-16"
      style={isDragging ? { userSelect: "none", touchAction: "none" } : undefined}
    >
      {/* Top bar */}
      <div className="game-controls glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Moves <span className="font-semibold text-foreground">{game.moves}</span></span>
          <span className="tabular-nums text-muted-foreground">{formatTime(game.startedAt)}</span>
          <span className="text-muted-foreground">Foundation <span className="font-semibold text-foreground">{totalFoundationCards}/52</span></span>
          {topBarStats.hasPlayed && (
            <span className="hidden sm:inline text-muted-foreground">Streak <span className="font-semibold tabular-nums" style={{ color: "var(--neon)" }}>{topBarStats.streak}</span></span>
          )}
          {topBarStats.hasPlayed && (
            <span className="hidden sm:inline text-muted-foreground"><span className="font-semibold tabular-nums" style={{ color: "var(--neon)" }}>{topBarStats.winRate}%</span> wins</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={showHint} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70">Hint</button>
          <button onClick={undo} disabled={history.length === 0} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70 disabled:opacity-40">Undo</button>
          <button onClick={() => reset()} className="rounded-xl px-2.5 py-1 text-primary-foreground transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}>New Game</button>
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

      {/* Game board */}
      <div className="game-board-glass glass mt-4 overflow-x-auto rounded-2xl p-3 sm:p-5" style={{ touchAction: "pan-x" }}>
        <div ref={boardRef}>
          {/* Top row: Stock, Waste, Reserve, gap, Foundations × 4 */}
          <div className="flex items-start" style={{ gap: colGap }}>
            {/* Stock */}
            <div
              style={{ width: cardW, height: cardH, flexShrink: 0 }}
              onClick={handleStockClick}
              className="card-slot-container cursor-pointer"
              title="Draw from stock"
            >
              {game.stock.length > 0 ? (
                <PlayingCard
                  card={{ ...game.stock[game.stock.length - 1], faceUp: false }}
                  backSkin={skin} faceStyle={face} interactive
                  onPointerDown={e => { e.stopPropagation(); handleStockClick(); }}
                />
              ) : (
                <div className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-xl text-muted-foreground/50 cursor-pointer" onClick={handleStockClick} title="Recycle waste">↺</div>
              )}
            </div>

            {/* Waste */}
            <div
              style={{ width: cardW, height: cardH, flexShrink: 0, opacity: isDraggingWaste ? 0.35 : 1, touchAction: wasteTop && dragMode ? "none" : undefined }}
              onClick={() => !dragMode && handleWasteClick()}
              className={`card-slot-container${wasteTop ? " cursor-pointer" : ""}`}
              title="Waste pile"
            >
              {wasteTop ? (
                <PlayingCard
                  card={wasteTop}
                  selected={isSelWaste}
                  hinted={hint?.kind === "waste-to-foundation" || hint?.kind === "waste-to-tableau"}
                  backSkin={skin} faceStyle={face} interactive
                  onPointerDown={e => startDrag(e, { kind: "waste" }, wasteTop, handleWasteClick)}
                  onDoubleClick={handleWasteDblClick}
                />
              ) : (
                <div className="slot-empty h-full w-full rounded-[var(--card-radius)]" />
              )}
            </div>

            {/* Reserve */}
            <div
              style={{ width: cardW, height: cardH, flexShrink: 0, position: "relative", opacity: isDraggingReserve ? 0.35 : 1 }}
              className="cursor-pointer"
              onClick={() => !dragMode && handleReserveClick()}
              title={`Reserve (${game.reserve.length} cards)`}
            >
              {game.reserve.length > 1 && (
                <div style={{
                  position: "absolute", top: 4, left: 4,
                  width: cardW, height: cardH,
                  borderRadius: "var(--card-radius, 8px)",
                  background: "var(--surface, #1e293b)",
                  border: "1px solid var(--border)", zIndex: 0,
                }} />
              )}
              {reserveTop ? (
                <div className="card-slot-container" style={{ position: "relative", zIndex: 1, width: cardW, height: cardH, touchAction: dragMode ? "none" : undefined }}>
                  <PlayingCard
                    card={reserveTop}
                    selected={isSelReserve}
                    hinted={hint?.kind === "reserve-to-foundation" || hint?.kind === "reserve-to-tableau"}
                    backSkin={skin} faceStyle={face} interactive
                    onPointerDown={e => startDrag(e, { kind: "reserve" }, reserveTop, handleReserveClick)}
                    onDoubleClick={handleReserveDblClick}
                  />
                </div>
              ) : (
                <div className="slot-empty h-full w-full rounded-[var(--card-radius)]" />
              )}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Foundations × 4 */}
            {game.foundations.map((pile, i) => {
              const top = pile[pile.length - 1];
              const baseLabel = rankLabel(game.baseRank);
              const zone = `foundation-${i}`;
              return (
                <div
                  key={i}
                  data-drop-zone={zone}
                  style={{ width: cardW, height: cardH, flexShrink: 0 }}
                  className={`card-slot-container cursor-pointer rounded-[var(--card-radius)] ${dropHighlight(zone)}`}
                  onClick={() => handleFoundationClick(i)}
                  title={top ? `Foundation ${i + 1}: ${rankLabel(top.rank)}${suitGlyph(top.suit)}` : `Foundation ${i + 1} (starts at ${baseLabel})`}
                >
                  {top ? (
                    <PlayingCard card={top} backSkin={skin} faceStyle={face} />
                  ) : (
                    <div className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-sm font-bold text-muted-foreground/40" onClick={() => handleFoundationClick(i)}>
                      {baseLabel}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tableau */}
          <div className="mt-4 flex items-start" style={{ gap: colGap }}>
            {game.tableau.map((col, colIdx) => {
              const colHeight = col.length === 0 ? cardH : cardH + (col.length - 1) * overlap;
              const isSelCol = selection?.kind === "tableau" && selection.col === colIdx;
              const selFromIndex = isSelCol && selection?.kind === "tableau" ? selection.fromIndex : -1;
              const zone = `tableau-${colIdx}`;
              const isDraggingThisCol = draggingSrc?.kind === "tableau" && draggingSrc.col === colIdx;

              return (
                <div
                  key={colIdx}
                  data-drop-zone={zone}
                  style={{ width: cardW, position: "relative", height: colHeight + 4, flexShrink: 0 }}
                  className={`rounded-[var(--card-radius)] ${dropHighlight(zone)}`}
                >
                  {col.length === 0 ? (
                    <div
                      className="slot-empty h-full w-full rounded-[var(--card-radius)] cursor-pointer"
                      style={{ height: cardH, width: cardW }}
                      onClick={() => handleEmptyTableauClick(colIdx)}
                      title={`Empty column ${colIdx + 1}`}
                    />
                  ) : (
                    col.map((card, cardIdx) => {
                      const isTop = cardIdx === col.length - 1;
                      const isSelected = isSelCol && cardIdx >= selFromIndex;
                      const isHintedSrc = hintedTableauCol === colIdx && hintedTableauFromIndex !== undefined && cardIdx >= hintedTableauFromIndex;
                      const isHintedDest = hintedTableauDest === colIdx && isTop;
                      return (
                        <div
                          key={card.id}
                          className="card-slot-container"
                          style={{
                            position: "absolute", top: cardIdx * overlap,
                            width: cardW, height: cardH, zIndex: cardIdx,
                            opacity: isTop && isDraggingThisCol ? 0.35 : 1,
                            touchAction: isTop && dragMode ? "none" : undefined,
                          }}
                          onClick={() => !dragMode && handleTableauClick(colIdx, cardIdx)}
                        >
                          <PlayingCard
                            card={card}
                            selected={isSelected}
                            hinted={isHintedSrc || isHintedDest}
                            backSkin={skin} faceStyle={face}
                            interactive={isTop}
                            onPointerDown={isTop ? e => startDrag(e, { kind: "tableau", col: colIdx }, card, () => handleTableauClick(colIdx, cardIdx)) : undefined}
                            onDoubleClick={isTop ? () => handleTableauDblClick(colIdx) : undefined}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>

          {/* Counts */}
          <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
            <span>Stock: {game.stock.length}</span>
            <span>Waste: {game.waste.length}</span>
            <span>Reserve: {game.reserve.length}</span>
          </div>
        </div>
      </div>

      {game.won && (
        <DailyWinBanner message={`Canfield won in ${game.moves} moves!`} onNew={reset} stats={gameStats} />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        {dragMode
          ? "Drag from waste, reserve, or tableau to move. Double-click to send to foundation."
          : "Click to select, click destination to move. Double-click to send to foundation. Draw 3 from stock."}
      </p>

      <DragModeToggle
        dragMode={dragMode}
        onToggle={toggleDragMode}
        dragHint="Drag from waste, reserve, or tableau to a destination"
        clickHint="Click to select, then click a destination to move. Double-click for foundation."
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
