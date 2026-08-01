/**
 * Shared drag-mode preference — single localStorage key used by all games
 * that support drag-and-drop (Klondike, Spider, FreeCell).
 *
 * Default is `true` (drag mode on). The setting persists across refreshes and
 * is shared across all supported games so the player only has to choose once.
 */
import { useState } from "react";

const STORAGE_KEY = "drag-mode";

export function useDragMode() {
  const [dragMode, setDragMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === "true"; // default ON
  });

  const toggleDragMode = () => {
    setDragMode((m) => {
      const next = !m;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return { dragMode, toggleDragMode };
}

/**
 * Renders a labelled iOS-style slider toggle:
 *   Click  [●    ]  Drag
 *   Click  [    ●]  Drag   ← neon glow when drag is active
 *
 * Pass game-specific instruction text as `dragHint` / `clickHint`.
 */
export function DragModeToggle({
  dragMode,
  onToggle,
  dragHint = "Drag cards to move them",
  clickHint = "Click a card to select, then click a destination",
}: {
  dragMode: boolean;
  onToggle: () => void;
  dragHint?: string;
  clickHint?: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2">
        {/* "Click" label */}
        <span
          className="text-xs font-medium transition-colors"
          style={{ color: !dragMode ? "var(--foreground)" : "var(--muted-foreground)" }}
        >
          Click
        </span>

        {/* Slider switch */}
        <button
          role="switch"
          aria-checked={dragMode}
          onClick={onToggle}
          className="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neon)] focus-visible:ring-offset-2"
          style={{
            background: dragMode ? "var(--neon)" : "hsl(var(--muted))",
            boxShadow: dragMode ? "0 0 12px -2px var(--neon)" : undefined,
            transition: "background 0.2s, box-shadow 0.2s",
          }}
          aria-label={dragMode ? "Switch to click mode" : "Switch to drag mode"}
        >
          <span
            className="pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm"
            style={{
              transform: dragMode ? "translateX(18px)" : "translateX(0px)",
              transition: "transform 0.2s",
            }}
          />
        </button>

        {/* "Drag" label */}
        <span
          className="text-xs font-medium transition-colors"
          style={{ color: dragMode ? "var(--foreground)" : "var(--muted-foreground)" }}
        >
          Drag
        </span>
      </div>

      {/* Contextual hint */}
      <p className="text-center text-xs text-muted-foreground">
        {dragMode ? dragHint : clickHint}
      </p>
    </div>
  );
}
