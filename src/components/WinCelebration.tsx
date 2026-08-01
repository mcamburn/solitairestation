/**
 * WinCelebration — card cascade animation shown on any game win.
 *
 * Cards launch upward from random positions along the bottom of the viewport,
 * tumble with rotation, then fall back under gravity and bounce off the floor.
 * The whole thing fades out after ~6 seconds and unmounts itself.
 *
 * Pointer-events: none so the game UI stays interactive underneath.
 */

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardParticle {
  id: number;
  /** current position (px from viewport top-left) */
  x: number;
  y: number;
  /** velocity px/frame */
  vx: number;
  vy: number;
  /** rotation degrees */
  rot: number;
  rotSpeed: number;
  suit: "♠" | "♥" | "♦" | "♣";
  isRed: boolean;
  /** 0 = face-down, 1 = face-up (for flip effect) */
  faceUp: boolean;
  /** scale 0.7–1.1 */
  scale: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUITS = ["♠", "♥", "♦", "♣"] as const;
const CARD_W = 38;
const CARD_H = 54;
const GRAVITY = 0.55;
const BOUNCE = 0.52;         // energy kept after floor bounce
const FRICTION = 0.995;      // horizontal drag per frame
const NUM_CARDS = 22;
const DURATION_MS = 6800;
const FADE_START_MS = 5400;  // when overlay begins fading out

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function spawnCard(id: number, vw: number, vh: number): CardParticle {
  const suit = SUITS[Math.floor(Math.random() * 4)];
  const isRed = suit === "♥" || suit === "♦";

  return {
    id,
    // Spread launch points across the bottom two-thirds of the viewport width
    x: rand(vw * 0.05, vw * 0.95 - CARD_W),
    // Start just below the visible bottom so cards "launch" upward
    y: vh + rand(0, vh * 0.15),
    vx: rand(-4.5, 4.5),
    // Strong upward launch, randomised so cards reach different heights
    vy: rand(-vh * 0.027, -vh * 0.018),
    rot: rand(-180, 180),
    rotSpeed: rand(-8, 8),
    suit,
    isRed,
    faceUp: Math.random() > 0.35,
    scale: rand(0.75, 1.15),
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  /** Called after the animation has fully faded out */
  onDone?: () => void;
}

export function WinCelebration({ onDone }: Props) {
  const [cards, setCards] = useState<CardParticle[]>([]);
  const [opacity, setOpacity] = useState(1);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const particlesRef = useRef<CardParticle[]>([]);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Stagger card spawning: groups of 3–4 per 120ms tick
    const initial: CardParticle[] = [];
    const later: { delay: number; card: CardParticle }[] = [];

    for (let i = 0; i < NUM_CARDS; i++) {
      const card = spawnCard(i, vw, vh);
      if (i < 6) {
        initial.push(card);
      } else {
        later.push({ delay: Math.floor(i / 3) * 130, card });
      }
    }

    particlesRef.current = initial;
    setCards([...initial]);

    // Staggered spawns
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (const { delay, card } of later) {
      timeouts.push(
        setTimeout(() => {
          particlesRef.current = [...particlesRef.current, card];
          setCards([...particlesRef.current]);
        }, delay),
      );
    }

    // Physics loop
    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;

      const floor = vh - CARD_H;

      particlesRef.current = particlesRef.current.map((c) => {
        let { x, y, vx, vy, rot, rotSpeed } = c;

        vy += GRAVITY;
        vx *= FRICTION;
        x += vx;
        y += vy;
        rot += rotSpeed;

        // Floor bounce
        if (y >= floor) {
          y = floor;
          vy = -(Math.abs(vy) * BOUNCE);
          rotSpeed *= 0.8;
          // Stop micro-bouncing
          if (Math.abs(vy) < 1.2) vy = 0;
        }

        // Side walls
        if (x < 0) { x = 0; vx = Math.abs(vx) * 0.7; }
        if (x > vw - CARD_W) { x = vw - CARD_W; vx = -Math.abs(vx) * 0.7; }

        return { ...c, x, y, vx, vy, rot, rotSpeed };
      });

      setCards([...particlesRef.current]);

      // Fade out phase
      if (elapsed >= FADE_START_MS) {
        const progress = Math.min((elapsed - FADE_START_MS) / (DURATION_MS - FADE_START_MS), 1);
        setOpacity(1 - progress);
      }

      if (elapsed < DURATION_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setOpacity(0);
        onDone?.();
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      timeouts.forEach(clearTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (opacity === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        opacity,
        transition: opacity < 1 ? "opacity 0.3s linear" : undefined,
      }}
    >
      {cards.map((c) => (
        <div
          key={c.id}
          style={{
            position: "absolute",
            left: c.x,
            top: c.y,
            width: CARD_W,
            height: CARD_H,
            transform: `rotate(${c.rot}deg) scale(${c.scale})`,
            transformOrigin: "center center",
            willChange: "transform",
            borderRadius: 5,
            background: c.faceUp ? "white" : "var(--neon)",
            border: c.faceUp ? "1.5px solid #e2e2e2" : "none",
            boxShadow: c.faceUp
              ? "0 2px 8px rgba(0,0,0,0.35)"
              : "0 2px 12px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: "bold",
            color: c.faceUp ? (c.isRed ? "#e03" : "#111") : "rgba(255,255,255,0.35)",
            userSelect: "none",
            // Subtle card-back pattern when face-down
            backgroundImage: c.faceUp
              ? undefined
              : "repeating-linear-gradient(45deg,rgba(255,255,255,0.07) 0,rgba(255,255,255,0.07) 2px,transparent 2px,transparent 8px)",
          }}
        >
          {c.faceUp ? c.suit : ""}
        </div>
      ))}
    </div>
  );
}
