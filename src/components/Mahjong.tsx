import { useEffect, useRef, useState } from "react";
import { saveGame, loadGame, clearGame } from "@/lib/persist";
import { recordWin, recordLoss, type GameStats } from "@/lib/stats";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import {
  newMahjongGame,
  isTileFree,
  hasAnyMatch,
  tryMahjongClick,
  findMahjongHint,
  type MahjongHint,
  LAYOUT,
  type MahjongState,
} from "@/lib/mahjong";
import {
  MahjongTile,
  BOARD_W,
  BOARD_H,
} from "./MahjongTile";
import { WinBanner } from "./WinBanner";

function formatTime(startedAt: number): string {
  const secs = Math.floor((Date.now() - startedAt) / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function Mahjong() {
  const [state, setState] = useState<MahjongState | null>(null);
  const [history, setHistory] = useState<MahjongState[]>([]);
  const [hint, setHint] = useState<MahjongHint | null>(null);
  const [stuck, setStuck] = useState(false);
  const [, forceUpdate] = useState(0);

  // Stats & daily challenge
  const statsRef = useRef(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const dailyModeRef = useRef(false);
  const { dailySeed, dailyTrigger, onDailyWin } = useDailyChallenge();

  useEffect(() => {
    const saved = loadGame<MahjongState>("mahjong");
    if (saved && saved.moves > 0) {
      setState(saved);
      if (!saved.won) setStuck(!hasAnyMatch(saved.alive, saved.types));
    } else {
      if (saved) clearGame("mahjong"); // discard stale zero-move save
      setState(newMahjongGame());
    }
  }, []);

  useEffect(() => {
    if (state && state.moves > 0) saveGame("mahjong", state);
  }, [state]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (dailyTrigger === 0) return;
    dailyModeRef.current = true;
    statsRef.current = false;
    reset(dailySeed);
  }, [dailyTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (statsRef.current || !state) return;
    if (state.won) {
      statsRef.current = true;
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      setGameStats(recordWin("mahjong", elapsed, state.moves, dailyModeRef.current));
      if (dailyModeRef.current) { onDailyWin(); dailyModeRef.current = false; }
    } else if (stuck) {
      statsRef.current = true;
      setGameStats(recordLoss("mahjong", state.moves, dailyModeRef.current));
      if (dailyModeRef.current) dailyModeRef.current = false;
    }
  }, [state?.won, stuck]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scale the board so the Mahjong layout fits the available width on mobile.
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const stateLoaded = state !== null;
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setScale(Math.min(1, w / BOARD_W));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stateLoaded]);

  if (!state) {
    return (
      <div className="mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16">
        <div className="glass mt-4 h-[520px] animate-pulse rounded-2xl" />
      </div>
    );
  }

  const game = state;
  const remaining = game.alive.filter(Boolean).length;

  const commit = (next: MahjongState | null) => {
    if (!next) return;
    setHistory(h => [...h.slice(-40), game]);
    setState(next);
    setHint(null);
    // Check for no-moves-left after removal (only when a pair was removed)
    if (next.moves > game.moves && !next.won) {
      setStuck(!hasAnyMatch(next.alive, next.types));
    } else {
      setStuck(false);
    }
  };

  const undo = () => {
    setHistory(h => {
      if (h.length === 0) return h;
      setState(h[h.length - 1]);
      setHint(null);
      setStuck(false);
      return h.slice(0, -1);
    });
  };

  const reset = (seed?: number) => {
    if (state?.moves > 0 && !state?.won && !statsRef.current) {
      recordLoss("mahjong", state.moves, dailyModeRef.current);
    }
    if (!seed) dailyModeRef.current = false;
    statsRef.current = false;
    clearGame("mahjong");
    setHistory([]);
    setHint(null);
    setStuck(false);
    setState(newMahjongGame(seed));
  };

  const showHint = () => {
    const h = findMahjongHint(game);
    setHint(h ?? { idxA: -1, idxB: -1, description: "No matches available — try undoing or starting a new game." });
  };

  const handleTileClick = (idx: number) => {
    commit(tryMahjongClick(game, idx));
  };

  const time = formatTime(game.startedAt);

  return (
    <div className="mx-auto w-full max-w-[900px] xl:max-w-[1200px] px-4 xl:px-6 pb-16">
      {/* Top bar */}
      <div className="glass mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            Moves <span className="font-semibold text-foreground">{game.moves}</span>
          </span>
          <span className="tabular-nums text-muted-foreground">{time}</span>
          <span className="text-muted-foreground">
            Remaining{" "}
            <span
              className="font-semibold"
              style={{ color: remaining < 20 ? "var(--neon)" : undefined }}
            >
              {remaining}/144
            </span>
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
            onClick={() => reset()}
            className="rounded-lg px-2.5 py-1 text-primary-foreground transition hover:opacity-90"
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
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--neon)", boxShadow: "0 0 8px var(--neon)" }} />
            <span className="font-medium">Hint</span>
            <span className="text-muted-foreground">{hint.description}</span>
          </div>
          <button onClick={() => setHint(null)} className="rounded-md px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground" aria-label="Dismiss hint">✕</button>
        </div>
      )}

      {/* Board */}
      <div className="glass mt-4 overflow-x-auto rounded-2xl p-3 sm:p-4">
        {/* boardRef measures available content width for scaling */}
        <div ref={boardRef}>
          <div
            className="mx-auto overflow-hidden"
            style={{ width: Math.round(BOARD_W * scale), height: Math.round(BOARD_H * scale) }}
          >
            <div
              className="relative"
              style={{
                width: BOARD_W,
                height: BOARD_H,
                transformOrigin: "top left",
                transform: `scale(${scale})`,
              }}
            >
              {LAYOUT.map((pos, idx) => {
                if (!game.alive[idx]) return null;
                const free = isTileFree(game.alive, idx);
                return (
                  <MahjongTile
                    key={idx}
                    tileKey={game.types[idx]}
                    isFree={free}
                    isSelected={game.selected === idx}
                    isHinted={hint !== null && (hint.idxA === idx || hint.idxB === idx)}
                    layer={pos.layer}
                    row={pos.row}
                    col={pos.col}
                    onClick={() => handleTileClick(idx)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* No-moves banner */}
      {stuck && !game.won && (
        <div
          className="glass mt-6 rounded-2xl px-8 py-8 text-center"
          style={{ borderColor: "#f59e0b", boxShadow: "0 0 30px -8px #f59e0b" }}
        >
          <div className="text-4xl">🤔</div>
          <h2 className="mt-3 text-xl font-bold tracking-tight">No more matches</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No free tiles can be paired. Try undoing or start a new game.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="rounded-xl border border-border px-5 py-2 text-sm transition hover:bg-secondary/70 disabled:opacity-40"
            >
              Undo
            </button>
            <button
              onClick={() => reset()}
              className="rounded-xl px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}
            >
              New Game
            </button>
          </div>
        </div>
      )}

      {game.won && (
        <WinBanner
          message={`All 144 tiles cleared in ${game.moves} moves!`}
          onNew={reset}
          stats={gameStats}
        />
      )}

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Click two matching free tiles (unblocked on a side) to remove them.
        Flowers and seasons match each other within their group.
      </p>
    </div>
  );
}
