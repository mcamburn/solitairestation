/**
 * Shared drag-mode preference — single localStorage key used by all games
 * that support drag-and-drop (Klondike, Spider, FreeCell).
 *
 * Default is `true` (drag mode on). The setting persists across refreshes and
 * is shared across all supported games so the player only has to choose once.
 */
import { useState } from "react";

const STORAGE_KEY = "drag-mode";

/**
 * Finds the nearest data-drop-zone element at or near (x, y).
 * Checks the exact pointer point first; if nothing is found and radius > 0,
 * samples 8 evenly-spaced points in a ring at `radius` px so an off-center
 * finger release still hits the intended target on mobile.
 *
 * Use a small radius (~16 px) for hover-highlight and a larger one (~32 px)
 * for the actual drop on pointerup.
 */
export function findDropZone(x: number, y: number, radius = 0): string | null {
  const hitAt = (px: number, py: number) => {
    const els = document.elementsFromPoint(px, py) as Element[];
    return (
      els.find((el) => el.hasAttribute?.("data-drop-zone"))
        ?.getAttribute("data-drop-zone") ?? null
    );
  };
  const exact = hitAt(x, y);
  if (exact || radius === 0) return exact;
  for (let deg = 0; deg < 360; deg += 45) {
    const r = (deg * Math.PI) / 180;
    const hit = hitAt(x + Math.cos(r) * radius, y + Math.sin(r) * radius);
    if (hit) return hit;
  }
  return null;
}

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

      {/* Scroll-to-instructions link */}
      <a
        href="#how-to-play"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("how-to-play")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="w-full text-center text-xs hover:underline"
        style={{ color: "var(--muted-foreground)" }}
      >
        ↓ Game instructions
      </a>
    </div>
  );
}
