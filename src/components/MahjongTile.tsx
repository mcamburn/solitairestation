import { TILE_META } from "@/lib/mahjong";

export const TILE_W = 50;
export const TILE_H = 64;
export const COL_GAP = 2;
export const ROW_GAP = 2;
export const LAYER_OFFSET = 5;
export const MAX_LAYER = 4;
export const BASE_PAD = MAX_LAYER * LAYER_OFFSET; // 20px — prevents offscreen tiles

export const BOARD_W = BASE_PAD + 11 * (TILE_W + COL_GAP) + TILE_W + BASE_PAD; // ≈ 662
export const BOARD_H = BASE_PAD + 5  * (TILE_H + ROW_GAP) + TILE_H + BASE_PAD; // ≈ 434

export function tileLeft(layer: number, col: number): number {
  return BASE_PAD + col * (TILE_W + COL_GAP) - layer * LAYER_OFFSET;
}
export function tileTop(layer: number, row: number): number {
  return BASE_PAD + row * (TILE_H + ROW_GAP) - layer * LAYER_OFFSET;
}
export function tileZIndex(layer: number, row: number, col: number): number {
  return layer * 1000 + row * 20 + col;
}

interface Props {
  tileKey: string;
  isFree: boolean;
  isSelected: boolean;
  isHinted?: boolean;
  layer: number;
  row: number;
  col: number;
  onClick: () => void;
}

export function MahjongTile({ tileKey, isFree, isSelected, isHinted, layer, row, col, onClick }: Props) {
  const meta = TILE_META[tileKey];
  if (!meta) return null;

  const bg    = isFree ? "#F5EDD8" : "#C4BBA6";
  const bdr   = isSelected ? "var(--neon)" : isHinted ? "var(--neon-2, #a78bfa)" : isFree ? "#9A8562" : "#7A7060";
  const bw    = isSelected || isHinted ? 2 : 1;
  const color = isFree ? meta.color : "#857A6E";

  const shadow = isSelected
    ? `2px 3px 0 rgba(0,0,0,0.4), 0 0 12px var(--neon), 0 0 4px var(--neon)`
    : isHinted
    ? `2px 3px 0 rgba(0,0,0,0.4), 0 0 10px var(--neon-2, #a78bfa), 0 0 3px var(--neon-2, #a78bfa)`
    : `2px 3px 0 rgba(0,0,0,0.35)`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isFree && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={isFree ? onClick : undefined}
      onKeyDown={isFree ? handleKeyDown : undefined}
      role={isFree ? "button" : undefined}
      tabIndex={isFree ? 0 : undefined}
      aria-label={isFree ? `${meta.char} tile, free` : undefined}
      aria-disabled={!isFree}
      className="absolute select-none transition-[box-shadow,border-color] duration-100"
      style={{
        left:   tileLeft(layer, col),
        top:    tileTop(layer, row),
        zIndex: tileZIndex(layer, row, col),
        width: TILE_W, height: TILE_H,
        background: bg,
        border: `${bw}px solid ${bdr}`,
        borderRadius: 5,
        boxShadow: shadow,
        cursor: isFree ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      {meta.topLabel && (
        <span className="absolute" style={{ top: 2, left: 3, fontSize: 8, fontWeight: 700, color, opacity: 0.65, lineHeight: 1 }}>
          {meta.topLabel}
        </span>
      )}
      <span style={{ fontSize: meta.suit === "bamboo" ? 20 : 22, fontWeight: 800, color, lineHeight: 1 }}>
        {meta.char}
      </span>
      <span style={{ fontSize: 9, fontWeight: 600, color, opacity: 0.55, lineHeight: 1 }}>
        {meta.sub}
      </span>
    </div>
  );
}
