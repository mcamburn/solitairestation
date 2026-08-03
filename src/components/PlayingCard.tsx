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
  const isFaceCard = ["J", "Q", "K"].includes(label);

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

  // Inner border style varies by faceStyle; retro needs inline colour so it reacts to suit
  const innerBorderStyle =
    faceStyle === "retro"
      ? {
          boxShadow: `inset 0 0 0 1px ${isRed ? "color-mix(in oklab, var(--red-suit) 45%, transparent)" : "color-mix(in oklab, var(--neon) 45%, transparent)"}, inset 0 0 10px ${isRed ? "color-mix(in oklab, var(--red-suit) 12%, transparent)" : "color-mix(in oklab, var(--neon) 12%, transparent)"}`,
        }
      : undefined;

  // Crown + suit illustration shown for J/Q/K (hidden on narrow cards via card-body query)
  const faceIllustration = isFaceCard && faceStyle !== "minimal" ? (
    <div
      className={`card-body card-face-illustration absolute inset-0 flex flex-col items-center justify-center gap-0.5`}
    >
      {/* Crown */}
      <span
        className="card-face-crown leading-none"
        style={
          faceStyle === "retro"
            ? {
                fontSize: "1.25rem",
                color: isRed ? "var(--red-suit)" : "var(--neon)",
                textShadow: `0 0 8px ${isRed ? "var(--red-suit)" : "var(--neon)"}`,
                opacity: 0.85,
              }
            : faceStyle === "outline"
            ? {
                fontSize: "1.2rem",
                color: "transparent",
                WebkitTextStroke: `1.5px ${isRed ? "var(--red-suit)" : "var(--card-foreground)"}`,
              }
            : faceStyle === "bold"
            ? {
                fontSize: "1.3rem",
                fontWeight: 900,
                color: isRed ? "var(--red-suit)" : "oklch(0.97 0.015 80)",
                opacity: 0.55,
              }
            : faceStyle === "script"
            ? {
                fontSize: "1.25rem",
                fontFamily,
                color: isRed ? "var(--red-suit)" : "var(--card-foreground)",
                opacity: 0.5,
                transform: "rotate(-4deg)",
                display: "inline-block",
              }
            : faceStyle === "pixel"
            ? {
                fontSize: "1.1rem",
                fontFamily,
                color: isRed ? "var(--red-suit)" : "var(--card-foreground)",
                opacity: 0.55,
              }
            : faceStyle === "stencil"
            ? {
                fontSize: "1.2rem",
                fontFamily,
                fontWeight: 900,
                color: isRed ? "var(--red-suit)" : "var(--card-foreground)",
                opacity: 0.45,
                letterSpacing: "0.05em",
              }
            : /* modern / classic */
              {
                fontSize: "1.15rem",
                fontFamily,
                color: isRed ? "var(--red-suit)" : "var(--card-foreground)",
                opacity: 0.48,
              }
        }
      >
        ♛
      </span>

      {/* Suit */}
      <span
        className={`card-face-suit leading-none ${textColorClass}`}
        style={
          faceStyle === "retro"
            ? {
                fontSize: "2.1rem",
                color: isRed ? "var(--red-suit)" : "var(--neon)",
                textShadow: `0 0 6px ${isRed ? "var(--red-suit)" : "var(--neon)"}, 0 0 16px ${isRed ? "var(--red-suit)" : "var(--neon)"}`,
              }
            : faceStyle === "outline"
            ? {
                fontSize: "2.2rem",
                color: "transparent",
                WebkitTextStroke: `2px ${isRed ? "var(--red-suit)" : "var(--card-foreground)"}`,
              }
            : faceStyle === "bold"
            ? { fontSize: "2.5rem", fontWeight: 900 }
            : faceStyle === "pixel"
            ? { fontSize: "2rem", fontFamily }
            : faceStyle === "script"
            ? { fontSize: "2.2rem", fontFamily, fontStyle: "italic" }
            : faceStyle === "stencil"
            ? { fontSize: "2rem", fontFamily, fontWeight: 900 }
            : faceStyle === "classic"
            ? { fontSize: "2.2rem", fontFamily }
            : { fontSize: "2rem" }
        }
      >
        {glyph}
      </span>
    </div>
  ) : null;

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
      {/* Style-specific inner border accent */}
      <div
        className="card-inner-border"
        style={innerBorderStyle}
        aria-hidden="true"
      />

      <div
        className={`card-corner flex items-start justify-between text-[17px] font-semibold leading-none ${textColorClass}`}
        style={{ fontFamily }}
      >
        <div className="flex flex-col items-center">
          <span className="card-rank">{label}</span>
          <span className="card-rank-suit text-[14px]">{glyph}</span>
        </div>
        {faceStyle !== "minimal" && (
          <div className={`card-top-glyph text-[26px] leading-none ${isRed ? "text-red-suit" : textColorClass}`}>
            {glyph}
          </div>
        )}
      </div>

      {/* Centre pip — replaces corner on very narrow cards (≤50 px) via CSS container query */}
      <div
        className={`card-center-pip absolute inset-0 hidden flex-col items-center justify-center gap-0.5 leading-none ${textColorClass}`}
        style={{ fontFamily }}
        aria-hidden="true"
      >
        <span className="card-center-rank font-semibold">{label}</span>
        <span className="card-center-suit">{glyph}</span>
      </div>

      {/* Face card illustration (J/Q/K): crown + suit */}
      {faceIllustration}

      {/* Non-face-card center bodies (hidden when faceIllustration is shown) */}
      {!isFaceCard && (
        faceStyle === "minimal" ? (
          <div
            className={`card-body absolute inset-x-0 bottom-2 flex justify-center text-2xl opacity-80 ${textColorClass}`}
          >
            {glyph}
          </div>
        ) : faceStyle === "bold" ? (
          <div
            className={`card-body absolute inset-0 flex flex-col items-center justify-center leading-none ${textColorClass}`}
            style={{ fontFamily }}
          >
            <span className="text-5xl font-black tracking-tighter">{label}</span>
            <span className={`mt-1 text-2xl ${isRed ? "text-red-suit" : ""}`}>{glyph}</span>
          </div>
        ) : faceStyle === "pixel" ? (
          <div
            className={`card-body absolute inset-0 flex items-center justify-center ${textColorClass}`}
            style={{ fontFamily }}
          >
            <span className="text-4xl font-bold" style={{ letterSpacing: "-0.05em" }}>
              {label}
            </span>
          </div>
        ) : faceStyle === "script" ? (
          <div
            className={`card-body absolute inset-0 flex items-center justify-center ${textColorClass}`}
            style={{ fontFamily }}
          >
            <span className="text-5xl italic" style={{ transform: "rotate(-6deg)" }}>
              {label}
            </span>
          </div>
        ) : faceStyle === "outline" ? (
          <div
            className="card-body absolute inset-0 flex items-center justify-center"
            style={{ fontFamily }}
          >
            <span
              className="text-5xl font-black"
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
            className="card-body absolute inset-0 flex items-center justify-center"
            style={{ fontFamily }}
          >
            <span
              className="text-4xl font-bold"
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
            className={`card-body absolute inset-0 flex items-center justify-center ${textColorClass}`}
            style={{ fontFamily }}
          >
            <span className="text-5xl font-black uppercase" style={{ letterSpacing: "0.02em" }}>
              {label}
            </span>
          </div>
        ) : (
          /* modern / classic — non-face cards */
          <div
            className={`card-body absolute inset-0 flex items-center justify-center text-4xl opacity-90 ${textColorClass}`}
            style={{ fontFamily }}
          >
            {card.rank === 1 ? (
              <span className="text-5xl">{glyph}</span>
            ) : (
              <span className={faceStyle === "classic" ? "text-4xl" : "text-3xl"}>{glyph}</span>
            )}
          </div>
        )
      )}

      {/* Minimal face cards still show just suit (same as other ranks) */}
      {isFaceCard && faceStyle === "minimal" && (
        <div
          className={`card-body absolute inset-x-0 bottom-2 flex justify-center text-2xl opacity-80 ${textColorClass}`}
        >
          {glyph}
        </div>
      )}
    </div>
  );
}
