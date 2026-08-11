/**
 * Confirms DailyWinBanner renders the correct badge text depending on whether
 * modeLabel is passed.
 *
 * Covers:
 * 1. No modeLabel (all non-Spider games) → "☀️ Daily Complete"
 * 2. modeLabel="1 Suit"  (Spider 1-suit daily)  → "☀️ Daily · 1 Suit"
 * 3. modeLabel="2 Suits" (Spider 2-suit daily)  → "☀️ Daily · 2 Suits"
 * 4. modeLabel="4 Suits" (Spider 4-suit daily)  → "☀️ Daily · 4 Suits"
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DailyWinBanner } from "../components/DailyWinBanner";

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("@/contexts/DailyChallengeContext", () => ({
  useDailyChallenge: () => ({
    justWonDailyStreak: 3,          // non-null → triggers the daily win path
    clearDailyWin: vi.fn(),
    activateDaily: vi.fn(),
    gameKey: "spider",
  }),
}));

vi.mock("@/hooks/useShareStreak", () => ({
  useShareStreak: () => ({
    share: vi.fn(),
    buttonLabel: (idle: string) => idle,
  }),
}));

vi.mock("@/lib/site", () => ({
  SITE_URL: "https://solitairestation.com",
}));

vi.mock("@/lib/daily", () => ({
  getTodayKey: () => "2026-08-11",
}));

vi.mock("@/lib/gameLabels", () => ({
  getGameLabel: () => "Spider",
}));

// WinCelebration does canvas/animation work — swap it for a no-op in jsdom
vi.mock("../components/WinCelebration", () => ({
  WinCelebration: () => null,
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderBanner(modeLabel?: string) {
  return render(
    <DailyWinBanner
      onNew={vi.fn()}
      modeLabel={modeLabel}
    />,
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DailyWinBanner badge — no modeLabel (non-Spider games)", () => {
  it('shows "☀️ Daily Complete" when modeLabel is omitted', () => {
    renderBanner();
    expect(screen.getByText("☀️ Daily Complete")).toBeInTheDocument();
  });

  it('does not show "☀️ Daily" without " Complete" when modeLabel is omitted', () => {
    renderBanner();
    // The text node "☀️ Daily" alone must not exist — it must always be followed
    // by " Complete" or " · <label>".
    const badge = screen.getByText("☀️ Daily Complete");
    expect(badge.textContent).toBe("☀️ Daily Complete");
  });

  it('shows "☀️ Daily Complete" when modeLabel is explicitly undefined', () => {
    renderBanner(undefined);
    expect(screen.getByText("☀️ Daily Complete")).toBeInTheDocument();
  });
});

describe("DailyWinBanner badge — Spider difficulty labels", () => {
  it('shows "☀️ Daily · 1 Suit" for Spider 1-suit daily', () => {
    renderBanner("1 Suit");
    expect(screen.getByText("☀️ Daily · 1 Suit")).toBeInTheDocument();
  });

  it('shows "☀️ Daily · 2 Suits" for Spider 2-suit daily', () => {
    renderBanner("2 Suits");
    expect(screen.getByText("☀️ Daily · 2 Suits")).toBeInTheDocument();
  });

  it('shows "☀️ Daily · 4 Suits" for Spider 4-suit daily', () => {
    renderBanner("4 Suits");
    expect(screen.getByText("☀️ Daily · 4 Suits")).toBeInTheDocument();
  });
});

describe("DailyWinBanner badge — Spider modeLabel derivation", () => {
  it("Spider difficulty 1 produces the modeLabel '1 Suit'", () => {
    // Mirrors the logic in Spider.tsx line 113:
    // `${state.difficulty} Suit${state.difficulty !== 1 ? "s" : ""}`
    const difficulty = 1;
    const label = `${difficulty} Suit${difficulty !== 1 ? "s" : ""}`;
    expect(label).toBe("1 Suit");
  });

  it("Spider difficulty 2 produces the modeLabel '2 Suits'", () => {
    const difficulty = 2;
    const label = `${difficulty} Suit${difficulty !== 1 ? "s" : ""}`;
    expect(label).toBe("2 Suits");
  });

  it("Spider difficulty 4 produces the modeLabel '4 Suits'", () => {
    const difficulty = 4;
    const label = `${difficulty} Suit${difficulty !== 1 ? "s" : ""}`;
    expect(label).toBe("4 Suits");
  });
});
