import { type Card, rankLabel, suitColor, suitGlyph } from "@/lib/solitaire";

// ── Suit-coloured ribbon rendered at the bottom of each card ─────────────────
// Shape varies per face style; colour is always tied to the card's suit.
function BottomRibbon({
  faceStyle,
  isRed,
  isBoldFace,
}: {
  faceStyle: string;
  isRed: boolean;
  isBoldFace: boolean;
}) {
  // rc = ribbon fill — suit-red for ♥♦, theme-foreground for ♠♣ (readable on any bg)
  const rc = isRed
    ? "var(--red-suit)"
    : isBoldFace
    ? "var(--foreground)"
    : "var(--card-foreground)";
  const ac = isRed ? "var(--red-suit)" : "var(--neon)";

  // All ribbons share the same SVG shell: full card width, 14 px tall, bottom-pinned.
  // preserveAspectRatio="none" lets it stretch horizontally to any card width.
  const base = {
    className: "card-bottom-ribbon absolute bottom-0 inset-x-0 w-full pointer-events-none" as const,
    viewBox: "0 0 80 14" as const,
    preserveAspectRatio: "none" as const,
    height: 14,
    "aria-hidden": true as const,
  };

  switch (faceStyle) {
    // Straight flat band
    case "modern":
      return (
        <svg {...base}>
          <rect x="0" y="4" width="80" height="10" fill={rc} opacity="0.17" />
        </svg>
      );

    // Banner with a centre V-notch (heraldic swallow-tail)
    case "classic":
      return (
        <svg {...base}>
          <path d="M0 3 L36 3 L40 8 L44 3 L80 3 L80 14 L0 14 Z" fill={rc} opacity="0.2" />
        </svg>
      );

    // Hairline — very minimal footprint for the minimal style
    case "minimal":
      return (
        <svg {...base} height={4} viewBox="0 0 80 4">
          <rect x="0" y="0" width="80" height="4" fill={rc} opacity="0.28" />
        </svg>
      );

    // Thick solid bar — punchy, matches the bold weight
    case "bold":
      return (
        <svg {...base}>
          <rect x="0" y="0" width="80" height="14" fill={rc} opacity="0.26" />
        </svg>
      );

    // Crenellated (battlements) top edge — pixel-art feel
    case "pixel":
      return (
        <svg {...base}>
          <path
            d="M0 14 L0 8 L10 8 L10 4 L20 4 L20 8 L30 8 L30 4 L40 4 L40 8 L50 8 L50 4 L60 4 L60 8 L70 8 L70 4 L80 4 L80 14 Z"
            fill={rc} opacity="0.24"
          />
        </svg>
      );

    // Soft wave — flowing, organic
    case "script":
      return (
        <svg {...base}>
          <path
            d="M0 14 L0 9 Q10 2 20 8 Q30 14 40 7 Q50 0 60 7 Q70 14 80 8 L80 14 Z"
            fill={rc} opacity="0.22"
          />
        </svg>
      );

    // Hollow — two parallel strokes only, no fill
    case "outline":
      return (
        <svg {...base}>
          <line x1="0" y1="4"  x2="80" y2="4"  stroke={rc} strokeWidth="1.5" opacity="0.28" />
          <line x1="0" y1="12" x2="80" y2="12" stroke={rc} strokeWidth="1"   opacity="0.2"  />
        </svg>
      );

    // Glowing neon stripe
    case "retro":
      return (
        <svg {...base} height={8} viewBox="0 0 80 8"
          style={{ filter: `drop-shadow(0 0 5px ${ac})` }}>
          <rect x="0" y="2" width="80" height="5" fill={ac} opacity="0.6" />
        </svg>
      );

    // Angular trapezoid with chamfered top corners
    case "stencil":
      return (
        <svg {...base}>
          <path d="M0 14 L0 6 L6 3 L74 3 L80 6 L80 14 Z" fill={rc} opacity="0.22" />
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
      {/* ── Suit-coloured ribbon at card bottom ───────────────────── */}
      <BottomRibbon faceStyle={faceStyle} isRed={isRed} isBoldFace={isBoldFace} />
    </div>
  );
}
