/**
 * Self-contained looping animated rule demonstrations for the How-to-Play section.
 * Each export illustrates one core mechanic visually using mini cards or tiles.
 * All components are SSR-safe and loop automatically with no user interaction needed.
 */
import { useEffect, useState } from "react";

// ─── Phase timer ─────────────────────────────────────────────────────────────

function usePhase(durations: number[]): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = setTimeout(
      () => setP(x => (x + 1) % durations.length),
      durations[p],
    );
    return () => clearTimeout(t);
  }, [p]); // eslint-disable-line react-hooks/exhaustive-deps
  return p;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Glow = "none" | "valid" | "invalid" | "dim" | "faded";

// ─── MiniCard ─────────────────────────────────────────────────────────────────

function Card({
  rank, suit, faceDown = false, glow = "none",
}: {
  rank?: string; suit?: string; faceDown?: boolean; glow?: Glow;
}) {
  const red = suit === "♥" || suit === "♦";
  const invisible = glow === "faded";
  const dimmed = glow === "dim";
  return (
    <div style={{
      width: 32, height: 46, borderRadius: 4, flexShrink: 0,
      background: faceDown
        ? "oklch(0.20 0.07 255)"
        : (dimmed || invisible) ? "oklch(0.38 0.01 260)" : "oklch(0.97 0.002 250)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 2,
      opacity: dimmed ? 0.35 : invisible ? 0 : 1,
      boxShadow:
        glow === "valid"
          ? "0 0 0 2px var(--neon), 0 0 10px color-mix(in oklab, var(--neon) 50%, transparent)"
          : glow === "invalid"
          ? "0 0 0 2px var(--destructive), 0 0 8px color-mix(in oklab, var(--destructive) 50%, transparent)"
          : (dimmed || invisible) ? "none" : "0 2px 5px rgba(0,0,0,0.45)",
      transition: "box-shadow 0.3s, opacity 0.35s, background 0.3s",
      userSelect: "none",
    }}>
      {!faceDown && rank && suit && (
        <>
          <span style={{ fontSize: 12, fontWeight: 800, lineHeight: 1, color: red ? "var(--red-suit)" : "#111" }}>
            {rank}
          </span>
          <span style={{ fontSize: 10, lineHeight: 1, color: red ? "var(--red-suit)" : "#111" }}>
            {suit}
          </span>
        </>
      )}
    </div>
  );
}

// Overlapping fanned tableau column
function Fan({ cards, fanPx = 18 }: {
  cards: Array<{ rank: string; suit: string; glow?: Glow; faceDown?: boolean }>;
  fanPx?: number;
}) {
  const h = 46 + (cards.length - 1) * fanPx;
  return (
    <div style={{ position: "relative", width: 32, height: h, flexShrink: 0 }}>
      {cards.map((c, i) => (
        <div key={i} style={{ position: "absolute", top: i * fanPx }}>
          <Card {...c} glow={c.glow ?? "none"} />
        </div>
      ))}
    </div>
  );
}

// Empty or occupied free-cell slot
function FreeSlot({ card, glow = "none" }: { card?: { rank: string; suit: string }; glow?: Glow }) {
  const red = card && (card.suit === "♥" || card.suit === "♦");
  return (
    <div style={{
      width: 32, height: 46, borderRadius: 4, flexShrink: 0,
      background: card ? "oklch(0.97 0.002 250)" : "oklch(0.19 0.025 265)",
      border: card ? "none" : "1.5px dashed rgba(255,255,255,0.18)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
      boxShadow:
        glow === "valid"
          ? "0 0 0 2px var(--neon), 0 0 10px color-mix(in oklab, var(--neon) 50%, transparent)"
          : "none",
      transition: "box-shadow 0.3s, background 0.3s",
      userSelect: "none",
    }}>
      {card ? (
        <>
          <span style={{ fontSize: 12, fontWeight: 800, lineHeight: 1, color: red ? "var(--red-suit)" : "#111" }}>
            {card.rank}
          </span>
          <span style={{ fontSize: 10, lineHeight: 1, color: red ? "var(--red-suit)" : "#111" }}>
            {card.suit}
          </span>
        </>
      ) : (
        <span style={{ fontSize: 8, letterSpacing: 0.5, color: "rgba(255,255,255,0.18)", fontWeight: 600 }}>FC</span>
      )}
    </div>
  );
}

// Mahjong tile — ivory, taller than a card
function Tile({ label, glow = "none" }: { label: string; glow?: Glow }) {
  const invisible = glow === "faded";
  const dimmed = glow === "dim";
  return (
    <div style={{
      width: 36, height: 44, borderRadius: 4, flexShrink: 0,
      background: (dimmed || invisible) ? "oklch(0.22 0.03 265)" : "oklch(0.88 0.02 80)",
      border: `1.5px solid ${(dimmed || invisible) ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.22)"}`,
      boxShadow:
        glow === "valid"
          ? "0 0 0 2px var(--neon), 0 0 10px color-mix(in oklab, var(--neon) 50%, transparent), 0 3px 0 rgba(0,0,0,0.35)"
          : (dimmed || invisible) ? "none"
          : "0 3px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)",
      opacity: dimmed ? 0.3 : invisible ? 0 : 1,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 17,
      color: (dimmed || invisible) ? "rgba(255,255,255,0.15)" : "oklch(0.20 0.06 20)",
      transition: "all 0.35s",
      userSelect: "none",
    }}>
      {label}
    </div>
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Box({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div aria-hidden style={{
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      flexWrap: "wrap", gap: 16, padding: "14px 16px 10px", marginTop: 12,
      background: "oklch(0.14 0.022 265)", borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.06)", minHeight: 80,
      ...style,
    }}>
      {children}
    </div>
  );
}

function L({ text, highlight, danger }: { text: string; highlight?: boolean; danger?: boolean }) {
  return (
    <div style={{
      fontSize: 10, lineHeight: 1.3, textAlign: "center", marginTop: 5, maxWidth: 80,
      color: highlight ? "var(--neon)" : danger ? "var(--destructive)" : "var(--muted-foreground)",
      transition: "color 0.3s",
    }}>
      {text}
    </div>
  );
}

function Status({ text }: { text: string }) {
  return (
    <div style={{
      width: "100%", textAlign: "center", fontSize: 10, lineHeight: 1.3,
      padding: "5px 0 2px", color: "var(--neon)", minHeight: 18,
    }}>
      {text}
    </div>
  );
}

// ─── Demo 1: Alternating colors ── Klondike ───────────────────────────────────

/**
 * Red 7 on black 8 glows neon (valid).
 * Red 7 on red 8 glows destructive (invalid). Loops.
 */
export function AltColorDemo() {
  const p = usePhase([900, 600, 1100, 600, 1100]);
  const valid   = p === 1 || p === 2;
  const invalid = p === 3 || p === 4;

  return (
    <Box>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "8", suit: "♠", glow: valid ? "valid" : "none" },
          { rank: "7", suit: "♥", glow: valid ? "valid" : "none" },
        ]} />
        <L text={valid ? "✓ different color" : "8♠ + 7♥"} highlight={valid} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "8", suit: "♥", glow: invalid ? "invalid" : "none" },
          { rank: "7", suit: "♥", glow: invalid ? "invalid" : "none" },
        ]} />
        <L text={invalid ? "✗ same color" : "8♥ + 7♥"} danger={invalid} />
      </div>
    </Box>
  );
}

// ─── Demo 2: Same-suit vs mixed stack ── Spider ───────────────────────────────

/**
 * All-spades column: entire group glows (moveable as one).
 * Mixed-suit column: only the top card glows (lower cards locked).
 */
export function SpiderSameSuitDemo() {
  const p = usePhase([800, 800, 1200, 800, 1200]);
  const ss = p === 1 || p === 2;
  const mx = p === 3 || p === 4;

  return (
    <Box>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "6", suit: "♠", glow: ss ? "valid" : "none" },
          { rank: "5", suit: "♠", glow: ss ? "valid" : "none" },
          { rank: "4", suit: "♠", glow: ss ? "valid" : "none" },
        ]} />
        <L text={ss ? "moves as group ✓" : "same suit"} highlight={ss} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "6", suit: "♠", glow: "none" },
          { rank: "5", suit: "♥", glow: "none" },
          { rank: "4", suit: "♠", glow: mx ? "valid" : "none" },
        ]} />
        <L text={mx ? "top card only" : "mixed suit"} highlight={mx} />
      </div>
    </Box>
  );
}

// ─── Demo 3: Free-cell parking ── FreeCell ────────────────────────────────────

/**
 * J♦ blocks Q♣. J♦ parks in a free cell → Q♣ becomes accessible.
 */
export function FreeCellParkDemo() {
  const p = usePhase([1500, 1000, 1600, 700]);
  const jInStack: boolean = p <= 1;
  const jInCell:  boolean = p === 2;
  const jGlow:    Glow = p === 1 ? "valid" : "none";
  const qGlow:    Glow = p === 2 ? "valid" : "none";
  const cellGlow: Glow = p === 1 || p === 2 ? "valid" : "none";

  const statuses = [
    "J♦ is blocking Q♣",
    "park J♦ in a free cell →",
    "Q♣ is now accessible!",
    "",
  ];

  return (
    <Box style={{ flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <FreeSlot card={jInCell ? { rank: "J", suit: "♦" } : undefined} glow={cellGlow} />
        <FreeSlot />
        <FreeSlot />
        <FreeSlot />
      </div>
      {/* fixed height prevents layout shift when J♦ leaves the stack */}
      <div style={{ height: 64 }}>
        <Fan cards={[
          { rank: "Q", suit: "♣", glow: qGlow },
          ...(jInStack ? [{ rank: "J", suit: "♦", glow: jGlow }] : []),
        ]} />
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}

// ─── Demo 4: Available cards + pair removal ── Pyramid ────────────────────────

/**
 * 3-row mini pyramid:
 *          [A♠]
 *        [5♥][8♣]
 *      [K♦][9♦][4♣]
 *
 * Base row glows (available). Upper rows dim (blocked).
 * K=13 removes alone → 9+4=13 pair → 5+8=13 pair → A♠ within reach.
 */
export function PyramidAvailableDemo() {
  const p = usePhase([1600, 700, 1000, 1100, 1000, 600]);

  const kGlow:     Glow = p <= 1 ? "valid" : "faded";
  const nineGlow:  Glow = p <= 1 ? "valid" : p === 2 ? "valid" : "faded";
  const fourGlow:  Glow = p <= 1 ? "valid" : p === 2 ? "valid" : "faded";
  const fiveGlow:  Glow = p <= 2 ? "dim"   : p === 3 ? "valid" : "faded";
  const eightGlow: Glow = p <= 2 ? "dim"   : p === 3 ? "valid" : "faded";
  const aceGlow:   Glow = p === 4 ? "valid" : "dim";

  const statuses = [
    "base row: always available",
    "K = 13 — removes alone",
    "9 + 4 = 13 → remove pair",
    "5 + 8 = 13 → remove pair",
    "A♠ within reach!",
    "",
  ];

  return (
    <Box style={{ flexDirection: "column", alignItems: "center", gap: 0 }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 3 }}>
        <Card rank="A" suit="♠" glow={aceGlow} />
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 3 }}>
        <Card rank="5" suit="♥" glow={fiveGlow} />
        <Card rank="8" suit="♣" glow={eightGlow} />
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <Card rank="K" suit="♦" glow={kGlow} />
        <Card rank="9" suit="♦" glow={nineGlow} />
        <Card rank="4" suit="♣" glow={fourGlow} />
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}

// ─── Demo 5: ±1 chain building ── Golf ───────────────────────────────────────

/**
 * Waste=7. 6♥ and 8♠ glow (±1 from 7). 6♥ plays → waste=6 → 5♣ glows. Chain!
 */
export function GolfChainDemo() {
  const p = usePhase([1400, 700, 1200, 700, 1000, 700]);
  const wasteRank = p <= 1 ? "7" : p <= 3 ? "6" : "5";

  const sixGlow:   Glow = p === 0 ? "valid" : "faded";
  const eightGlow: Glow = p === 0 ? "valid" : "dim";
  const fiveGlow:  Glow = p <= 1 ? "dim" : p === 2 ? "valid" : "faded";
  const kingGlow:  Glow = "dim";

  const statuses = [
    "6 and 8 are both ±1 from 7",
    "6♥ plays to waste →",
    "waste is 6 — 5♣ now valid",
    "5♣ plays too — chain!",
    "waste is 5 — chain continues…",
    "",
  ];

  const tableau: Array<{ label: string; glow: Glow }> = [
    { label: "6♥", glow: sixGlow },
    { label: "8♠", glow: eightGlow },
    { label: "5♣", glow: fiveGlow },
    { label: "K♥", glow: kingGlow },
  ];

  return (
    <Box style={{ gap: 10, flexWrap: "nowrap" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card rank={wasteRank} suit="♣" />
        <L text="waste" />
      </div>
      <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        {tableau.map(({ label, glow }) => {
          const rank = label.slice(0, -1);
          const suit = label.slice(-1);
          return (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Card rank={rank} suit={suit} glow={glow} />
              <L text={label} highlight={glow === "valid"} />
            </div>
          );
        })}
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}

// ─── Demo 6: Free vs blocked tiles ── Mahjong ─────────────────────────────────

/**
 * Three "中" tiles in a row. Ends are free (open side). Middle is blocked.
 * Removing the left tile frees the middle; the freed pair matches and disappears.
 */
export function MahjongFreeDemo() {
  const p = usePhase([1500, 700, 900, 1000, 700, 700]);

  const leftGlow:   Glow = p <= 1 ? "valid" : "faded";
  const middleGlow: Glow = p <= 1 ? "dim" : p <= 3 ? "valid" : "faded";
  const rightGlow:  Glow = p <= 1 ? "valid" : p === 2 ? "none" : p === 3 ? "valid" : "faded";

  const statuses = [
    "open on one side = free to play",
    "removing the left tile…",
    "middle is now free!",
    "identical free pair → remove both",
    "matched!",
    "",
  ];

  return (
    <Box style={{ flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Tile label="中" glow={leftGlow} />
          <L text={p <= 1 ? "free ✓" : ""} highlight />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Tile label="中" glow={middleGlow} />
          <L text={p <= 1 ? "blocked ✗" : p === 2 ? "free now!" : ""} highlight={p === 2} danger={p <= 1} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Tile label="中" glow={rightGlow} />
          <L text={p <= 1 ? "free ✓" : ""} highlight />
        </div>
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}

// ─── Demo 7: Any-group move ── Yukon ─────────────────────────────────────────

/**
 * Disorganised face-up group (8♦, 5♣, 2♥ — not in sequence) lights up as one
 * selectable unit. 9♠ destination glows. The whole group moves because 8♦
 * (bottom card) fits on 9♠ — internal order doesn't matter in Yukon.
 */
export function YukonGroupMoveDemo() {
  const p = usePhase([1200, 1000, 1000, 1200, 700]);

  const groupGlow: Glow = p >= 1 && p <= 3 ? "valid" : "none";
  const destGlow:  Glow = p >= 2 && p <= 3 ? "valid" : "none";

  const statuses = [
    "any face-up group moves as one unit",
    "8♦ fits on 9♠ (red on black, rank −1)",
    "whole group follows!",
    "moved as one unit ✓",
    "",
  ];

  return (
    <Box>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "8", suit: "♦", glow: groupGlow },
          { rank: "5", suit: "♣", glow: groupGlow },
          { rank: "2", suit: "♥", glow: groupGlow },
        ]} />
        <L text={groupGlow === "valid" ? "group selected" : "any order/suit"} highlight={groupGlow === "valid"} />
      </div>
      <div style={{
        alignSelf: "center", fontSize: 18,
        color: p >= 2 ? "var(--neon)" : "var(--muted-foreground)",
        transition: "color 0.3s",
      }}>→</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card rank="9" suit="♠" glow={destGlow} />
        <L text="9♠" highlight={destGlow === "valid"} />
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}

// ─── Demo 8: King/Ace wrap ── TriPeaks ────────────────────────────────────────

/**
 * Waste=K: Q and A both glow (K wraps to A and descends to Q).
 * Waste=A: K and 2 both glow (A wraps to K and ascends to 2).
 */
export function TriPeaksWrapDemo() {
  const p = usePhase([1000, 900, 1200, 900, 1200, 600]);
  const wasteIsKing = p <= 2;
  const wasteRank   = wasteIsKing ? "K" : "A";
  const wasteSuit   = wasteIsKing ? "♠" : "♥";

  const qGlow:   Glow = (p === 1 || p === 2) ? "valid" : "none";
  const aceGlow: Glow = (p === 1 || p === 2) ? "valid" : "none";
  const kGlow:   Glow = (p === 4 || p === 5) ? "valid" : "none";
  const twoGlow: Glow = (p === 4 || p === 5) ? "valid" : "none";

  const statuses = [
    "waste = K — what plays?",
    "Q (normal) and A (wrap) both valid ✓",
    "",
    "waste = A — both directions wrap",
    "K (wrap) and 2 (normal) both valid ✓",
    "",
  ];

  return (
    <Box style={{ gap: 10, flexWrap: "nowrap" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card rank={wasteRank} suit={wasteSuit} />
        <L text="waste" />
      </div>
      <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        {[
          { rank: "Q", suit: "♣", glow: qGlow,   label: "Q♣" },
          { rank: "A", suit: "♣", glow: aceGlow,  label: "A♣" },
          { rank: "K", suit: "♦", glow: kGlow,    label: "K♦" },
          { rank: "2", suit: "♦", glow: twoGlow,  label: "2♦" },
        ].map(({ rank, suit, glow, label }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Card rank={rank} suit={suit} glow={glow} />
            <L text={glow === "valid" ? `${label} ✓` : label} highlight={glow === "valid"} />
          </div>
        ))}
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}

// ─── Demo 9: Same-suit tableau ── Forty Thieves ───────────────────────────────

/**
 * 8♥ on 9♥ glows valid (same suit). 8♠ on 9♥ glows invalid (wrong suit).
 */
export function FortyThievesSameSuitDemo() {
  const p = usePhase([900, 700, 1200, 700, 1200]);
  const valid   = p === 1 || p === 2;
  const invalid = p === 3 || p === 4;

  return (
    <Box>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "9", suit: "♥", glow: valid ? "valid" : "none" },
          { rank: "8", suit: "♥", glow: valid ? "valid" : "none" },
        ]} />
        <L text={valid ? "✓ same suit" : "8♥ on 9♥"} highlight={valid} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "9", suit: "♥", glow: invalid ? "invalid" : "none" },
          { rank: "8", suit: "♠", glow: invalid ? "invalid" : "none" },
        ]} />
        <L text={invalid ? "✗ wrong suit" : "8♠ on 9♥"} danger={invalid} />
      </div>
    </Box>
  );
}

// ─── Demo 10: Same-suit group move ── Scorpion ────────────────────────────────

/**
 * Disorganised group (8♥ at bottom) selects. Destination 9♥ glows.
 * Bottom card must be same suit AND rank −1 from destination top.
 */
export function ScorpionGroupDemo() {
  const p = usePhase([1200, 1000, 1000, 1200, 700]);

  const groupGlow: Glow = p >= 1 && p <= 3 ? "valid" : "none";
  const destGlow:  Glow = p >= 2 && p <= 3 ? "valid" : "none";

  const statuses = [
    "any face-up group moves as one unit",
    "8♥ fits on 9♥ (same suit, rank −1)",
    "whole group follows!",
    "moved — same suit + rank rule ✓",
    "",
  ];

  return (
    <Box>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "8", suit: "♥", glow: groupGlow },
          { rank: "J", suit: "♣", glow: groupGlow },
          { rank: "4", suit: "♦", glow: groupGlow },
        ]} />
        <L text={groupGlow === "valid" ? "group selected" : "8♥ at bottom"} highlight={groupGlow === "valid"} />
      </div>
      <div style={{
        alignSelf: "center", fontSize: 18,
        color: p >= 2 ? "var(--neon)" : "var(--muted-foreground)",
        transition: "color 0.3s",
      }}>→</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card rank="9" suit="♥" glow={destGlow} />
        <L text="9♥" highlight={destGlow === "valid"} />
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}

// ─── Demo 11: Same-suit descending ── Eight Off ───────────────────────────────

/**
 * 6♠ on 7♠ glows valid (same suit). 6♥ on 7♠ glows invalid (wrong suit).
 */
export function EightOffSameSuitDemo() {
  const p = usePhase([900, 700, 1200, 700, 1200]);
  const valid   = p === 1 || p === 2;
  const invalid = p === 3 || p === 4;

  return (
    <Box>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "7", suit: "♠", glow: valid ? "valid" : "none" },
          { rank: "6", suit: "♠", glow: valid ? "valid" : "none" },
        ]} />
        <L text={valid ? "✓ same suit" : "6♠ on 7♠"} highlight={valid} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "7", suit: "♠", glow: invalid ? "invalid" : "none" },
          { rank: "6", suit: "♥", glow: invalid ? "invalid" : "none" },
        ]} />
        <L text={invalid ? "✗ wrong suit" : "6♥ on 7♠"} danger={invalid} />
      </div>
    </Box>
  );
}

// ─── Demo 12: Wrapping foundation ── Canfield ─────────────────────────────────

/**
 * Base rank = 9. Foundation built up to K♥ — next card is A♥ (wrap).
 * Then 2♥ follows normally. Shows K→A→2 wrap sequence.
 */
export function CanfieldWrapDemo() {
  const p = usePhase([1200, 900, 1000, 900, 1000, 600]);

  // Foundation pile: starts showing K♥, then A♥ added, then 2♥ added
  const foundationTop =
    p <= 1 ? { rank: "K", suit: "♥" } :
    p <= 3 ? { rank: "A", suit: "♥" } :
             { rank: "2", suit: "♥" };

  const aceGlow: Glow = p === 1 ? "valid" : "none";
  const twoGlow: Glow = p === 3 ? "valid" : "none";

  const statuses = [
    "foundation built up to K♥ (base was 9♥)",
    "A♥ is next — wraps past King ✓",
    "A♥ placed — wrap complete",
    "2♥ is next — continues normally ✓",
    "2♥ placed — wrapping done",
    "",
  ];

  return (
    <Box style={{ gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: 32, height: 46, borderRadius: 4, background: "oklch(0.97 0.002 250)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
          boxShadow: "0 2px 5px rgba(0,0,0,0.45)",
        }}>
          <span style={{ fontSize: 12, fontWeight: 800, lineHeight: 1, color: "var(--red-suit)" }}>
            {foundationTop.rank}
          </span>
          <span style={{ fontSize: 10, lineHeight: 1, color: "var(--red-suit)" }}>
            {foundationTop.suit}
          </span>
        </div>
        <L text="foundation" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Card rank="A" suit="♥" glow={aceGlow} />
          <L text={aceGlow === "valid" ? "wraps! ✓" : "A♥"} highlight={aceGlow === "valid"} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Card rank="2" suit="♥" glow={twoGlow} />
          <L text={twoGlow === "valid" ? "then 2♥ ✓" : "2♥"} highlight={twoGlow === "valid"} />
        </div>
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}

// ─── Demo 13: Any-suit rank−1 ── Baker's Dozen ───────────────────────────────

/**
 * Any 7 goes on any 8 — suit is irrelevant. All three 7s glow valid on 8♣.
 */
export function BakersDozAnySuitDemo() {
  const p = usePhase([1000, 1400, 800, 600]);
  const showing = p === 1 || p === 2;

  const h7Glow: Glow = showing ? "valid" : "none";
  const s7Glow: Glow = showing ? "valid" : "none";
  const d7Glow: Glow = showing ? "valid" : "none";

  const statuses = [
    "8♣ on top — what can go on it?",
    "any 7 — suit doesn't matter ✓",
    "",
    "",
  ];

  return (
    <Box style={{ gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Card rank="8" suit="♣" glow={showing ? "valid" : "none"} />
        <L text="destination" highlight={showing} />
      </div>
      <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        {[
          { rank: "7", suit: "♥", glow: h7Glow, label: "7♥" },
          { rank: "7", suit: "♠", glow: s7Glow, label: "7♠" },
          { rank: "7", suit: "♦", glow: d7Glow, label: "7♦" },
        ].map(({ rank, suit, glow, label }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Card rank={rank} suit={suit} glow={glow} />
            <L text={glow === "valid" ? `${label} ✓` : label} highlight={glow === "valid"} />
          </div>
        ))}
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}

// ─── Demo 14: Same-suit only (not alt-color) ── Baker's Game ─────────────────

/**
 * 6♥ on 7♥ glows valid. 6♠ on 7♥ glows invalid — unlike FreeCell, suit must match.
 */
export function BakersGameSameSuitDemo() {
  const p = usePhase([900, 700, 1200, 700, 1200]);
  const valid   = p === 1 || p === 2;
  const invalid = p === 3 || p === 4;

  return (
    <Box>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "7", suit: "♥", glow: valid ? "valid" : "none" },
          { rank: "6", suit: "♥", glow: valid ? "valid" : "none" },
        ]} />
        <L text={valid ? "✓ same suit" : "6♥ on 7♥"} highlight={valid} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Fan cards={[
          { rank: "7", suit: "♥", glow: invalid ? "invalid" : "none" },
          { rank: "6", suit: "♠", glow: invalid ? "invalid" : "none" },
        ]} />
        <L text={invalid ? "✗ suit must match" : "6♠ on 7♥"} danger={invalid} />
      </div>
    </Box>
  );
}

// ─── Demo 15: Cascade mechanic ── Clock ──────────────────────────────────────

/**
 * Center (K) pile flips → reveals 7♣ → goes to 7-pile → that pile flips → 3♦ → goes to 3-pile.
 * Illustrates the self-driving cascade with no player choices.
 */
export function ClockCascadeDemo() {
  const p = usePhase([1200, 800, 1000, 800, 1000, 800]);

  // Three clock positions: center (K), 7, 3
  const centerGlow: Glow  = p === 0 ? "valid" : "none";
  const sevenGlow:  Glow  = p === 2 ? "valid" : p >= 3 ? "none" : "none";
  const threeGlow:  Glow  = p === 4 ? "valid" : "none";

  // Revealed card hovering between piles
  const showSeven  = p === 1 || p === 2;
  const showThree  = p === 3 || p === 4;

  const statuses = [
    "flip the center (K) pile →",
    "7♣ revealed — goes to position 7",
    "7♣ placed; flip 7-pile →",
    "3♦ revealed — goes to position 3",
    "3♦ placed; cascade continues…",
    "",
  ];

  function ClockPos({ label, rank, highlight, hasCard }: {
    label: string; rank: string; highlight: boolean; hasCard: boolean;
  }) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      }}>
        <div style={{
          width: 36, height: 46, borderRadius: 4,
          background: "oklch(0.20 0.07 255)",
          border: `1.5px solid ${highlight ? "var(--neon)" : "rgba(255,255,255,0.12)"}`,
          boxShadow: highlight ? "0 0 0 2px var(--neon), 0 0 10px color-mix(in oklab, var(--neon) 50%, transparent)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.3s",
        }}>
          <span style={{ fontSize: 11, color: hasCard ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)", fontWeight: 600 }}>
            {hasCard ? "▪▪" : "··"}
          </span>
        </div>
        <span style={{ fontSize: 9, color: highlight ? "var(--neon)" : "var(--muted-foreground)", fontWeight: 600, transition: "color 0.3s" }}>
          {rank === "K" ? "K (center)" : `pos ${rank}`}
        </span>
      </div>
    );
  }

  return (
    <Box style={{ flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
        <ClockPos label="K" rank="K" highlight={centerGlow === "valid"} hasCard={!showSeven} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {showSeven && (
            <div style={{ marginBottom: 4 }}>
              <Card rank="7" suit="♣" glow="valid" />
            </div>
          )}
          <ClockPos label="7" rank="7" highlight={sevenGlow === "valid" || p === 2} hasCard={p >= 3 && !showThree} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {showThree && (
            <div style={{ marginBottom: 4 }}>
              <Card rank="3" suit="♦" glow="valid" />
            </div>
          )}
          <ClockPos label="3" rank="3" highlight={threeGlow === "valid" || p === 4} hasCard={p >= 5} />
        </div>
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}

// ─── Demo 16: Slide into a gap ── Addiction ───────────────────────────────────

/**
 * Left neighbor is 5♥ → gap. 6♥ glows valid (same suit, rank +1).
 * 6♠ glows invalid (wrong suit). Gap fills with 6♥.
 */
export function AddictionGapDemo() {
  const p = usePhase([1100, 900, 1200, 900, 1200, 600]);

  const sixHGlow: Glow = p === 1 || p === 2 ? "valid" : p <= 0 ? "none" : "faded";
  const sixSGlow: Glow = p === 3 || p === 4 ? "invalid" : "dim";
  const gapFilled = p === 2;

  const statuses = [
    "gap to the right of 5♥ — what fits?",
    "6♥ — same suit, rank 5+1 ✓",
    "6♥ slides in!",
    "6♠ — wrong suit ✗",
    "suit must match the left neighbor",
    "",
  ];

  return (
    <Box style={{ flexDirection: "column", alignItems: "center" }}>
      {/* Row showing: [5♥] [gap or 6♥] */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Card rank="5" suit="♥" />
        {gapFilled ? (
          <Card rank="6" suit="♥" glow="valid" />
        ) : (
          <div style={{
            width: 32, height: 46, borderRadius: 4,
            background: "oklch(0.16 0.025 265)",
            border: "2px dashed var(--neon)",
            boxShadow: "0 0 8px color-mix(in oklab, var(--neon) 30%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 9, color: "var(--neon)", fontWeight: 700 }}>gap</span>
          </div>
        )}
        <Card rank="8" suit="♠" glow="dim" />
      </div>
      {/* Candidates */}
      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Card rank="6" suit="♥" glow={sixHGlow} />
          <L text={sixHGlow === "valid" ? "fits ✓" : "6♥"} highlight={sixHGlow === "valid"} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Card rank="6" suit="♠" glow={sixSGlow} />
          <L text={sixSGlow === "invalid" ? "✗ wrong suit" : "6♠"} danger={sixSGlow === "invalid"} />
        </div>
      </div>
      <Status text={statuses[p]} />
    </Box>
  );
}
