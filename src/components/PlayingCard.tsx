import { type Card, rankLabel, suitColor, suitGlyph } from "@/lib/solitaire";

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

  // Bottom accent line style — unique per face style
  const bottomAccentStyle: React.CSSProperties =
    faceStyle === "retro"
      ? { height: 1, background: isRed ? "var(--red-suit)" : "var(--neon)", boxShadow: `0 0 5px ${isRed ? "var(--red-suit)" : "var(--neon)"}`, opacity: 0.75 }
      : faceStyle === "bold"
      ? { height: 2, background: "color-mix(in oklab, var(--neon) 30%, transparent)", borderRadius: 1 }
      : faceStyle === "classic"
      ? { height: 0, borderTop: "1px solid var(--card-foreground)", boxShadow: "0 3px 0 var(--card-foreground)", opacity: 0.12 }
      : faceStyle === "pixel"
      ? { height: 0, borderTop: "2px dashed var(--card-foreground)", opacity: 0.22 }
      : faceStyle === "script"
      ? { height: 0, borderTop: "1px solid oklch(0.5 0.09 65)", opacity: 0.32 }
      : faceStyle === "stencil"
      ? { height: 2, background: "var(--card-foreground)", opacity: 0.11, borderRadius: 0 }
      : faceStyle === "outline"
      ? { height: 0, borderTop: "1.5px solid var(--card-foreground)", opacity: 0.15 }
      : faceStyle === "minimal"
      ? { height: 0, borderTop: "1px dotted var(--card-foreground)", opacity: 0.18 }
      : /* modern */ { height: 0, borderTop: "1px solid var(--card-foreground)", opacity: 0.08 };

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
      {/* ── Bottom: accent line + rotated corner ─────────────────── */}
      <div
        className="card-bottom-section absolute bottom-1 inset-x-1 flex flex-col items-stretch"
        aria-hidden="true"
      >
        {/* Style-specific accent line */}
        <div className="card-bottom-accent w-full" style={bottomAccentStyle} />
        {/* Rotated rank+suit — mirrors the top-left corner at 180° */}
        <div className="flex justify-end mt-0.5">
          <div
            className={`card-bottom-corner flex flex-col items-center text-[18px] font-semibold leading-none ${textColorClass}`}
            style={{ fontFamily, transform: "rotate(180deg)" }}
          >
            <span className="card-rank">{label}</span>
            <span className="card-rank-suit text-[15px]">{glyph}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
