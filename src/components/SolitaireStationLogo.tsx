import { Link } from "@tanstack/react-router";

interface Props {
  /** "full" = icon + both text lines (default); "mark" = icon only */
  variant?: "full" | "mark";
  className?: string;
}

/**
 * Solitaire Station brand lockup.
 * All colours are hardcoded in the SVG to stay crisp against any background.
 */
export function SolitaireStationLogo({ variant = "full", className = "" }: Props) {
  if (variant === "mark") {
    return (
      <Link to="/" aria-label="Solitaire Station — home" className={`inline-flex shrink-0 ${className}`}>
        <svg
          viewBox="0 0 36 44"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          aria-hidden="true"
          style={{ display: "block" }}
        >
          <CardIcon />
        </svg>
      </Link>
    );
  }

  return (
    <Link to="/" aria-label="Solitaire Station — home" className={`flex w-full items-center ${className}`}>
      {/* Single combined SVG — card icon + wordmark — fills available width */}
      <svg
        viewBox="0 0 340 44"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        aria-hidden="true"
        width="100%"
        height="3.5rem"
        preserveAspectRatio="xMinYMid meet"
        style={{ display: "block" }}
      >
        {/* Card icon — native 36×44, fills full viewBox height */}
        <CardIcon />

        {/* SOLITAIRE — stretched to fill remaining width */}
        <text
          x="50" y="22"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="20"
          fontWeight="700"
          fill="#d4a832"
          textLength="286"
          lengthAdjust="spacingAndGlyphs"
        >
          SOLITAIRE
        </text>

        {/* Decorative rule */}
        <line x1="50" y1="27" x2="340" y2="27" stroke="#d4a832" strokeWidth="0.6" strokeOpacity="0.35"/>

        {/* STATION — stretched to fill remaining width */}
        <text
          x="50" y="40"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="14"
          fontWeight="500"
          fill="#9a7820"
          textLength="286"
          lengthAdjust="spacingAndGlyphs"
        >
          STATION
        </text>
      </svg>
    </Link>
  );
}

/** Reusable card + spade glyph, sized for a 36×44 viewBox */
function CardIcon() {
  return (
    <>
      {/* Drop shadow via filter */}
      <defs>
        <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.45"/>
        </filter>
        {/* Gold gradient for the card face */}
        <linearGradient id="card-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0d060"/>
          <stop offset="100%" stopColor="#a87820"/>
        </linearGradient>
        {/* Felt green gradient for card back strip */}
        <linearGradient id="felt-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a5c38"/>
          <stop offset="100%" stopColor="#163320"/>
        </linearGradient>
      </defs>

      {/* Card body */}
      <rect x="1" y="1" width="34" height="42" rx="5" fill="url(#card-grad)" filter="url(#card-shadow)"/>
      {/* Inset border */}
      <rect x="2.5" y="2.5" width="31" height="39" rx="4" fill="none" stroke="#f5e080" strokeWidth="0.7" strokeOpacity="0.45"/>

      {/* Spade suit — center of card */}
      {/* Head: two overlapping circles */}
      <circle cx="13" cy="22" r="7.2" fill="#1a3020"/>
      <circle cx="23" cy="22" r="7.2" fill="#1a3020"/>
      {/* Top point */}
      <polygon points="18,10 11,24 25,24" fill="#1a3020"/>
      {/* Stem */}
      <rect x="15.5" y="28" width="5" height="5" rx="1" fill="#1a3020"/>
      <ellipse cx="18" cy="35" rx="5.5" ry="2" fill="#1a3020"/>

      {/* Corner rank labels */}
      <text x="4" y="11" fontFamily="Georgia, serif" fontSize="8" fontWeight="700" fill="#1a3020">♠</text>
      <text x="23" y="41" fontFamily="Georgia, serif" fontSize="8" fontWeight="700" fill="#1a3020" transform="rotate(180 26 38)">♠</text>
    </>
  );
}
