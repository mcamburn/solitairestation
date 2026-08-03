import { useCallback, useEffect, useRef, useState } from "react";

function fmt(secs: number): string {
  const s = Math.max(0, secs);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Manages the in-game timer with manual pause and auto-resume.
 *
 * @param startedAt       – `game.startedAt` from game state. When this changes
 *                          (new game started) the pause state is reset automatically.
 * @param activitySignal  – pass `game` or `state` (any value that changes on
 *                          every move / undo / deal). When it changes the timer
 *                          auto-resumes from pause.
 *
 * Returns
 *   `time`              – formatted "MM:SS" string for display
 *   `getElapsedSeconds` – call at win-time; accounts for all paused intervals
 *   `isPaused`          – whether the timer is currently paused
 *   `pause`             – freeze the timer; auto-resumes on the next game action
 */
export function useGameTimer(startedAt: number, activitySignal: unknown) {
  const [, setTick] = useState(0);
  const ref = useRef<{ pausedAt: number | null; offset: number }>({
    pausedAt: null,
    offset: 0,
  });
  const prevStartedAt = useRef(startedAt);

  // 1-second tick so the display updates while running
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Fires on every game-state change (move, undo, deal, new game)
  useEffect(() => {
    const r = ref.current;
    if (startedAt !== prevStartedAt.current) {
      // New game started — reset pause state entirely
      r.pausedAt = null;
      r.offset = 0;
      prevStartedAt.current = startedAt;
    } else if (r.pausedAt !== null) {
      // Move made while paused — auto-resume
      r.offset += Date.now() - r.pausedAt;
      r.pausedAt = null;
    }
    setTick((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activitySignal]);

  const pause = useCallback((): void => {
    if (ref.current.pausedAt !== null) return; // already paused
    ref.current.pausedAt = Date.now();
    setTick((n) => n + 1);
  }, []);

  /** Elapsed seconds at the moment of the call — use this for win recording. */
  const getElapsedSeconds = useCallback((): number => {
    const { pausedAt, offset } = ref.current;
    const now = pausedAt !== null ? pausedAt : Date.now();
    return Math.max(0, Math.floor((now - startedAt - offset) / 1000));
  }, [startedAt]);

  return {
    time: fmt(getElapsedSeconds()),
    getElapsedSeconds,
    isPaused: ref.current.pausedAt !== null,
    pause,
  };
}
