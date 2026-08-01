import { useEffect, useMemo, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import { recordWin, recordLoss, type GameStats } from "@/lib/stats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import {
  newSpiderGame,
  trySpiderMove,
  dealSpiderStock,
  getMovableRun,
  findSpiderHint,
  type SpiderHint,
  type SpiderState,
  type SpiderDifficulty,
} from "@/lib/spider";
import { PlayingCard, type CardBackSkin, type CardFaceStyle } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { WinBanner } from "./WinBanner";
import { useDragMode, DragModeToggle } from "./DragModeToggle";
import type { Card } from "@/lib/solitaire";

const CARD_H = 100;
const CARD_W_BASE = Math.round(CARD_H * 7 / 10);
const FAN_UP = 15;
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

export function Spider({ initialDifficulty }: { initialDifficulty?: SpiderDifficulty } = {}) {
  const [state, setState] = useState<SpiderState | null>(null);
  const [history, setHistory] = useState<SpiderState[]>([]);
  const [sel, setSel] = useState<Sel>(null);
  const [hint, setHint] = useState<SpiderHint | null>(null);
  const [difficulty, setDifficulty] = useState<SpiderDifficulty>(initialDifficulty ?? 1);
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [, forceUpdate] = useState(0);
  const { dragMode, toggleDragMode } = useDragMode();

  // Stats & daily challenge
  const statsRef = useRef(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const dailyModeRef = useRef(false);
  const dailyResetRef = useRef<(() => void) | null>(null);
  const { dailySeed, dailyTrigger, onDailyWin } = useDailyChallenge();

  // ── Drag state ────────────────────────────────────────────────────────────
  const dragRef = useRef<DragInfo | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<Sel>(null);
  const commitRef = useRef<(info: DragInfo, zone: string) => void>(() => {});

  useEffect(() => {
    const saved = loadGame<SpiderState>("spider");
    if (saved && saved.moves > 0) {
      // If this page locks a specific difficulty and the save is a different one, start fresh.
      const effective = initialDifficulty ?? saved.difficulty;
      if (effective !== saved.difficulty) {
        clearGame("spider");
        setDifficulty(effective);
        setState(newSpiderGame(effective));
      } else {
        setState(saved);
        setDifficulty(saved.difficulty);
      }
    } else {
      if (saved) clearGame("spider");
      const raw = Number(typeof window !== "undefined" ? localStorage.getItem("spider-difficulty") : "1");
      const storedDiff: SpiderDifficulty = ([1, 2, 4] as SpiderDifficulty[]).includes(raw as SpiderDifficulty)
        ? (raw as SpiderDifficulty) : 1;
      const diff = initialDifficulty ?? storedDiff;
      setDifficulty(diff);
      setState(newSpiderGame(diff));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state && state.moves > 0) saveGame("spider", state);
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
      setGameStats(recordWin("spider", elapsed, state.moves, dailyModeRef.current));
      if (dailyModeRef.current) { onDailyWin(); dailyModeRef.current = false; }
    }
  }, [state?.won]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Grid measurement ───────────────────────────────────────────────────────
  const gridRef = useRef<HTMLDivElement>(null);
  const [colW, setColW] = useState(CARD_W_BASE);
  const stateLoaded = state !== null;
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setColW(Math.max(20, Math.round((w - 9 * 6) / 10)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stateLoaded]);
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const cardH   = Math.min(Math.round(colW * 10 / 7), Math.round(vh * 0.30));
  const fanUp   = Math.max(6, Math.round(FAN_UP   * cardH / CARD_H));
  const fanDown = Math.max(3, Math.round(FAN_DOWN * cardH / CARD_H));

  // ── Global pointer handlers ────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const dr = dragRef.current;
      if (!dr) return;
      if (Math.hypot(e.clientX - dr.startX, e.clientY - dr.startY) > DRAG_THRESHOLD) dr.moved = true;
      setGhostPos({ x: e.clientX, y: e.clientY });
      const els = document.elementsFromPoint(e.clientX, e.clientY) as Element[];
      const zoneEl = els.find((el) => el.hasAttribute?.("data-drop-zone"));
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
      const zoneEl = els.find((el) => el.hasAttribute?.("data-drop-zone"));
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

  if (!state) {
    return (
      <div className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16">
        <div className="glass mt-4 h-[520px] animate-pulse rounded-2xl" />
      </div>
    );
  }

  const game = state;

  const commit = (next: SpiderState | null) => {
    if (!next) return false;
    setHistory((h) => [...h.slice(-30), game]);
    setState(next);
    setSel(null);
    setHint(null);
    return true;
  };

  commitRef.current = (dr: DragInfo, zone: string) => {
    if (zone.startsWith("col-")) {
      const destCol = parseInt(zone.slice(4), 10);
      commit(trySpiderMove(game, dr.col, dr.index, destCol));
    }
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setState(h[h.length - 1]);
      setSel(null);
      setHint(null);
      return h.slice(0, -1);
    });
  };

  const reset = (diff: SpiderDifficulty = difficulty, seed?: number) => {
    if (state?.moves > 0 && !state?.won && !statsRef.current) {
      recordLoss("spider", state.moves, dailyModeRef.current);
    }
    if (!seed) dailyModeRef.current = false;
    statsRef.current = false;
    clearGame("spider");
    setHistory([]);
    setSel(null);
    setHint(null);
    setDifficulty(diff);
    // Don't overwrite the stored preference when the page locks a specific difficulty.
    if (!initialDifficulty && typeof window !== "undefined") {
      localStorage.setItem("spider-difficulty", String(diff));
    }
    setState(newSpiderGame(diff, seed));
    showToast();
  };
  dailyResetRef.current = () => reset(difficulty, dailySeed);

  const showHint = () => {
    const h = findSpiderHint(game);
    setHint(h ?? { fromCol: -1, fromIdx: -1, description: "No moves found — try dealing or starting a new game." });
  };

  const handleCardClick = (col: number, index: number) => {
    const pile = game.tableau[col];
    if (!pile || pile.length === 0) {
      if (sel) commit(trySpiderMove(game, sel.col, sel.index, col));
      else setSel(null);
      return;
    }
    const card = pile[index];
    if (!card.faceUp) { setSel(null); return; }
    if (sel) {
      if (sel.col === col) { setSel(null); return; }
      if (commit(trySpiderMove(game, sel.col, sel.index, col))) return;
    }
    const run = getMovableRun(pile, index);
    if (run) setSel({ col, index });
    else setSel(null);
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

  const canDeal = game.stock.length > 0 && !game.tableau.some((col) => col.length === 0);
  const time = formatTime(game.startedAt);
  const isDragging = ghostPos !== null;

  return (
    <div
      className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16"
      style={isDragging ? { userSelect: "none", touchAction: "none" } : undefined}
    >
      {/* Top bar */}
      <div className="glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-muted-foreground">
            Moves <span className="font-semibold text-foreground">{game.moves}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{time}</span>
          <span>
            <span className="text-muted-foreground">Done </span>
            <span className="font-semibold" style={{ color: game.completed > 0 ? "var(--neon)" : undefined }}>
              {game.completed}/8
            </span>
          </span>
          <button
            onClick={() => commit(dealSpiderStock(game))}
            disabled={!canDeal}
            className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 transition hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-40"
            title={
              game.stock.length === 0 ? "No more deals"
              : !canDeal ? "Fill empty columns before dealing"
              : "Deal a row to all columns"
            }
          >
            Deal
            <span className="text-muted-foreground">({game.stock.length})</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={showHint} className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-secondary">Hint</button>
          <button onClick={undo} disabled={history.length === 0} className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-secondary disabled:opacity-40">Undo</button>
          <button onClick={() => reset()} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))", boxShadow: "0 6px 20px -8px var(--neon)" }}>New Game</button>
        </div>
      </div>

      <AppearanceBar
        skin={skin} face={face}
        onSkinChange={setSkin} onFaceChange={setFace}
        mode={{
          label: "SUITS",
          options: [
            { value: "1", label: "1-Suit",  sub: "Easy · Spades only" },
            { value: "2", label: "2-Suits", sub: "Medium · Spades & hearts" },
            { value: "4", label: "4-Suits", sub: "Hard · All four suits" },
          ],
          current: String(difficulty),
          onChange: (v) => reset(Number(v) as SpiderDifficulty),
          locked: !!initialDifficulty,
        }}
      />

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
      <NewGameToast visible={toastVisible} skin={skin} face={face} />

      {/* Board */}
      <div className="game-board-glass glass mt-4 rounded-2xl p-3 sm:p-4">
        <div
          ref={gridRef}
          className="grid gap-1.5"
          style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
        >
          {game.tableau.map((pile, col) => (
            <SpiderColumn
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
              dragMode={dragMode}
              dropZone={`col-${col}`}
              highlighted={dropZone === `col-${col}`}
              onCardClick={(i) => handleCardClick(col, i)}
              onEmptyClick={() => handleCardClick(col, 0)}
              onDragStart={(e, i) => {
                const run = getMovableRun(pile, i);
                if (!run) return;
                startDrag(e, col, i, pile.slice(i), () => handleCardClick(col, i));
              }}
            />
          ))}
        </div>
      </div>

      {game.won && (
        <WinBanner message={`All 8 sequences cleared in ${game.moves} moves!`} onNew={() => reset()} stats={gameStats} />
      )}

      <DragModeToggle
        dragMode={dragMode}
        onToggle={toggleDragMode}
        dragHint="Drag a run to an empty column or one topped by the next rank up"
        clickHint="Select a run, then click a destination column · Fill empty columns before dealing"
      />

      {/* Drag ghost */}
      {isDragging && dragRef.current && (
        <SpiderGhost dragInfo={dragRef.current} ghostPos={ghostPos!} fanUp={fanUp} skin={skin} face={face} />
      )}
    </div>
  );
}

// ─── Ghost overlay ────────────────────────────────────────────────────────────

function SpiderGhost({
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

// ─── SpiderColumn ─────────────────────────────────────────────────────────────

interface SpiderColumnProps {
  pile: Card[];
  col: number;
  sel: Sel;
  draggingFrom: Sel;
  hint: SpiderHint | null;
  skin: CardBackSkin;
  face: CardFaceStyle;
  cardH: number;
  fanUp: number;
  fanDown: number;
  dragMode: boolean;
  dropZone: string;
  highlighted: boolean;
  onCardClick: (i: number) => void;
  onEmptyClick: () => void;
  onDragStart: (e: React.PointerEvent<Element>, i: number) => void;
}

function SpiderColumn({
  pile, col, sel, draggingFrom, hint, skin, face, cardH, fanUp, fanDown,
  dragMode, dropZone, highlighted, onCardClick, onEmptyClick, onDragStart,
}: SpiderColumnProps) {
  const offsets = useMemo(() => {
    let y = 0;
    return pile.map((c) => {
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
        onClick={dragMode ? undefined : onEmptyClick}
        onPointerDown={dragMode ? (e) => { e.preventDefault(); onEmptyClick(); } : undefined}
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
        const selected = !dragMode && sel?.col === col && i >= sel.index;
        const hinted = hint && hint.fromCol === col && i >= hint.fromIdx;
        const isTopCard = highlighted && i === pile.length - 1;
        return (
          <div
            key={c.id}
            className={`absolute left-0 right-0 card-slot-container${isTopCard ? " ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-background rounded-[var(--card-radius)]" : ""}`}
            style={{
              top: offsets[i],
              height: cardH,
              opacity: isDraggingFrom(i) ? 0.4 : 1,
              transition: "opacity 0.1s",
              ...(isTopCard ? { boxShadow: "0 0 20px -2px var(--neon)" } : {}),
              ...(dragMode && c.faceUp ? { touchAction: "none" } : {}),
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
                    ? (e) => onDragStart(e, i)
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

