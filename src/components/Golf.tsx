import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import {
  newGolfGame,
  playTableauCard,
  drawGolfStock,
  isGolfGameOver,
  tableauCardCount,
  findGolfHint,
  canPlayOnWaste,
  type GolfState,
  type GolfHint,
} from "@/lib/golf";
import { rankLabel, suitGlyph, type Card } from "@/lib/solitaire";
import { PlayingCard } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { WinBanner } from "./WinBanner";
import { useDragMode, DragModeToggle } from "./DragModeToggle";

const CARD_W = 72;
const CARD_H = 103;
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

export function Golf() {
  const [state, setState] = useState<GolfState | null>(null);
  const [history, setHistory] = useState<GolfState[]>([]);
  const [hint, setHint] = useState<GolfHint | null>(null);
  const [gameOver, setGameOver] = useState(false);
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
    const saved = loadGame<GolfState>("golf");
    if (saved && saved.moves > 0) {
      setState(saved);
      setGameOver(isGolfGameOver(saved));
    } else {
      if (saved) clearGame("golf");
      setState(newGolfGame());
    }
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("golf", state);
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
      setScale(Math.min(1, w / 552));
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
  const cardW = Math.max(32, Math.round(CARD_W * scale));
  const cardH = Math.round(cardW * 10 / 7);
  const cardGap = Math.max(2, Math.round(8 * scale));

  commitDragRef.current = (dr: DragInfo, zone: string) => {
    if (zone === "waste") commit(playTableauCard(game, dr.srcCol));
  };

  const commit = (next: GolfState | null) => {
    if (!next) return false;
    setHistory(h => [...h.slice(-30), game]);
    setState(next);
    setHint(null);
    setGameOver(isGolfGameOver(next));
    return true;
  };

  const undo = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setState(prev);
      setHint(null);
      setGameOver(isGolfGameOver(prev));
      return h.slice(0, -1);
    });
  };

  const reset = () => {
    clearGame("golf");
    setHistory([]);
    setHint(null);
    setGameOver(false);
    setState(newGolfGame());
    showToast();
  };

  const showHint = () => {
    const h = findGolfHint(game);
    setHint(h ?? { col: -1, description: "No moves available — draw from stock or start a new game." });
  };

  const handleColClick = (col: number) => {
    commit(playTableauCard(game, col));
  };

  const handleStockClick = () => {
    commit(drawGolfStock(game));
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
      moved: false, onTap: () => handleColClick(col),
    };
    setDraggingSrc(col);
    setGhostPos({ x: e.clientX, y: e.clientY });
  };

  const isDragging = ghostPos !== null;
  const dropHighlight = (zone: string) =>
    dropZone === zone ? "ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-transparent" : "";

  const time = formatTime(game.startedAt);
  const wasteTop = game.waste[game.waste.length - 1];
  const remaining = tableauCardCount(game);

  return (
    <div
      className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16"
      style={isDragging ? { userSelect: "none", touchAction: "none" } : undefined}
    >
      {/* Top bar */}
      <div className="glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Moves <span className="font-semibold text-foreground">{game.moves}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{time}</span>
          <span className="text-muted-foreground">
            Cards remaining: <span className="font-semibold text-foreground">{remaining}</span>
          </span>
          <span className="text-muted-foreground">
            Stock <span className="font-semibold text-foreground">{game.stock.length}</span>
          </span>
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
      <DragModeToggle
        dragMode={dragMode}
        onToggle={toggleDragMode}
        dragHint="Drag tableau cards onto the waste pile"
        clickHint="Click a tableau card to play it onto the waste pile"
      />
      <NewGameToast visible={toastVisible} skin={skin} face={face} />

      {/* Board */}
      <div className="game-board-glass glass mt-4 overflow-x-auto rounded-2xl p-4 sm:p-6">
        <div ref={boardRef}>
          {/* Tableau columns */}
          <div className="flex items-end justify-center" style={{ gap: cardGap }}>
            {game.tableau.map((col, colIdx) => {
              const topCard = col[col.length - 1];
              const isHinted = hint?.col === colIdx;
              const isPlayable = topCard && wasteTop ? canPlayOnWaste(topCard.rank, wasteTop.rank) : false;
              const isDraggingThis = draggingSrc === colIdx;

              return (
                <div
                  key={colIdx}
                  className="relative flex flex-col cursor-pointer select-none"
                  style={{ width: cardW, minHeight: cardH }}
                  onClick={() => !dragMode && handleColClick(colIdx)}
                >
                  {col.length === 0 ? (
                    <div
                      className="slot-empty flex items-center justify-center rounded-[var(--card-radius)] text-muted-foreground/30"
                      style={{ width: cardW, height: cardH, border: "2px dashed" }}
                    >
                      ✓
                    </div>
                  ) : (
                    col.map((card, cardIdx) => {
                      const isTop = cardIdx === col.length - 1;
                      const overlap = Math.max(8, Math.round(cardH * 0.22));
                      return (
                        <div
                          key={card.id}
                          style={{
                            position: cardIdx === 0 ? "relative" : "absolute",
                            top: cardIdx === 0 ? undefined : cardIdx * overlap,
                            zIndex: cardIdx,
                            width: cardW,
                            height: cardH,
                            opacity: isTop && isDraggingThis ? 0.35 : 1,
                          }}
                        >
                          <PlayingCard
                            card={card}
                            hinted={isTop && isHinted}
                            selected={isTop && isPlayable && !game.won}
                            backSkin={skin}
                            faceStyle={face}
                            interactive={isTop}
                            onPointerDown={isTop ? (e) => {
                              if (dragMode) startDrag(e, colIdx, card);
                              else { e.stopPropagation(); handleColClick(colIdx); }
                            } : undefined}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>

          {/* Stock + Waste */}
          <div className="mt-8 flex items-center justify-center gap-6">
            {/* Stock */}
            <div className="flex flex-col items-center gap-1">
              <div style={{ width: cardW, height: cardH }} onClick={handleStockClick} className="card-slot-container cursor-pointer">
                {game.stock.length > 0 ? (
                  <PlayingCard
                    card={{ ...game.stock[game.stock.length - 1], faceUp: false }}
                    backSkin={skin}
                    faceStyle={face}
                    onPointerDown={e => { e.stopPropagation(); handleStockClick(); }}
                    interactive
                  />
                ) : (
                  <div className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-2xl text-muted-foreground/40" title="Stock empty">∅</div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{game.stock.length} left</span>
            </div>

            {/* Waste — drop target */}
            <div className="flex flex-col items-center gap-1">
              <div
                data-drop-zone="waste"
                style={{ width: cardW, height: cardH }}
                className={`card-slot-container rounded-[var(--card-radius)] ${dropHighlight("waste")}`}
              >
                {wasteTop ? (
                  <PlayingCard card={wasteTop} backSkin={skin} faceStyle={face} />
                ) : (
                  <div className="slot-empty h-full w-full rounded-[var(--card-radius)]" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {wasteTop ? `${rankLabel(wasteTop.rank)}${suitGlyph(wasteTop.suit)}` : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {gameOver && !game.won && (
        <WinBanner
          variant="stuck"
          message={`Game over — ${remaining} card${remaining !== 1 ? "s" : ""} remaining in tableau.`}
          onNew={reset}
        />
      )}
      {game.won && (
        <WinBanner message={`Golf cleared in ${game.moves} moves! All tableau cards played.`} onNew={reset} />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Play tableau top cards ±1 from waste top. Click stock to draw. No wrapping (Ace ≠ King).
      </p>

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
            transform: "rotate(3deg)",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.55))",
          }}
        >
          <PlayingCard card={dragRef.current.card} backSkin={skin} faceStyle={face} />
        </div>
      )}
    </div>
  );
}
