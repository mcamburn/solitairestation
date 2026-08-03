import { useEffect, useMemo, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import { recordWin, recordLoss, type GameStats } from "@/lib/stats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import {
  newBakersGame,
  isValidBGSequence,
  tryBGMove,
  autoBGToFoundation,
  findBakersGameHint,
  type BakersGameHint,
  type BakersGameState,
  type BGSrc,
  type BGDest,
} from "@/lib/bakersgame";
import { PlayingCard, type CardBackSkin, type CardFaceStyle } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { DailyWinBanner } from "./DailyWinBanner";
import { useDragMode, DragModeToggle } from "./DragModeToggle";
import type { Card } from "@/lib/solitaire";

const CARD_H = 110;
const CARD_W_BASE = Math.round(CARD_H * 7 / 10);
const FAN = 26;
const DRAG_THRESHOLD = 6;
const GHOST_FAN = 22;

type Sel = BGSrc | null;

type DragInfo = {
  src: BGSrc;
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

export function BakersGame() {
  const [state, setState] = useState<BakersGameState | null>(null);
  const [history, setHistory] = useState<BakersGameState[]>([]);
  const [sel, setSel] = useState<Sel>(null);
  const [hint, setHint] = useState<BakersGameHint | null>(null);
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [, forceUpdate] = useState(0);
  const { dragMode, toggleDragMode } = useDragMode();
  const statsRef = useRef(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const dailyModeRef = useRef(false);
  const { dailySeed, dailyTrigger, onDailyWin } = useDailyChallenge();

  useEffect(() => {
    if (!state?.won || statsRef.current) return;
    statsRef.current = true;
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    setGameStats(recordWin("bakersgame", elapsed, state.moves, dailyModeRef.current));
    if (dailyModeRef.current) { onDailyWin(); dailyModeRef.current = false; }
    setHistory([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.won]);

  const dragRef = useRef<DragInfo | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [draggingSrc, setDraggingSrc] = useState<BGSrc | null>(null);
  const commitRef = useRef<(info: DragInfo, zone: string) => void>(() => {});

  useEffect(() => {
    const saved = loadGame<BakersGameState>("bakersgame");
    if (saved && saved.moves > 0) {
      setState(saved);
      if (saved.won) statsRef.current = true;
    } else {
      if (saved) clearGame("bakersgame");
      setState(newBakersGame());
    }
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("bakersgame", state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const gridRef = useRef<HTMLDivElement>(null);
  const [colW, setColW] = useState(CARD_W_BASE);
  const stateLoaded = state !== null;
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setColW(Math.max(24, Math.round((w - 7 * 6) / 8)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stateLoaded]);
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const cardH = Math.min(Math.round(colW < 70 ? colW * 1.5 : colW * 10 / 7), Math.round(vh * 0.30));
  const fanMultiplier = Math.min(1.3, Math.max(1.0, 80 / Math.max(colW, 40)));
  const fan = Math.max(10, Math.round(FAN * cardH / CARD_H * fanMultiplier));

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
      setDraggingSrc(null);
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

  const reset = (seed?: number) => {
    if (state && state.moves > 0 && !state.won && !statsRef.current) {
      setGameStats(recordLoss("bakersgame", state.moves, dailyModeRef.current));
    }
    if (!seed) dailyModeRef.current = false;
    clearGame("bakersgame");
    statsRef.current = false;
    setGameStats(null);
    setHistory([]);
    setSel(null);
    setHint(null);
    setState(newBakersGame(seed));
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

  const commit = (next: BakersGameState | null) => {
    if (!next) return false;
    setHistory((h) => [...h.slice(-30), game]);
    setState(next);
    setSel(null);
    setHint(null);
    return true;
  };

  commitRef.current = (dr: DragInfo, zone: string) => {
    let dest: BGDest | null = null;
    if (zone.startsWith("tableau-"))     dest = { kind: "tableau", col: parseInt(zone.slice(8), 10) };
    else if (zone.startsWith("freecell-")) dest = { kind: "freecell", cell: parseInt(zone.slice(9), 10) };
    else if (zone.startsWith("foundation-")) dest = { kind: "foundation", pile: parseInt(zone.slice(11), 10) };
    if (dest) commit(tryBGMove(game, dr.src, dest));
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

  const showHint = () => {
    const h = findBakersGameHint(game);
    setHint(h ?? { src: { kind: "tableau", col: 0, index: 0 }, description: "No moves available — try undoing or starting a new game." });
    if (h) setSel(h.src);
  };

  const move = (dest: BGDest) => {
    if (!sel) return;
    commit(tryBGMove(game, sel, dest));
  };

  const handleFreeCellClick = (cell: number) => {
    const card = game.freeCells[cell];
    if (sel) {
      if (sel.kind === "freecell" && sel.cell === cell) { setSel(null); return; }
      if (commit(tryBGMove(game, sel, { kind: "freecell", cell }))) return;
    }
    if (card) setSel({ kind: "freecell", cell });
  };

  const handleFoundationClick = (pile: number) => {
    if (!sel) return;
    commit(tryBGMove(game, sel, { kind: "foundation", pile }));
  };

  const handleTableauClick = (col: number, index: number) => {
    const pile = game.tableau[col];
    if (sel) {
      if (sel.kind === "tableau" && sel.col === col && sel.index === index) { setSel(null); return; }
      if (commit(tryBGMove(game, sel, { kind: "tableau", col }))) return;
    }
    if (!pile || pile.length === 0) { setSel(null); return; }
    const sub = pile.slice(index);
    const isTop = index === pile.length - 1;
    if (isTop || isValidBGSequence(sub)) setSel({ kind: "tableau", col, index });
    else setSel(null);
  };

  const handleDoubleClick = (src: BGSrc) => {
    commit(autoBGToFoundation(game, src));
  };

  const startDrag = (
    e: React.PointerEvent<Element>,
    src: BGSrc,
    cards: Card[],
    onTap: () => void,
  ) => {
    if (!dragMode) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      src, cards,
      startX: e.clientX, startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      cardW: rect.width, cardH: cardH,
      moved: false, onTap,
    };
    setDraggingSrc(src);
    setGhostPos({ x: e.clientX, y: e.clientY });
  };

  const isDraggingFromFC = (cell: number) =>
    draggingSrc?.kind === "freecell" && draggingSrc.cell === cell;

  const time = formatTime(game.startedAt);
  const isDragging = ghostPos !== null;

  const dropHighlight = (zone: string) =>
    dropZone === zone
      ? { ring: "ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-background", shadow: "0 0 16px -4px var(--neon)" }
      : { ring: "", shadow: undefined };

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
        </div>
        <div className="flex items-center gap-2">
          <button onClick={showHint} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70">Hint</button>
          <button onClick={undo} disabled={history.length === 0} className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70 disabled:opacity-40">Undo</button>
          <button onClick={() => reset()} className="rounded-lg px-2.5 py-1 text-primary-foreground transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}>New Game</button>
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
      <DragModeToggle
        dragMode={dragMode}
        onToggle={toggleDragMode}
        dragHint="Drag cards to free cells, foundations, or tableau columns · Double-click to auto-move"
        clickHint="Click a card to select, then click a destination · Double-click to auto-move to foundation"
      />
      <NewGameToast visible={toastVisible} skin={skin} face={face} />

      {/* Board */}
      <div className="game-board-glass glass mt-4 rounded-2xl p-4 sm:p-5">
        {/* Free cells + foundations */}
        <div className="mb-4 grid gap-1.5" style={{ gridTemplateColumns: "repeat(9, minmax(0, 1fr))" }}>
          {/* Free cells */}
          {game.freeCells.map((card, i) => {
            const { ring, shadow } = dropHighlight(`freecell-${i}`);
            const selected = !dragMode && sel?.kind === "freecell" && sel.cell === i;
            const hinted = hint?.src.kind === "freecell" && hint.src.cell === i;
            return (
              <div
                key={i}
                data-drop-zone={`freecell-${i}`}
                className={`card-slot-container aspect-[7/10] cursor-pointer rounded-[var(--card-radius)] outline-none transition-all ${ring}`}
                style={shadow ? { boxShadow: shadow } : undefined}
                onClick={dragMode ? undefined : () => handleFreeCellClick(i)}
                onKeyDown={(e) => { if (!card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleFreeCellClick(i); } }}
                tabIndex={card ? undefined : 0}
                role={card ? undefined : "button"}
                aria-label={card ? undefined : `Free cell ${i + 1}, empty`}
              >
                {card ? (
                  <div style={{ opacity: isDraggingFromFC(i) ? 0.4 : 1, transition: "opacity 0.1s", touchAction: dragMode ? "none" : undefined }}>
                    <PlayingCard
                      card={card}
                      selected={selected}
                      hinted={!!hinted}
                      backSkin={skin}
                      faceStyle={face}
                      onDoubleClick={() => handleDoubleClick({ kind: "freecell", cell: i })}
                      onPointerDown={
                        dragMode
                          ? (e) => startDrag(e, { kind: "freecell", cell: i }, [card], () => handleFreeCellClick(i))
                          : (e) => { e.stopPropagation(); handleFreeCellClick(i); }
                      }
                      interactive
                    />
                  </div>
                ) : (
                  <div className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-xs text-muted-foreground/40">
                    FC
                  </div>
                )}
              </div>
            );
          })}

          {/* Spacer */}
          <div />

          {/* Foundations */}
          {game.foundations.map((pile, i) => {
            const top = pile[pile.length - 1];
            const { ring, shadow } = dropHighlight(`foundation-${i}`);
            return (
              <div
                key={i}
                data-drop-zone={`foundation-${i}`}
                className={`card-slot-container aspect-[7/10] cursor-pointer rounded-[var(--card-radius)] transition-all ${ring}`}
                style={shadow ? { boxShadow: shadow } : undefined}
                onClick={dragMode ? undefined : () => handleFoundationClick(i)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFoundationClick(i); } }}
                tabIndex={0}
                role="button"
                aria-label={`Foundation ${i + 1}${top ? `, top: ${top.rank} of ${top.suit}` : ", empty"}`}
              >
                {top ? (
                  <PlayingCard card={top} backSkin={skin} faceStyle={face} onPointerDown={(e) => e.stopPropagation()} />
                ) : (
                  <div className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-xl font-bold text-muted-foreground/30">
                    A
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tableau */}
        <div ref={gridRef} className="grid gap-[7px] sm:gap-1.5" style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}>
          {game.tableau.map((pile, col) => (
            <BGColumn
              key={col}
              pile={pile}
              col={col}
              sel={dragMode ? null : sel}
              draggingSrc={draggingSrc}
              hintSrc={hint?.src ?? null}
              skin={skin}
              face={face}
              cardH={cardH}
              fan={fan}
              dragMode={dragMode}
              dropZone={`tableau-${col}`}
              highlighted={dropZone === `tableau-${col}`}
              onCardClick={(i) => handleTableauClick(col, i)}
              onDoubleClick={(i) => handleDoubleClick({ kind: "tableau", col, index: i })}
              onEmptyClick={() => move({ kind: "tableau", col })}
              onDragStart={(e, i) => {
                const sub = pile.slice(i);
                const isTop = i === pile.length - 1;
                if (!isTop && !isValidBGSequence(sub)) return;
                startDrag(e, { kind: "tableau", col, index: i }, sub, () => handleTableauClick(col, i));
              }}
            />
          ))}
        </div>
      </div>

      {game.won && (
        <DailyWinBanner message={`All 52 cards sorted in ${game.moves} moves!`} onNew={reset} stats={gameStats} />
      )}

      {isDragging && dragRef.current && (
        <BGGhost dragInfo={dragRef.current} ghostPos={ghostPos!} skin={skin} face={face} />
      )}
    </div>
  );
}

// ─── Ghost overlay ────────────────────────────────────────────────────────────

function BGGhost({
  dragInfo,
  ghostPos,
  skin,
  face,
}: {
  dragInfo: DragInfo;
  ghostPos: { x: number; y: number };
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
        height: (cards.length - 1) * GHOST_FAN + cardH,
        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.6))",
        opacity: 0.92,
      }}
    >
      {cards.map((card, i) => (
        <div key={card.id} className="absolute left-0 right-0" style={{ top: i * GHOST_FAN, height: cardH }}>
          <PlayingCard card={card} backSkin={skin} faceStyle={face} />
        </div>
      ))}
    </div>
  );
}

// ─── BGColumn ─────────────────────────────────────────────────────────────────

interface BGColumnProps {
  pile: Card[];
  col: number;
  sel: Sel;
  draggingSrc: BGSrc | null;
  hintSrc: BGSrc | null;
  skin: CardBackSkin;
  face: CardFaceStyle;
  cardH: number;
  fan: number;
  dragMode: boolean;
  dropZone: string;
  highlighted: boolean;
  onCardClick: (i: number) => void;
  onDoubleClick: (i: number) => void;
  onEmptyClick: () => void;
  onDragStart: (e: React.PointerEvent<Element>, i: number) => void;
}

function BGColumn({
  pile, col, sel, draggingSrc, hintSrc, skin, face, cardH, fan,
  dragMode, dropZone, highlighted, onCardClick, onDoubleClick, onEmptyClick, onDragStart,
}: BGColumnProps) {
  const offsets = useMemo(() => {
    let y = 0;
    return pile.map(() => { const off = y; y += fan; return off; });
  }, [pile, fan]);

  const totalH = pile.length === 0 ? cardH : (offsets[offsets.length - 1] ?? 0) + cardH;
  const selIndex = sel?.kind === "tableau" && sel.col === col ? sel.index : -1;
  const hintIndex = hintSrc?.kind === "tableau" && hintSrc.col === col ? hintSrc.index : -1;
  const isDraggingFrom = (i: number) =>
    draggingSrc?.kind === "tableau" && draggingSrc.col === col && i >= draggingSrc.index;

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
              touchAction: dragMode ? "none" : undefined,
              ...(isTopCard ? { boxShadow: "0 0 20px -2px var(--neon)" } : {}),
            }}
          >
            <PlayingCard
              card={c}
              selected={selIndex >= 0 && i >= selIndex}
              hinted={hintIndex >= 0 && i >= hintIndex}
              backSkin={skin}
              faceStyle={face}
              onPointerDown={
                dragMode
                  ? (e) => onDragStart(e, i)
                  : (e) => { e.stopPropagation(); onCardClick(i); }
              }
              onDoubleClick={() => onDoubleClick(i)}
              interactive
            />
          </div>
        );
      })}
    </div>
  );
}
