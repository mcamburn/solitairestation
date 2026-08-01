import { useEffect, useMemo, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import {
  autoMoveToFoundation,
  canDraw,
  drawFromStock,
  elapsed,
  findHint,
  newGame,
  suitGlyph,
  tryMoveToFoundation,
  tryMoveToTableau,
  vegasNet,
  type Card,
  type GameState,
  type Hint,
  type KlondikeMode,
  type Source,
} from "@/lib/solitaire";
import { PlayingCard, type CardBackSkin, type CardFaceStyle } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { useDragMode, DragModeToggle } from "./DragModeToggle";

const CARD_W = 88;
const CARD_H = 124;
const FAN_UP = 20;
const FAN_DOWN = 10;
const DRAG_THRESHOLD = 6;

const MODE_LABELS: { value: KlondikeMode; label: string; sub: string }[] = [
  { value: "draw1",  label: "Turn 1",  sub: "Draw 1, unlimited" },
  { value: "draw3",  label: "Turn 3",  sub: "Draw 3, unlimited" },
  { value: "vegas",  label: "Vegas",   sub: "Draw 3, 3 passes, $scoring" },
  { value: "double", label: "Double",  sub: "2 decks, 9 columns" },
];

function loadSavedMode(): KlondikeMode {
  try { return (localStorage.getItem("klondike-mode") as KlondikeMode) || "draw1"; } catch { return "draw1"; }
}

// ─── Drag state ───────────────────────────────────────────────────────────────

type DragInfo = {
  source: Source;
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

// ─── Component ────────────────────────────────────────────────────────────────

export function Solitaire({ initialMode }: { initialMode?: KlondikeMode } = {}) {
  const [state, setState] = useState<GameState | null>(null);
  const [history, setHistory] = useState<GameState[]>([]);
  const [sel, setSel] = useState<Source | null>(null);
  const { skin, face, setSkin, setFace } = useCardAppearance();
  const { visible: toastVisible, show: showToast } = useNewGameToast();
  const [hint, setHint] = useState<Hint | null>(null);
  const [, force] = useState(0);

  // Mode: controlled by prop on sub-pages, else persisted in localStorage
  const [mode, setMode] = useState<KlondikeMode>(() => initialMode ?? loadSavedMode());
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Shared drag-mode preference
  const { dragMode, toggleDragMode } = useDragMode();

  // Drag tracking
  const dragRef = useRef<DragInfo | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [draggingSource, setDraggingSource] = useState<Source | null>(null);
  const commitRef = useRef<(src: Source, zone: string) => void>(() => {});

  // ── Grid measurement ───────────────────────────────────────────────────────
  const gridRef = useRef<HTMLDivElement>(null);
  const [colW, setColW] = useState(CARD_W);
  const stateLoaded = state !== null;

  const measureCols = () => {
    const el = gridRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    const ncols = modeRef.current === "double" ? 9 : 7;
    const gap = ncols === 9 ? 8 : 12;
    setColW(Math.max(22, Math.round((w - (ncols - 1) * gap) / ncols)));
  };

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    measureCols();
    const ro = new ResizeObserver(measureCols);
    ro.observe(el);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateLoaded]);

  // Recalculate when mode changes (column count differs)
  useEffect(measureCols, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const cardH   = Math.min(Math.round(colW * 10 / 7), Math.round(vh * 0.30));
  const fanUp   = Math.max(10, Math.round(FAN_UP   * cardH / CARD_H));
  const fanDown = Math.max(5,  Math.round(FAN_DOWN * cardH / CARD_H));

  // ── Init / persist ─────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = loadGame<GameState>("klondike");
    if (saved && saved.moves > 0) {
      // Respect locked mode from sub-page
      const effective = initialMode ?? (saved.mode || "draw1");
      if (effective !== (saved.mode || "draw1")) {
        // Mode mismatch: start fresh in the locked mode
        setState(newGame(effective));
        setMode(effective);
      } else {
        setState({ ...saved, mode: effective });
        setMode(effective);
      }
    } else {
      if (saved) clearGame("klondike");
      setState(newGame(mode));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("klondike", state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

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
      setDraggingSource(null);
      if (!dr.moved) { dr.onTap(); return; }
      const els = document.elementsFromPoint(e.clientX, e.clientY) as Element[];
      const zoneEl = els.find((el) => el.hasAttribute?.("data-drop-zone"));
      const zone = zoneEl?.getAttribute("data-drop-zone") ?? null;
      if (zone) commitRef.current(dr.source, zone);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (!state) {
    return (
      <div className="mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16">
        <div className="glass mt-4 h-[520px] animate-pulse rounded-2xl" />
      </div>
    );
  }
  const game: GameState = state;
  const isDouble = game.mode === "double";
  const ncols = isDouble ? 9 : 7;
  const colGap = isDouble ? 8 : 12;

  // ── Game logic ─────────────────────────────────────────────────────────────
  const commit = (next: GameState | null) => {
    if (!next) return false;
    setHistory((h) => [...h.slice(-30), game]);
    setState(next);
    setSel(null);
    setHint(null);
    return true;
  };

  commitRef.current = (src: Source, zone: string) => {
    if (zone.startsWith("tableau-")) {
      const col = parseInt(zone.slice(8), 10);
      commit(tryMoveToTableau(game, src, col));
    } else if (zone.startsWith("foundation-")) {
      const pile = parseInt(zone.slice(11), 10);
      commit(tryMoveToFoundation(game, src, pile));
    }
  };

  const showHint = () => {
    const h = findHint(game);
    setHint(h ?? { source: { kind: "waste" }, description: "No moves available — try starting a new game." });
    if (h) setSel(h.source);
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setState(last);
      setSel(null);
      return h.slice(0, -1);
    });
  };

  const reset = (m: KlondikeMode = mode) => {
    clearGame("klondike");
    setHistory([]);
    setSel(null);
    setHint(null);
    setState(newGame(m));
    showToast();
  };

  const handleModeChange = (m: KlondikeMode) => {
    setMode(m);
    if (!initialMode) {
      try { localStorage.setItem("klondike-mode", m); } catch { /* ignore */ }
    }
    reset(m);
  };

  const handleStock = () => {
    if (!canDraw(game)) return; // Vegas pass limit reached
    setHistory((h) => [...h.slice(-30), game]);
    setState(drawFromStock(game));
    setSel(null);
    setHint(null);
  };

  const selectOrMove = (src: Source) => {
    if (!sel) { setSel(src); return; }
    if (sameSource(sel, src)) { setSel(null); return; }
    if (src.kind === "tableau") {
      if (commit(tryMoveToTableau(game, sel, src.col))) return;
    } else if (src.kind === "foundation") {
      if (commit(tryMoveToFoundation(game, sel, src.pile))) return;
    }
    setSel(src);
  };

  const handleTableauClick = (col: number, index: number) => {
    const pile = game.tableau[col];
    if (pile.length === 0) {
      if (sel && commit(tryMoveToTableau(game, sel, col))) return;
      setSel(null);
      return;
    }
    if (!pile[index].faceUp) return;
    selectOrMove({ kind: "tableau", col, index });
  };

  const handleFoundationClick = (pile: number) => {
    if (sel && commit(tryMoveToFoundation(game, sel, pile))) return;
    if (game.foundations[pile].length > 0) setSel({ kind: "foundation", pile });
    else setSel(null);
  };

  const handleWasteClick = () => {
    if (game.waste.length === 0) return;
    selectOrMove({ kind: "waste" });
  };

  const doubleClickTo = (src: Source) => {
    const next = autoMoveToFoundation(game, src);
    if (next) commit(next);
  };

  // ── Drag helpers ───────────────────────────────────────────────────────────
  const startDrag = (
    e: React.PointerEvent<Element>,
    source: Source,
    cards: Card[],
    onTap: () => void,
  ) => {
    if (!dragMode) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      source, cards,
      startX: e.clientX, startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      cardW: rect.width, cardH: cardH,
      moved: false, onTap,
    };
    setDraggingSource(source);
    setGhostPos({ x: e.clientX, y: e.clientY });
  };

  const isDraggingFromWaste      = draggingSource?.kind === "waste";
  const isDraggingFromFoundation = (i: number) =>
    draggingSource?.kind === "foundation" && draggingSource.pile === i;

  const time = elapsed(game);
  const isDragging = ghostPos !== null;

  // Score display
  const scoreValue = game.mode === "vegas"
    ? (vegasNet(game) >= 0 ? `+$${vegasNet(game)}` : `-$${Math.abs(vegasNet(game))}`)
    : String(game.score);
  const scoreLabel = game.mode === "vegas" ? "NET" : "SCORE";

  // Vegas pass info
  const vegasPasses = game.mode === "vegas"
    ? { current: game.passes, max: 3 }
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16"
      style={isDragging ? { userSelect: "none", touchAction: "none" } : undefined}
    >
      <TopBar
        moves={game.moves}
        scoreLabel={scoreLabel}
        scoreValue={scoreValue}
        time={time}
        onUndo={undo}
        onNew={() => reset()}
        onHint={showHint}
        canUndo={history.length > 0}
        vegasPasses={vegasPasses}
      />

      <AppearanceBar
        skin={skin} face={face}
        onSkinChange={setSkin} onFaceChange={setFace}
        mode={{
          label: "MODE",
          options: MODE_LABELS.map((m) => ({ value: m.value, label: m.label, sub: m.sub })),
          current: mode,
          onChange: (v) => handleModeChange(v as KlondikeMode),
          locked: !!initialMode,
        }}
      />

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

      <div className="game-board-glass glass mt-4 rounded-2xl p-4 sm:p-6">
        {/* Top row: stock · waste · [spacer(s)] · foundations */}
        <div
          ref={gridRef}
          className="grid"
          style={{ gridTemplateColumns: `repeat(${ncols}, minmax(0, 1fr))`, gap: colGap }}
        >
          {/* Stock */}
          <Slot
            onClick={dragMode ? undefined : handleStock}
            onPointerDown={dragMode ? (e) => { e.preventDefault(); handleStock(); } : undefined}
          >
            {game.stock.length > 0 ? (
              <PlayingCard card={{ ...game.stock[game.stock.length - 1], faceUp: false }} backSkin={skin} faceStyle={face} />
            ) : canDraw(game) ? (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">↻</div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground/50 leading-tight text-center px-1">No<br/>draws</div>
            )}
          </Slot>

          {/* Waste */}
          <Slot onClick={dragMode ? undefined : handleWasteClick}>
            {game.waste.length > 0 && (
              <div className="absolute inset-0" style={{ opacity: isDraggingFromWaste ? 0.4 : 1, transition: "opacity 0.1s" }}>
                <PlayingCard
                  card={game.waste[game.waste.length - 1]}
                  selected={!dragMode && sel?.kind === "waste"}
                  hinted={!!hint && hint.source.kind === "waste"}
                  onDoubleClick={() => doubleClickTo({ kind: "waste" })}
                  backSkin={skin}
                  faceStyle={face}
                  onPointerDown={dragMode ? (e) => startDrag(e, { kind: "waste" }, [game.waste[game.waste.length - 1]], handleWasteClick) : undefined}
                  interactive
                />
              </div>
            )}
          </Slot>

          {isDouble ? (
            // Double Klondike: spacers to fill row 1, then 8 foundations in row 2 + 1 spacer
            <>
              {Array.from({ length: ncols - 2 }, (_, i) => <div key={`sp${i}`} />)}
              {game.foundations.map((pile, i) => (
                <FoundationSlot
                  key={i}
                  pile={pile}
                  pileIndex={i}
                  sel={sel}
                  hint={hint}
                  draggingSource={draggingSource}
                  dropZone={dropZone}
                  dragMode={dragMode}
                  skin={skin}
                  face={face}
                  isDraggingFromFoundation={isDraggingFromFoundation(i)}
                  onFoundationClick={handleFoundationClick}
                  onStartDrag={startDrag}
                />
              ))}
              <div />
            </>
          ) : (
            // Standard: 1 spacer + 4 foundations
            <>
              <div />
              {game.foundations.map((pile, i) => (
                <FoundationSlot
                  key={i}
                  pile={pile}
                  pileIndex={i}
                  sel={sel}
                  hint={hint}
                  draggingSource={draggingSource}
                  dropZone={dropZone}
                  dragMode={dragMode}
                  skin={skin}
                  face={face}
                  isDraggingFromFoundation={isDraggingFromFoundation(i)}
                  onFoundationClick={handleFoundationClick}
                  onStartDrag={startDrag}
                />
              ))}
            </>
          )}
        </div>

        {/* Tableau */}
        <div
          className="mt-6 grid"
          style={{ gridTemplateColumns: `repeat(${ncols}, minmax(0, 1fr))`, gap: colGap }}
        >
          {game.tableau.map((pile, col) => (
            <TableauColumn
              key={col}
              pile={pile}
              col={col}
              selected={dragMode ? null : sel}
              draggingSource={draggingSource}
              hint={hint}
              backSkin={skin}
              faceStyle={face}
              cardH={cardH}
              fanUp={fanUp}
              fanDown={fanDown}
              dragMode={dragMode}
              dropZone={`tableau-${col}`}
              highlighted={dropZone === `tableau-${col}`}
              onCardClick={(i) => handleTableauClick(col, i)}
              onEmptyClick={() => handleTableauClick(col, 0)}
              onDoubleClick={(i) => doubleClickTo({ kind: "tableau", col, index: i })}
              onDragStart={(e, i) => startDrag(e, { kind: "tableau", col, index: i }, pile.slice(i), () => handleTableauClick(col, i))}
            />
          ))}
        </div>
      </div>

      {game.won && <WinOverlay onNew={() => reset()} moves={game.moves} time={time} mode={game.mode} score={scoreValue} />}

      <DragModeToggle
        dragMode={dragMode}
        onToggle={toggleDragMode}
        dragHint="Drag cards to move them · Double-click to send to foundation"
        clickHint="Click a card to select, then click a destination · Double-click to send to foundation"
      />

      <NewGameToast visible={toastVisible} skin={skin} face={face} />

      {isDragging && dragRef.current && (
        <DragGhost dragInfo={dragRef.current} ghostPos={ghostPos!} fanUp={fanUp} skin={skin} face={face} />
      )}
    </div>
  );
}

// ─── Mode Picker ──────────────────────────────────────────────────────────────

function ModePicker({ mode, onChange, locked }: { mode: KlondikeMode; onChange: (m: KlondikeMode) => void; locked: boolean }) {
  return (
    <div className="game-controls glass mt-3 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-2.5">
      <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground shrink-0">MODE</span>
      <div className="flex flex-wrap gap-1.5">
        {MODE_LABELS.map((m) => {
          const active = mode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => { if (!active) onChange(m.value); }}
              title={m.sub}
              className={[
                "rounded-lg px-3 py-1 text-xs font-medium transition",
                active
                  ? "text-primary-foreground"
                  : "border border-border bg-secondary/60 text-secondary-foreground hover:bg-secondary",
                locked && !active ? "opacity-50 cursor-default pointer-events-none" : "",
              ].join(" ")}
              style={active ? { background: "linear-gradient(135deg, var(--neon), var(--neon-2))" } : undefined}
              aria-pressed={active}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      {mode === "vegas" && (
        <span className="ml-auto text-[10px] text-muted-foreground hidden sm:block">$52 wager · $5/card · 3 passes</span>
      )}
      {mode === "double" && (
        <span className="ml-auto text-[10px] text-muted-foreground hidden sm:block">2 decks · 9 columns · 8 foundations</span>
      )}
    </div>
  );
}

// ─── Foundation Slot (extracted to avoid repetition) ─────────────────────────

function FoundationSlot({
  pile, pileIndex, sel, hint, draggingSource, dropZone, dragMode, skin, face,
  isDraggingFromFoundation, onFoundationClick, onStartDrag,
}: {
  pile: Card[];
  pileIndex: number;
  sel: Source | null;
  hint: Hint | null;
  draggingSource: Source | null;
  dropZone: string | null;
  dragMode: boolean;
  skin: CardBackSkin;
  face: CardFaceStyle;
  isDraggingFromFoundation: boolean;
  onFoundationClick: (pile: number) => void;
  onStartDrag: (e: React.PointerEvent<Element>, source: Source, cards: Card[], onTap: () => void) => void;
}) {
  const zone = `foundation-${pileIndex}`;
  const highlighted = dropZone === zone;
  const suitSymbols = ["♠", "♥", "♦", "♣", "♠", "♥", "♦", "♣"];
  return (
    <Slot
      onClick={dragMode ? undefined : () => onFoundationClick(pileIndex)}
      onPointerDown={
        dragMode && pile.length > 0
          ? (e) => onStartDrag(e, { kind: "foundation", pile: pileIndex }, [pile[pile.length - 1]], () => onFoundationClick(pileIndex))
          : undefined
      }
      dropZone={zone}
      highlighted={highlighted}
    >
      {pile.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground/50">
          {suitSymbols[pileIndex % 8]}
        </div>
      ) : (
        <div className="absolute inset-0" style={{ opacity: isDraggingFromFoundation ? 0.4 : 1, transition: "opacity 0.1s" }}>
          <PlayingCard
            card={pile[pile.length - 1]}
            selected={!dragMode && sel?.kind === "foundation" && sel.pile === pileIndex}
            hinted={!!hint && hint.source.kind === "foundation" && hint.source.pile === pileIndex}
            backSkin={skin}
            faceStyle={face}
            interactive={dragMode}
          />
        </div>
      )}
    </Slot>
  );
}

// ─── Ghost ────────────────────────────────────────────────────────────────────

function DragGhost({
  dragInfo, ghostPos, fanUp, skin, face,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sameSource(a: Source, b: Source): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "tableau" && b.kind === "tableau") return a.col === b.col && a.index === b.index;
  if (a.kind === "foundation" && b.kind === "foundation") return a.pile === b.pile;
  return a.kind === "waste";
}

// ─── Slot ─────────────────────────────────────────────────────────────────────

function Slot({
  children, onClick, onPointerDown, dropZone, highlighted,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  dropZone?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      onPointerDown={onPointerDown}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(); } }}
      tabIndex={onClick || onPointerDown ? 0 : undefined}
      role={onClick || onPointerDown ? "button" : undefined}
      data-drop-zone={dropZone}
      className={[
        "slot-empty relative aspect-[7/10] w-full cursor-pointer rounded-[var(--card-radius)] transition-all",
        highlighted ? "ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-background" : "",
      ].join(" ")}
      style={highlighted ? { boxShadow: "0 0 16px -4px var(--neon)" } : undefined}
    >
      <div className="absolute inset-0 card-slot-container">{children}</div>
    </div>
  );
}

// ─── TableauColumn ────────────────────────────────────────────────────────────

function TableauColumn({
  pile, col, selected, draggingSource, hint, backSkin, faceStyle,
  cardH, fanUp, fanDown, dragMode, dropZone, highlighted,
  onCardClick, onEmptyClick, onDoubleClick, onDragStart,
}: {
  pile: Card[];
  col: number;
  selected: Source | null;
  draggingSource: Source | null;
  hint: Hint | null;
  backSkin: CardBackSkin;
  faceStyle: CardFaceStyle;
  cardH: number;
  fanUp: number;
  fanDown: number;
  dragMode: boolean;
  dropZone: string;
  highlighted: boolean;
  onCardClick: (i: number) => void;
  onEmptyClick: () => void;
  onDoubleClick: (i: number) => void;
  onDragStart: (e: React.PointerEvent<Element>, i: number) => void;
}) {
  const offsets = useMemo(() => {
    const arr: number[] = [];
    let y = 0;
    for (let i = 0; i < pile.length; i++) {
      arr.push(y);
      y += pile[i].faceUp ? fanUp : fanDown;
    }
    return arr;
  }, [pile, fanUp, fanDown]);

  const totalHeight = (offsets[offsets.length - 1] ?? 0) + cardH;

  const isSelected  = (i: number) => selected?.kind === "tableau" && selected.col === col && i >= selected.index;
  const isHinted    = (i: number) => hint?.source.kind === "tableau" && hint.source.col === col && hint.source.index === i;
  const isDragging  = (i: number) => draggingSource?.kind === "tableau" && draggingSource.col === col && i >= draggingSource.index;

  if (pile.length === 0) {
    return (
      <div
        data-drop-zone={dropZone}
        onClick={dragMode ? undefined : onEmptyClick}
        onPointerDown={dragMode ? (e) => { e.preventDefault(); onEmptyClick(); } : undefined}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEmptyClick(); } }}
        tabIndex={0}
        role="button"
        aria-label="Empty tableau column"
        className={`slot-empty aspect-[7/10] w-full cursor-pointer rounded-[var(--card-radius)] transition-all${highlighted ? " ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-background" : ""}`}
        style={highlighted ? { boxShadow: "0 0 20px -2px var(--neon)" } : undefined}
      />
    );
  }

  return (
    <div
      data-drop-zone={dropZone}
      className="relative w-full rounded-[var(--card-radius)] transition-all"
      style={{ height: totalHeight }}
    >
      {pile.map((c, i) => {
        const isTopCard = highlighted && i === pile.length - 1;
        return (
        <div
          key={c.id}
          className={`absolute left-0 right-0 card-slot-container${isTopCard ? " ring-2 ring-[var(--neon)] ring-offset-1 ring-offset-background rounded-[var(--card-radius)]" : ""}`}
          style={{ top: offsets[i], height: cardH, opacity: isDragging(i) ? 0.4 : 1, transition: "opacity 0.1s", ...(isTopCard ? { boxShadow: "0 0 20px -2px var(--neon)" } : {}) }}
        >
          <PlayingCard
            card={c}
            selected={isSelected(i)}
            hinted={isHinted(i)}
            backSkin={backSkin}
            faceStyle={faceStyle}
            onPointerDown={
              c.faceUp
                ? dragMode
                  ? (e) => onDragStart(e, i)
                  : (e) => { e.stopPropagation(); onCardClick(i); }
                : undefined
            }
            onDoubleClick={() => onDoubleClick(i)}
            interactive={c.faceUp}
          />
        </div>
        );
      })}
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

function TopBar({
  moves, scoreLabel, scoreValue, time, onUndo, onNew, onHint, canUndo, vegasPasses,
}: {
  moves: number;
  scoreLabel: string;
  scoreValue: string;
  time: string;
  onUndo: () => void;
  onNew: () => void;
  onHint: () => void;
  canUndo: boolean;
  vegasPasses: { current: number; max: number } | null;
}) {
  return (
    <div className="game-controls glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))", boxShadow: "0 0 20px -4px var(--neon)" }} />
        <div className="text-sm font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Klondike</div>
      </div>
      <div className="hidden items-center gap-3 sm:gap-5 sm:flex" style={{ fontFamily: "var(--font-mono)" }}>
        <Stat label="TIME" value={time} />
        <Stat label="MOVES" value={String(moves)} />
        {vegasPasses && <Stat label="PASS" value={`${vegasPasses.current}/${vegasPasses.max}`} />}
        <Stat label={scoreLabel} value={scoreValue} />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onHint} className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-secondary">Hint</button>
        <button onClick={onUndo} disabled={!canUndo} className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-secondary disabled:opacity-40">Undo</button>
        <button onClick={onNew} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))", boxShadow: "0 6px 20px -8px var(--neon)" }}>New Game</button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right leading-tight">
      <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

// ─── Win overlay ──────────────────────────────────────────────────────────────

function WinOverlay({ onNew, moves, time, mode, score }: {
  onNew: () => void; moves: number; time: string; mode: KlondikeMode; score: string;
}) {
  const modeLabel = MODE_LABELS.find(m => m.value === mode)?.label ?? "Klondike";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md">
      <div className="glass mx-4 max-w-sm rounded-3xl p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-2xl" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))", boxShadow: "0 0 40px -4px var(--neon)" }} />
        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>You won.</h2>
        <p className="mt-1 text-sm text-muted-foreground">{modeLabel} · {time} · {moves} moves{mode === "vegas" ? ` · ${score}` : ""}</p>
        <button onClick={onNew} className="mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground" style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}>Play again</button>
      </div>
    </div>
  );
}
