import { type Card, rankLabel, suitColor, suitGlyph } from "@/lib/solitaire";

// ── Per-style illustrated vignette rendered at the bottom of each card ────────
function BottomVignette({
  faceStyle,
  isRed,
  isBoldFace,
}: {
  faceStyle: string;
  isRed: boolean;
  isBoldFace: boolean;
}) {
  // fg = main stroke/fill colour that reads against this style's card background
  const fg = isRed
    ? "var(--red-suit)"
    : isBoldFace
    ? "var(--foreground)"
    : "var(--card-foreground)";
  // ac = accent/glow colour (neon or red)
  const ac = isRed ? "var(--red-suit)" : "var(--neon)";

  switch (faceStyle) {
    // ── Modern: clean diamond outline ──────────────────────────────────────
    case "modern":
      return (
        <svg width="22" height="12" viewBox="0 0 32 18" aria-hidden="true">
          <path d="M16 1 L31 9 L16 17 L1 9 Z" fill="none" stroke={fg}
            strokeWidth="1.5" strokeLinejoin="round" opacity="0.18" />
        </svg>
      );

    // ── Classic: mini heraldic crown ───────────────────────────────────────
    case "classic":
      return (
        <svg width="26" height="16" viewBox="0 0 32 20" aria-hidden="true">
          <path d="M2 18 L2 10 L10 15 L16 2 L22 15 L30 10 L30 18 Z"
            fill="none" stroke={fg} strokeWidth="1.5" strokeLinejoin="round" opacity="0.22" />
          <rect x="2" y="18" width="28" height="1.5" rx="0.75" fill={fg} opacity="0.18" />
        </svg>
      );

    // ── Minimal: three spaced dots ─────────────────────────────────────────
    case "minimal":
      return (
        <svg width="26" height="8" viewBox="0 0 32 8" aria-hidden="true">
          <circle cx="8"  cy="4" r="2.5" fill={fg} opacity="0.22" />
          <circle cx="16" cy="4" r="2.5" fill={fg} opacity="0.22" />
          <circle cx="24" cy="4" r="2.5" fill={fg} opacity="0.22" />
        </svg>
      );

    // ── Bold: thick upward chevron ─────────────────────────────────────────
    case "bold":
      return (
        <svg width="28" height="14" viewBox="0 0 32 14" aria-hidden="true">
          <path d="M2 13 L16 1 L30 13" fill="none" stroke={fg}
            strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </svg>
      );

    // ── Pixel: pixel-art 5×5 star ──────────────────────────────────────────
    case "pixel": {
      // 5-col × 5-row grid, each pixel 3 px, 1 px gap
      const px = 3;
      const dots: [number, number][] = [
        [2,0],
        [1,1],[2,1],[3,1],
        [0,2],[1,2],[2,2],[3,2],[4,2],
        [1,3],[2,3],[3,3],
        [2,4],
      ];
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          {dots.map(([x, y], i) => (
            <rect key={i} x={x * px + 2} y={y * px + 2}
              width={px - 0.5} height={px - 0.5} fill={fg} opacity="0.3" />
          ))}
        </svg>
      );
    }

    // ── Script: flowing S-curve flourish ───────────────────────────────────
    case "script":
      return (
        <svg width="30" height="12" viewBox="0 0 32 12" aria-hidden="true">
          <path d="M2 10 C 8 0, 14 12, 20 2 C 24 -2, 30 6, 30 10"
            fill="none" stroke={fg} strokeWidth="1.5" strokeLinecap="round" opacity="0.32" />
        </svg>
      );

    // ── Outline: concentric rings ──────────────────────────────────────────
    case "outline":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="none" stroke={fg} strokeWidth="1.5" opacity="0.18" />
          <circle cx="12" cy="12" r="6"  fill="none" stroke={fg} strokeWidth="1"   opacity="0.14" />
          <circle cx="12" cy="12" r="2.5" fill={fg} opacity="0.14" />
        </svg>
      );

    // ── Retro: neon 4-pointed starburst ───────────────────────────────────
    case "retro":
      return (
        <svg width="24" height="24" viewBox="0 0 28 28" aria-hidden="true"
          style={{ overflow: "visible", filter: `drop-shadow(0 0 4px ${ac})` }}>
          <path d="M14 2 L16.5 11.5 L26 14 L16.5 16.5 L14 26 L11.5 16.5 L2 14 L11.5 11.5 Z"
            fill={ac} opacity="0.65" />
        </svg>
      );

    // ── Stencil: angular hexagonal badge ──────────────────────────────────
    case "stencil":
      return (
        <svg width="28" height="14" viewBox="0 0 32 16" aria-hidden="true">
          <path d="M9 1 L23 1 L31 8 L23 15 L9 15 L1 8 Z"
            fill={fg} opacity="0.1" />
          <path d="M9 1 L23 1 L31 8 L23 15 L9 15 L1 8 Z"
            fill="none" stroke={fg} strokeWidth="1.5" opacity="0.24" />
        </svg>
      );

    default:
      return null;
  }
}

export type CardBackSkin =
  | "neon"
  | "aurora"
  | "circuit"
  | "wave"
  | "ember"
  | "prism"
  | "holo"
  | "grid"
  | "marble";

export type CardFaceStyle =
  | "modern"
  | "classic"
  | "minimal"
  | "bold"
  | "pixel"
  | "script"
  | "outline"
  | "retro"
  | "stencil";

interface Props {
  card: Card;
  selected?: boolean;
  hinted?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
  onDoubleClick?: () => void;
  /** When true, the card becomes keyboard-focusable (tabIndex=0, role=button, Enter/Space activates). */
  interactive?: boolean;
  stackOffset?: number;
  style?: React.CSSProperties;
  className?: string;
  backSkin?: CardBackSkin;
  faceStyle?: CardFaceStyle;
}

function activateOnKey(handler?: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler?.();
    }
  };
}

export function PlayingCard({
  card,
  selected,
  hinted,
  onPointerDown,
  onDoubleClick,
  interactive,
  style,
  className,
  backSkin = "neon",
  faceStyle = "modern",
}: Props) {
  if (!card.faceUp) {
    const kbProps = interactive
      ? {
          tabIndex: 0,
          role: "button" as const,
          "aria-label": "Face-down card",
          onKeyDown: activateOnKey(() =>
            onPointerDown?.(new PointerEvent("pointerdown") as unknown as React.PointerEvent)
          ),
        }
      : {};
    return (
      <div
        onPointerDown={onPointerDown}
        style={style}
        className={`card-back skin-${backSkin} h-full w-full rounded-[var(--card-radius)] ${
          hinted ? "hint-glow" : ""
        } ${className ?? ""}`}
        {...kbProps}
      >
        <div className="card-back-pattern" />
      </div>
    );
  }

  const color = suitColor(card.suit);
  const glyph = suitGlyph(card.suit);
  const label = rankLabel(card.rank);
  const isRed = color === "red";
  const isBoldFace = faceStyle === "bold";
  // For bold face: red glyphs stay red but on dark bg; black becomes light
  const textColorClass = isRed
    ? "text-red-suit"
    : isBoldFace
      ? "text-foreground"
      : "text-card-foreground";

  const fontFamily =
    faceStyle === "classic"
      ? "Georgia, 'Times New Roman', serif"
      : faceStyle === "pixel"
        ? "var(--font-mono)"
        : faceStyle === "script"
          ? "'Brush Script MT', 'Segoe Script', cursive"
          : faceStyle === "stencil"
            ? "'Impact', 'Oswald', sans-serif"
            : faceStyle === "retro"
              ? "var(--font-mono)"
              : "var(--font-display)";

  const ariaLabel = `${label} of ${card.suit}${selected ? ", selected" : ""}`;
  const faceUpKbProps = interactive
    ? {
        tabIndex: 0,
        role: "button" as const,
        "aria-label": ariaLabel,
        "aria-pressed": selected ?? false,
        onKeyDown: activateOnKey(() =>
          onPointerDown?.(new PointerEvent("pointerdown") as unknown as React.PointerEvent)
        ),
      }
    : {};

  return (
    <div
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={style}
      className={`playing-card face-${faceStyle} relative h-full w-full select-none rounded-[var(--card-radius)] p-2 transition-transform ${
        selected ? "glow-primary -translate-y-1" : ""
      } ${hinted ? "hint-glow" : ""} ${className ?? ""}`}
      {...faceUpKbProps}
    >
      <div
        className={`flex items-start justify-between text-[18px] font-semibold leading-none ${textColorClass}`}
        style={{ fontFamily }}
      >
        <div className="flex flex-col items-center">
          <span className="card-rank">{label}</span>
          <span className="card-rank-suit text-[15px]">{glyph}</span>
        </div>
        {faceStyle !== "minimal" && (
          <div className={`card-top-glyph text-[30px] leading-none ${isRed ? "text-red-suit" : textColorClass}`}>
            {glyph}
          </div>
        )}
      </div>

      {faceStyle === "minimal" ? (
        <div
          className={`absolute inset-x-0 bottom-2 flex justify-center text-4xl opacity-80 ${textColorClass}`}
        >
          {glyph}
        </div>
      ) : faceStyle === "bold" ? (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center leading-none ${textColorClass}`}
          style={{ fontFamily }}
        >
          <span className="text-7xl font-black tracking-tighter">{label}</span>
          <span className={`mt-1 text-4xl ${isRed ? "text-red-suit" : ""}`}>{glyph}</span>
        </div>
      ) : faceStyle === "pixel" ? (
        <div
          className={`absolute inset-0 flex items-center justify-center ${textColorClass}`}
          style={{ fontFamily }}
        >
          <span className="text-6xl font-bold" style={{ letterSpacing: "-0.05em" }}>
            {label}
          </span>
        </div>
      ) : faceStyle === "script" ? (
        <div
          className={`absolute inset-0 flex items-center justify-center ${textColorClass}`}
          style={{ fontFamily }}
        >
          <span className="text-7xl italic" style={{ transform: "rotate(-6deg)" }}>
            {label}
          </span>
        </div>
      ) : faceStyle === "outline" ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontFamily }}
        >
          <span
            className="text-7xl font-black"
            style={{
              color: "transparent",
              WebkitTextStroke: `2px ${isRed ? "var(--red-suit)" : "var(--card-foreground)"}`,
            }}
          >
            {label}
          </span>
        </div>
      ) : faceStyle === "retro" ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontFamily }}
        >
          <span
            className="text-6xl font-bold"
            style={{
              color: isRed ? "var(--red-suit)" : "var(--neon)",
              textShadow: `0 0 6px ${isRed ? "var(--red-suit)" : "var(--neon)"}, 0 0 14px ${isRed ? "var(--red-suit)" : "var(--neon)"}`,
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </span>
        </div>
      ) : faceStyle === "stencil" ? (
        <div
          className={`absolute inset-0 flex items-center justify-center ${textColorClass}`}
          style={{ fontFamily }}
        >
          <span className="text-7xl font-black uppercase" style={{ letterSpacing: "0.02em" }}>
            {label}
          </span>
        </div>
      ) : (
        <div
          className={`absolute inset-0 flex items-center justify-center text-6xl opacity-90 ${textColorClass}`}
          style={{ fontFamily }}
        >
          {["J", "Q", "K"].includes(label) ? (
            <span className={`${faceStyle === "classic" ? "text-6xl italic" : "text-5xl"} font-bold`}>
              {label}
              <span className="ml-1">{glyph}</span>
            </span>
          ) : card.rank === 1 ? (
            <span className="text-7xl">{glyph}</span>
          ) : (
            <span className={faceStyle === "classic" ? "text-6xl" : "text-5xl"}>{glyph}</span>
          )}
        </div>
      )}
      {/* ── Style-specific illustrated vignette at card bottom ────── */}
      <div
        className="card-bottom-vignette absolute bottom-1 inset-x-0 flex justify-center pointer-events-none"
        aria-hidden="true"
      >
        <BottomVignette faceStyle={faceStyle} isRed={isRed} isBoldFace={isBoldFace} />
      </div>
    </div>
  );
}
