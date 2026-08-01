import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
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
import { rankLabel, suitGlyph } from "@/lib/solitaire";
import { PlayingCard, type CardBackSkin, type CardFaceStyle } from "./PlayingCard";
import { AppearanceBar, useCardAppearance, useNewGameToast, NewGameToast } from "./CardPickers";
import { WinBanner } from "./WinBanner";

const CARD_W = 74;
const CARD_H = 106;
const CARD_OVERLAP = 26;

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

  useEffect(() => {
    const saved = loadGame<CanfieldState>("canfield");
    if (saved && saved.moves > 0) {
      setState(saved);
    } else {
      setState(newCanfieldGame());
    }
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("canfield", state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const stateLoaded = state !== null;
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      // ~8 card widths + gaps
      setScale(Math.min(1, w / 680));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stateLoaded]);

  if (!state) {
    return (
      <div className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16">
        <div className="glass mt-4 h-[520px] animate-pulse rounded-2xl" />
      </div>
    );
  }

  const game = state;
  const cardW = Math.max(36, Math.round(CARD_W * scale));
  const cardH = Math.round(cardW * 10 / 7);
  const overlap = Math.max(14, Math.round(CARD_OVERLAP * scale));
  const colGap = Math.max(3, Math.round(8 * scale));

  const commit = (next: CanfieldState | null): boolean => {
    if (!next) return false;
    setHistory((h) => [...h.slice(-30), game]);
    setState(next);
    setSelection(null);
    setHint(null);
    return true;
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setState(h[h.length - 1]);
      setSelection(null);
      setHint(null);
      return h.slice(0, -1);
    });
  };

  const reset = () => {
    clearGame("canfield");
    setHistory([]);
    setSelection(null);
    setHint(null);
    setState(newCanfieldGame());
    showToast();
  };

  const showHint = () => {
    const h = findCanfieldHint(game);
    setHint(h ?? { kind: "draw", description: "No moves available — try undoing or starting a new game." });
  };

  /** Try to move current selection to a destination (tableau col or foundation). */
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
      if (selection.kind === "tableau") {
        return commit(cfMoveTableauToTableau(game, selection.col, selection.fromIndex, col));
      }
    }
    return false;
  };

  const handleStockClick = () => {
    commit(cfDrawFromStock(game));
  };

  const handleWasteClick = () => {
    if (selection?.kind === "waste") {
      setSelection(null);
      return;
    }
    // Try to auto-move to foundation first
    if (commit(cfMoveWasteToFoundation(game))) return;
    // Otherwise select waste
    const wasteTop = game.waste[game.waste.length - 1];
    if (wasteTop) setSelection({ kind: "waste" });
  };

  const handleWasteDblClick = () => {
    commit(cfMoveWasteToFoundation(game));
  };

  const handleReserveClick = () => {
    if (selection?.kind === "reserve") {
      setSelection(null);
      return;
    }
    if (selection) {
      setSelection(null);
    }
    const reserveTop = game.reserve[game.reserve.length - 1];
    if (reserveTop) setSelection({ kind: "reserve" });
  };

  const handleReserveDblClick = () => {
    commit(cfMoveReserveToFoundation(game));
  };

  const handleFoundationClick = (pileIdx: number) => {
    if (!selection) return;
    // Try moving selection to foundation
    if (selection.kind === "waste") {
      commit(cfMoveWasteToFoundation(game));
    } else if (selection.kind === "reserve") {
      commit(cfMoveReserveToFoundation(game));
    } else if (selection.kind === "tableau") {
      const s = cloneCanfield(game);
      const col = s.tableau[selection.col];
      const card = col[col.length - 1];
      if (!card) return;
      // Only top card can go to foundation
      if (selection.fromIndex !== col.length - 1) return;
      commit(cfMoveTableauToFoundation(game, selection.col));
    }
  };

  const handleTableauClick = (col: number, cardIndex: number) => {
    setHint(null);
    const colCards = game.tableau[col];

    if (selection) {
      // Try to move selection here
      if (selection.kind === "tableau" && selection.col === col) {
        // Clicked same column — deselect
        setSelection(null);
        return;
      }
      const moved = applySelection({ tableauCol: col });
      if (moved) return;
      // Can't move here — select this card if it's a valid start of sequence
      if (colCards.length > 0 && cardIndex < colCards.length) {
        setSelection({ kind: "tableau", col, fromIndex: cardIndex });
      } else {
        setSelection(null);
      }
      return;
    }

    // No selection — select this card
    if (colCards.length === 0) return;
    const idx = Math.min(cardIndex, colCards.length - 1);
    setSelection({ kind: "tableau", col, fromIndex: idx });
  };

  const handleTableauDblClick = (col: number) => {
    commit(cfMoveTableauToFoundation(game, col));
  };

  const handleEmptyTableauClick = (col: number) => {
    if (!selection) return;
    applySelection({ tableauCol: col });
  };

  const wasteTop = game.waste[game.waste.length - 1];
  const reserveTop = game.reserve[game.reserve.length - 1];
  const totalFoundationCards = game.foundations.reduce((sum, p) => sum + p.length, 0);

  const isSelWaste = selection?.kind === "waste";
  const isSelReserve = selection?.kind === "reserve";

  // Determine which tableau cards are hinted
  const hintedTableauCol = hint?.srcCol;
  const hintedTableauFromIndex = hint?.fromIndex;
  const hintedTableauDest = hint?.destCol;

  return (
    <div className="game-board-wrap mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16">
      {/* Top bar */}
      <div className="glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Moves <span className="font-semibold text-foreground">{game.moves}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{formatTime(game.startedAt)}</span>
          <span className="text-muted-foreground">
            Foundation{" "}
            <span className="font-semibold text-foreground">{totalFoundationCards}/52</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={showHint}
            className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70"
          >
            Hint
          </button>
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="rounded-lg border border-border px-2.5 py-1 transition hover:bg-secondary/70 disabled:opacity-40"
          >
            Undo
          </button>
          <button
            onClick={reset}
            className="rounded-xl px-2.5 py-1 text-primary-foreground transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}
          >
            New Game
          </button>
        </div>
      </div>

      {hint && (
        <div
          className="glass mt-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs"
          style={{ borderColor: "var(--neon)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--neon)", boxShadow: "0 0 8px var(--neon)" }}
            />
            <span className="font-medium">Hint</span>
            <span className="text-muted-foreground">{hint.description}</span>
          </div>
          <button
            onClick={() => setHint(null)}
            className="rounded-md px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
            aria-label="Dismiss hint"
          >
            ✕
          </button>
        </div>
      )}

      <AppearanceBar skin={skin} face={face} onSkinChange={setSkin} onFaceChange={setFace} />
      <NewGameToast visible={toastVisible} skin={skin} face={face} />

      {/* Game board */}
      <div className="game-board-glass glass mt-4 overflow-x-auto rounded-2xl p-3 sm:p-5">
        <div ref={boardRef}>
          {/* Top row: Stock, Waste, gap, Foundations × 4 */}
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
                  backSkin={skin}
                  faceStyle={face}
                  interactive
                  onPointerDown={(e) => { e.stopPropagation(); handleStockClick(); }}
                />
              ) : (
                <div
                  className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-xl text-muted-foreground/50 cursor-pointer"
                  onClick={handleStockClick}
                  title="Recycle waste"
                >
                  ↺
                </div>
              )}
            </div>

            {/* Waste */}
            <div
              style={{ width: cardW, height: cardH, flexShrink: 0 }}
              onClick={handleWasteClick}
              className={`card-slot-container${wasteTop ? " cursor-pointer" : ""}`}
              title="Waste pile"
            >
              {wasteTop ? (
                <PlayingCard
                  card={wasteTop}
                  selected={isSelWaste}
                  hinted={hint?.kind === "waste-to-foundation" || hint?.kind === "waste-to-tableau"}
                  backSkin={skin}
                  faceStyle={face}
                  interactive
                  onPointerDown={(e) => { e.stopPropagation(); handleWasteClick(); }}
                  onDoubleClick={handleWasteDblClick}
                />
              ) : (
                <div className="slot-empty h-full w-full rounded-[var(--card-radius)]" />
              )}
            </div>

            {/* Reserve */}
            <div
              style={{ width: cardW, height: cardH, flexShrink: 0, position: "relative" }}
              className="cursor-pointer"
              onClick={handleReserveClick}
              title={`Reserve (${game.reserve.length} cards)`}
            >
              {game.reserve.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    width: cardW,
                    height: cardH,
                    borderRadius: "var(--card-radius, 8px)",
                    background: "var(--surface, #1e293b)",
                    border: "1px solid var(--border)",
                    zIndex: 0,
                  }}
                />
              )}
              {reserveTop ? (
                <div style={{ position: "relative", zIndex: 1, width: cardW, height: cardH }}>
                  <PlayingCard
                    card={reserveTop}
                    selected={isSelReserve}
                    hinted={hint?.kind === "reserve-to-foundation" || hint?.kind === "reserve-to-tableau"}
                    backSkin={skin}
                    faceStyle={face}
                    interactive
                    onPointerDown={(e) => { e.stopPropagation(); handleReserveClick(); }}
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
              return (
                <div
                  key={i}
                  style={{ width: cardW, height: cardH, flexShrink: 0 }}
                  className="card-slot-container cursor-pointer"
                  onClick={() => handleFoundationClick(i)}
                  title={top ? `Foundation ${i + 1}: ${rankLabel(top.rank)}${suitGlyph(top.suit)}` : `Foundation ${i + 1} (starts at ${baseLabel})`}
                >
                  {top ? (
                    <PlayingCard
                      card={top}
                      backSkin={skin}
                      faceStyle={face}
                    />
                  ) : (
                    <div
                      className="slot-empty flex h-full w-full items-center justify-center rounded-[var(--card-radius)] text-sm font-bold text-muted-foreground/40"
                      onClick={() => handleFoundationClick(i)}
                    >
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
              const colHeight =
                col.length === 0
                  ? cardH
                  : cardH + (col.length - 1) * overlap;
              const isSelCol =
                selection?.kind === "tableau" && selection.col === colIdx;
              const selFromIndex =
                isSelCol && selection?.kind === "tableau" ? selection.fromIndex : -1;

              return (
                <div
                  key={colIdx}
                  style={{ width: cardW, position: "relative", height: colHeight + 4, flexShrink: 0 }}
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
                      const isHintedSrc =
                        hintedTableauCol === colIdx &&
                        hintedTableauFromIndex !== undefined &&
                        cardIdx >= hintedTableauFromIndex;
                      const isHintedDest = hintedTableauDest === colIdx && isTop;

                      return (
                        <div
                          key={card.id}
                          style={{
                            position: "absolute",
                            top: cardIdx * overlap,
                            width: cardW,
                            height: cardH,
                            zIndex: cardIdx,
                          }}
                          onClick={() => handleTableauClick(colIdx, cardIdx)}
                        >
                          <PlayingCard
                            card={card}
                            selected={isSelected}
                            hinted={isHintedSrc || isHintedDest}
                            backSkin={skin}
                            faceStyle={face}
                            interactive={isTop}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              handleTableauClick(colIdx, cardIdx);
                            }}
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

          {/* Stock / waste counts */}
          <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
            <span>Stock: {game.stock.length}</span>
            <span>Waste: {game.waste.length}</span>
            <span>Reserve: {game.reserve.length}</span>
          </div>
        </div>
      </div>

      {game.won && (
        <WinBanner
          message={`Canfield won in ${game.moves} moves!`}
          onNew={reset}
        />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Click to select, click destination to move. Double-click to send to foundation. Draw 3 from stock.
      </p>
    </div>
  );
}
