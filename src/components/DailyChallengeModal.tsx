/**
 * DailyChallengeModal
 *
 * Shown when the player clicks the Daily Challenge button.
 * Previews what the challenge is, shows current streak, and
 * lets the player confirm (Start / Play Again) or cancel.
 *
 * Portaled to document.body so it escapes the nav bar's
 * backdrop-filter stacking context.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getTodayKey } from "@/lib/daily";

interface Props {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  gameEmoji: string;
  gameTitle: string;
  completedToday: boolean;
  dailyStreak: number;
  longestDailyStreak: number;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export function DailyChallengeModal({
  open,
  onClose,
  onStart,
  gameEmoji,
  gameTitle,
  completedToday,
  dailyStreak,
  longestDailyStreak,
}: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (open) setDateLabel(formatDate(getTodayKey()));
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted || typeof document === "undefined" || !document.body) return null;
  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleStart = () => {
    onStart();
    onClose();
  };

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "oklch(0.14 0.04 155)",
          border: "1px solid color-mix(in oklab, var(--neon) 28%, transparent)",
          boxShadow: "0 32px 80px -8px rgba(0,0,0,0.9), 0 0 0 1px color-mix(in oklab, var(--neon) 10%, transparent)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid color-mix(in oklab, var(--neon) 12%, transparent)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span
                className="text-base font-bold tracking-tight"
                style={{ color: "var(--neon)" }}
              >
                Daily Challenge
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 transition-opacity hover:opacity-70"
              style={{ color: "color-mix(in oklab, var(--neon) 50%, white)" }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <p
            className="text-xs"
            style={{ color: "color-mix(in oklab, var(--neon) 45%, white)" }}
          >
            {dateLabel}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Game identity */}
          <div className="flex items-center gap-3">
            <span
              className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl shrink-0"
              style={{
                background: "color-mix(in oklab, var(--neon) 10%, transparent)",
                border: "1px solid color-mix(in oklab, var(--neon) 20%, transparent)",
              }}
            >
              {gameEmoji}
            </span>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--neon)" }}>
                {gameTitle}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "color-mix(in oklab, var(--neon) 50%, white)" }}
              >
                {completedToday
                  ? "You've already completed today's deal"
                  : "Every player gets the same shuffled deal today"}
              </p>
            </div>
          </div>

          {/* Completion badge or description */}
          {completedToday ? (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3"
              style={{
                background: "color-mix(in oklab, var(--neon) 8%, transparent)",
                border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
              }}
            >
              <span className="text-lg">✅</span>
              <span
                className="text-sm font-medium"
                style={{ color: "color-mix(in oklab, var(--neon) 75%, white)" }}
              >
                Completed today!
              </span>
            </div>
          ) : (
            <p
              className="text-xs leading-relaxed"
              style={{ color: "color-mix(in oklab, var(--neon) 50%, white)" }}
            >
              Complete the challenge once to add to your daily streak. The deal resets every midnight UTC.
            </p>
          )}

          {/* Streak stats */}
          <div
            className="flex gap-3 rounded-xl p-3"
            style={{
              background: "color-mix(in oklab, var(--neon) 6%, transparent)",
              border: "1px solid color-mix(in oklab, var(--neon) 12%, transparent)",
            }}
          >
            <StatChip emoji="🔥" label="Current streak" value={`${dailyStreak}d`} highlight={dailyStreak > 0} />
            <div className="w-px self-stretch" style={{ background: "color-mix(in oklab, var(--neon) 15%, transparent)" }} />
            <StatChip emoji="🏆" label="Best streak" value={`${longestDailyStreak}d`} />
          </div>
        </div>

        {/* Footer actions */}
        <div
          className="px-6 pb-6 flex gap-3"
          style={{ borderTop: "1px solid color-mix(in oklab, var(--neon) 10%, transparent)", paddingTop: "1rem" }}
        >
          <button
            onClick={onClose}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
            style={{
              background: "color-mix(in oklab, var(--neon) 8%, transparent)",
              color: "color-mix(in oklab, var(--neon) 60%, white)",
              border: "1px solid color-mix(in oklab, var(--neon) 18%, transparent)",
            }}
          >
            {completedToday ? "Close" : "Maybe later"}
          </button>
          <button
            onClick={handleStart}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--neon), var(--neon-2))",
              color: "oklch(0.14 0.04 155)",
            }}
          >
            {completedToday ? "Play again" : "Start challenge"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function StatChip({
  emoji,
  label,
  value,
  highlight = false,
}: {
  emoji: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-0.5">
      <span className="text-base leading-none">{emoji}</span>
      <span
        className="text-base font-bold tabular-nums"
        style={{ color: highlight ? "var(--neon)" : "color-mix(in oklab, var(--neon) 65%, white)" }}
      >
        {value}
      </span>
      <span
        className="text-[10px] text-center leading-tight"
        style={{ color: "color-mix(in oklab, var(--neon) 40%, white)" }}
      >
        {label}
      </span>
    </div>
  );
}
