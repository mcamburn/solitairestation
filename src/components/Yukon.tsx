import { useEffect, useMemo, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import { recordWin, recordLoss, type GameStats } from "@/lib/stats";
import { useGameTopBarStats } from "@/hooks/useGameTopBarStats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import {
  newYukonGame,
  tryYukonTableauMove,
  tryYukonToFoundation,
  canYukonPlace,
  canPlaceOnFoundation,
  findYukonHint,
  type YukonHint,
  type YukonState,
} from "@/lib/yukon";
import { PlayingCard, type CardBackSkin, type CardFaceStyle } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { useDragMode, DragModeToggle } from "./DragModeToggle";
import { DailyWinBanner } from "./DailyWinBanner";
import type { Card } from "@/lib/solitaire";

const CARD_H = 110;
const CARD_W_BASE = Math.round(CARD_H * 7 / 10);
const FAN_UP = 28;
const FAN_DOWN = 8;
const DRAG_THRESHOLD = 6;

type Sel = { col: number; index: number } | null;

type DragInfo = {
  col: number;
  index: number;
  cards: Card[];
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  cardW: number;
  cardH: number;
  moved: boolean;
  onTap: () => void;
};

function formatTime(startedAt: number): string {
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function Yukon() {
  const [state, setState] = useState<YukonState | null>(null);
  const [history, setHistory] = useState<YukonState[]>([]);
  const [sel, setSel] = useState<Sel>(null);
  const [hint, setHint] = useState<YukonHint | null>(null);
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { dragMode, toggleDragMode } = useDragMode();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [, forceUpdate] = useState(0);
  const statsRef = useRef(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const topBarStats = useGameTopBarStats("yukon");
  const dailyModeRef = useRef(false);
  const { dailySeed, dailyTrigger, onDailyWin } = useDailyChallenge();

  useEffect(() => {
    if (!state?.won || statsRef.current) return;
    statsRef.current = true;
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    setGameStats(recordWin("yukon", elapsed, state.moves, dailyModeRef.current));
    if (dailyModeRef.current) { onDailyWin(); dailyModeRef.current = false; }
    setHistory([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.won]);

  // Drag state
  const dragRef = useRef<DragInfo | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<Sel>(null);
  const commitRef = useRef<(info: DragInfo, zone: string) => void>(() => {});

  useEffect(() => {
    const saved = loadGame<YukonState>("yukon");
    if (saved && saved.moves > 0) {
      setState(saved);
      if (saved.won) statsRef.current = true;
    } else {
      if (saved) clearGame("yukon");
      setState(newYukonGame());
    }
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("yukon", state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Grid measurement
  const gridRef = useRef<HTMLDivElement>(null);
  const [colW, setColW] = useState(CARD_W_BASE);
  const stateLoaded = state !== null;
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setColW(Math.max(20, Math.round((w - 6 * 6) / 7)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stateLoaded]);

  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const cardH = Math.min(Math.round(colW < 70 ? colW * 1.5 : colW * 10 / 7), Math.round(vh * 0.18));
  const fanMultiplier = Math.min(1.3, Math.max(1.0, 80 / Math.max(colW, 40)));
  const fanUp = Math.max(6, Math.round(FAN_UP * cardH / CARD_H * fanMultiplier));
  const fanDown = Math.max(3, Math.round(FAN_DOWN * cardH / CARD_H * fanMultiplier));

  // Global pointer handlers for drag
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const dr = dragRef.current;
      if (!dr) return;
      if (Math.hypot(e.clientX - dr.startX, e.clientY - dr.startY) > DRAG_THRESHOLD) dr.moved = true;
      setGhostPos({ x: e.clientX, y: e.clientY });
      const els = document.elementsFromPoint(e.clientX, e.clientY) as Element[];
      const zoneEl = els.find(el => el.hasAttribute?.("data-drop-zone"));
      setDropZone(zoneEl?.getAttribute("data-drop-zone") ?? null);
    };
    const onUp = (e: PointerEvent) => {
      const dr = dragRef.current;
      if (!dr) return;
      dragRef.current = null;
      setGhostPos(null);
      setDropZone(null);
      setDraggingFrom(null);
      if (!dr.moved) { dr.onTap(); return; }
      const els = document.elementsFromPoint(e.clientX, e.clientY) as Element[];
      const zoneEl = els.find(el => el.hasAttribute?.("data-drop-zone"));
      const zone = zoneEl?.getAttribute("data-drop-zone") ?? null;
      if (zone) commitRef.current(dr, zone);
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
      setGameStats(recordLoss("yukon", state.moves, dailyModeRef.current));
    }
    if (!seed) dailyModeRef.current = false;
    clearGame("yukon");
    statsRef.current = false;
    setGameStats(null);
    setHistory([]);
    setSel(null);
    setHint(null);
    setState(newYukonGame(seed));
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

  const commit = (next: YukonState | null) => {
    if (!next) return false;
    setHistory(h => [...h.slice(-30), game]);
    setState(next);
    setSel(null);
    setHint(null);
    return true;
  };

  commitRef.current = (dr: DragInfo, zone: string) => {
    if (zone.startsWith("col-")) {
      const destCol = parseInt(zone.slice(4), 10);
      commit(tryYukonTableauMove(game, dr.col, dr.index, destCol));
    } else if (zone.startsWith("foundation-")) {
      const fi = parseInt(zone.slice(11), 10);
      if (dr.index === game.tableau[dr.col].length - 1) {
        commit(tryYukonToFoundation(game, dr.col, fi));
      }
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

  const showHint = () => {
    const h = findYukonHint(game);
    setHint(h ?? { fromCol: -1, fromIndex: -1, toCol: -1, description: "No moves found — try starting a new game." });
  };

  const handleCardClick = (col: number, index: number) => {
    const pile = game.tableau[col];
    if (!pile || pile.length === 0) {
      // Click on empty column
      if (sel) {
        commit(tryYukonTableauMove(game, sel.col, sel.index, col));
      }
      setSel(null);
      return;
    }
    const card = pile[index];
    if (!card.faceUp) { setSel(null); return; }

    if (sel) {
      if (sel.col === col) { setSel(null); return; }
      // Try tableau move
      if (commit(tryYukonTableauMove(game, sel.col, sel.index, col))) return;
      // Try foundation (if single top card clicked)
      if (index === pile.length - 1 && sel.index === game.tableau[sel.col].length - 1) {
        if (commit(tryYukonToFoundation(game, sel.col))) return;
      }
    }
    setSel({ col, index });
  };

  const handleFoundationClick = (fi: number) => {
    if (!sel) return;
    // Only single top card can go to foundation
    if (sel.index === game.tableau[sel.col].length - 1) {
      commit(tryYukonToFoundation(game, sel.col, fi));
    }
    setSel(null);
  };

  const startDrag = (
    e: React.PointerEvent<Element>,
    col: number,
    index: number,
    cards: Card[],
    onTap: () => void,
  ) => {
    if (!dragMode) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      col, index, cards,
      startX: e.clientX, startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      cardW: rect.width, cardH: cardH,
      moved: false, onTap,
    };
    setDraggingFrom({ col, index });
    setGhostPos({ x: e.clientX, y: e.clientY });
  };

  const isDragging = ghostPos !== null;
  const time = formatTime(game.startedAt);

  return (
    <div
      className="game-board-wrap mx-auto w-full sm:max-w-[900px] xl:max-w-[1200px] sm:px-4 xl:px-6 pb-16"
      style={isDragging ? { userSelect: "none", touchAction: "none" } : undefined}
    >
      {/* Top bar */}
      <div className="game-controls glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Moves <span className="font-semibold text-foreground">{game.moves}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{time}</span>
          <span className="text-muted-foreground">
            Foundation{" "}
            <span className="font-semibold text-foreground">
              {game.foundations.reduce((s, p) => s + p.length, 0)}/52
            </span>
          </span>
          {topBarStats.hasPlayed && (
            <span className="hidden sm:inline text-muted-foreground">Streak <span className="font-semibold tabular-nums" style={{ color: "var(--neon)" }}>{topBarStats.streak}</span></span>
          )}
          {topBarStats.hasPlayed && (
            <span className="hidden sm:inline text-muted-foreground"><span className="font-semibold tabular-nums" style={{ color: "var(--neon)" }}>{topBarStats.winRate}%</span> wins</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={showHint} className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-secondary">Hint</button>
          <button onClick={undo} disabled={history.length === 0} className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-secondary disabled:opacity-40">Undo</button>
          <button onClick={() => reset()} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))", boxShadow: "0 6px 20px -8px var(--neon)" }}>New Game</button>
        </div>
      </div>

      {hint && (
        <div className="game-controls glass mt-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs" style={{ borderColor: "var(--neon)" }}>
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
      <div className="game-board-glass glass mt-4 rounded-2xl p-3 sm:p-4">
        {/* Foundations */}
        <div className="mb-3 flex gap-2 justify-end">
          {game.foundations.map((pile, fi) => {
            const top = pile[pile.length - 1];
            const isHighlighted = dropZone === `foundation-${fi}`;
            return (
              <div
                key={fi}
                data-drop-zone={`foundation-${fi}`}
                style={{ width: colW, height: cardH }}
                onClick={() => handleFoundationClick(fi)}
                className={`card-slot-container cursor-pointer rounded-[var(--card-radius)] transition-all${isHighlighted ? " ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-background" : ""}`}
              >
                {top ? (
                  <PlayingCard
                    card={top}
                    backSkin={skin}
                    faceStyle={face}
                    onPointerDown={(e) => { e.stopPropagation(); handleFoundationClick(fi); }}
                    interactive
                  />
                ) : (
                  <div
                    className={`slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-muted-foreground/40 text-sm`}
                    style={isHighlighted ? { boxShadow: "0 0 20px -2px var(--neon)" } : undefined}
                  >
                    A
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tableau */}
        <div
          ref={gridRef}
          className="grid gap-[7px] sm:gap-1.5"
          style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
        >
          {game.tableau.map((pile, col) => (
            <YukonColumn
              key={col}
              pile={pile}
              col={col}
              sel={dragMode ? null : sel}
              draggingFrom={draggingFrom}
              hint={hint}
              skin={skin}
              face={face}
              cardH={cardH}
              fanUp={fanUp}
              fanDown={fanDown}
              dropZone={`col-${col}`}
              highlighted={dropZone === `col-${col}`}
              dragMode={dragMode}
              onCardClick={(i) => handleCardClick(col, i)}
              onEmptyClick={() => handleCardClick(col, 0)}
              onDragStart={(e, i) => {
                const cards = pile.slice(i);
                startDrag(e, col, i, cards, () => handleCardClick(col, i));
              }}
            />
          ))}
        </div>
      </div>

      {game.won && (
        <DailyWinBanner message={`All cards moved to foundations in ${game.moves} moves!`} onNew={reset} stats={gameStats} />
      )}

      <DragModeToggle
        dragMode={dragMode}
        onToggle={toggleDragMode}
        dragHint="Drag cards to a column or foundation"
        clickHint="Click a card to select, then click a destination"
      />

      {/* Drag ghost */}
      {isDragging && dragRef.current && (
        <YukonGhost dragInfo={dragRef.current} ghostPos={ghostPos!} fanUp={fanUp} skin={skin} face={face} />
      )}
    </div>
  );
}

// ─── Ghost overlay ────────────────────────────────────────────────────────────

function YukonGhost({
  dragInfo,
  ghostPos,
  fanUp,
  skin,
  face,
}: {
  dragInfo: DragInfo;
  ghostPos: { x: number; y: number };
  fanUp: number;
  skin: CardBackSkin;
  face: CardFaceStyle;
}) {
  const { cards, offsetX, offsetY, cardW, cardH } = dragInfo;
  return (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: ghostPos.x - offsetX,
        top: ghostPos.y - offsetY,
        width: cardW,
        height: (cards.length - 1) * fanUp + cardH,
        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))",
        opacity: 0.92,
      }}
    >
      {cards.map((card, i) => (
        <div key={card.id} className="absolute left-0 right-0" style={{ top: i * fanUp, height: cardH }}>
          <PlayingCard card={card} backSkin={skin} faceStyle={face} />
        </div>
      ))}
    </div>
  );
}

// ─── YukonColumn ─────────────────────────────────────────────────────────────

interface YukonColumnProps {
  pile: Card[];
  col: number;
  sel: Sel;
  draggingFrom: Sel;
  hint: YukonHint | null;
  skin: CardBackSkin;
  face: CardFaceStyle;
  cardH: number;
  fanUp: number;
  fanDown: number;
  dropZone: string;
  highlighted: boolean;
  dragMode: boolean;
  onCardClick: (i: number) => void;
  onEmptyClick: () => void;
  onDragStart: (e: React.PointerEvent<Element>, i: number) => void;
}

function YukonColumn({
  pile, col, sel, draggingFrom, hint, skin, face, cardH, fanUp, fanDown,
  dropZone, highlighted, dragMode, onCardClick, onEmptyClick, onDragStart,
}: YukonColumnProps) {
  const offsets = useMemo(() => {
    let y = 0;
    return pile.map(c => {
      const off = y;
      y += c.faceUp ? fanUp : fanDown;
      return off;
    });
  }, [pile, fanUp, fanDown]);

  const totalH = pile.length === 0 ? cardH : (offsets[offsets.length - 1] ?? 0) + cardH;

  const isDraggingFrom = (i: number) =>
    draggingFrom?.col === col && i >= draggingFrom.index;

  if (pile.length === 0) {
    return (
      <div
        data-drop-zone={dropZone}
        onClick={onEmptyClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEmptyClick(); } }}
        tabIndex={0}
        role="button"
        aria-label={`Empty tableau column ${col + 1}`}
        className={`slot-empty aspect-[7/10] w-full cursor-pointer rounded-[var(--card-radius)] transition-all${highlighted ? " ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-background" : ""}`}
        style={highlighted ? { boxShadow: "0 0 20px -2px var(--neon)" } : undefined}
      />
    );
  }

  return (
    <div
      data-drop-zone={dropZone}
      className="relative w-full rounded-[var(--card-radius)] transition-all"
      style={{ height: totalH }}
    >
      {pile.map((c, i) => {
        const selected = sel?.col === col && i >= sel.index;
        const hinted = hint && hint.fromCol === col && i >= hint.fromIndex;
        const isTopDrop = highlighted && i === pile.length - 1;
        return (
          <div
            key={c.id}
            className={`absolute left-0 right-0 card-slot-container${isTopDrop ? " ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-background rounded-[var(--card-radius)]" : ""}`}
            style={{
              top: offsets[i],
              height: cardH,
              opacity: isDraggingFrom(i) ? 0.4 : 1,
              transition: "opacity 0.1s",
              touchAction: c.faceUp && dragMode ? "none" : undefined,
              ...(isTopDrop ? { boxShadow: "0 0 20px -2px var(--neon)" } : {}),
            }}
          >
            <PlayingCard
              card={c}
              selected={selected}
              hinted={!!hinted}
              backSkin={skin}
              faceStyle={face}
              onPointerDown={
                c.faceUp
                  ? dragMode
                    ? (e) => { e.stopPropagation(); onDragStart(e, i); }
                    : (e) => { e.stopPropagation(); onCardClick(i); }
                  : undefined
              }
              interactive={c.faceUp}
            />
          </div>
        );
      })}
    </div>
  );
}
