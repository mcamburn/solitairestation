/**
 * Component-level tests for the interaction between the Daily-only filter
 * and history sort state on the Stats page.
 *
 * Covers:
 * 1. After toggling Daily-only on, only daily entries appear in the history table
 * 2. The current sort order (key + direction) is preserved after the filter toggle
 * 3. Changing the sort column while Daily-only is active applies to the filtered set
 * 4. historyLimit resets to 25 when Daily-only is toggled — "Show more" appears
 *    when 26+ daily entries were hidden behind a previously-raised limit
 * 5. "Show more" is NOT rendered when all filtered results fit within the reset limit
 * 6. Toggling Daily-only off restores the full (unfiltered) history
 */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock TanStack Router so StatsPage can render outside a full router context
// ---------------------------------------------------------------------------

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: { component: () => JSX.Element }) => ({
    ...config,
    useSearch: () => ({ from: undefined }),
  }),
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={String(to)} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/SiteFooter", () => ({
  SiteFooter: () => <footer data-testid="site-footer" />,
}));

// ---------------------------------------------------------------------------
// Import AFTER mocks
// ---------------------------------------------------------------------------

import { Route } from "../routes/stats";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATS_PREFIX = "neon-solitaire:stats:";
const StatsPage = Route.component as () => JSX.Element;

interface GameRecord {
  date: number;
  won: boolean;
  moves: number;
  durationSeconds: number;
  isDaily: boolean;
}

function seedStats(saveKey: string, history: GameRecord[]) {
  const stats = {
    gamesPlayed: history.length,
    wins: history.filter((r) => r.won).length,
    losses: history.filter((r) => !r.won).length,
    currentStreak: 0,
    longestStreak: history.filter((r) => r.won).length,
    bestTime: history.find((r) => r.won)?.durationSeconds ?? null,
    bestMoves: null,
    avgTime: null,
    avgMoves: null,
    lastPlayedAt: history[0]?.date ?? Date.now(),
    history,
  };
  localStorage.setItem(STATS_PREFIX + saveKey, JSON.stringify(stats));
}

function makeRecord(
  date: number,
  won: boolean,
  isDaily: boolean,
  durationSeconds = 120,
  moves = 40,
): GameRecord {
  return { date, won, isDaily, durationSeconds: won ? durationSeconds : 0, moves: won ? moves : 0 };
}

/** Wait for the history section to appear after hydration. */
async function waitForHistorySection() {
  return waitFor(() => {
    const el = screen.queryByTestId("recent-history-section");
    if (!el) throw new Error("history section not mounted yet");
    return el;
  });
}

/** Get game titles of visible history rows (desktop tbody, in DOM order). */
function getHistoryRowTitles(): string[] {
  const tbody = screen.queryByTestId("recent-history-tbody");
  if (!tbody) return [];
  const rows = within(tbody).getAllByRole("row");
  return rows.map((row) => {
    const link = within(row).getByRole("link");
    // link text is "{emoji}{title}" — strip leading non-alpha chars
    return link.textContent?.replace(/^[^\w]+/, "").trim() ?? "";
  });
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Daily-only filter — basic filtering in the rendered component", () => {
  it("shows all entries when Daily-only is off", async () => {
    seedStats("klondike", [makeRecord(3000, true,  true)]);   // daily
    seedStats("freecell", [makeRecord(2000, true,  false)]);  // non-daily
    seedStats("spider",   [makeRecord(1000, false, true)]);   // daily

    render(<StatsPage />);
    await waitForHistorySection();

    const titles = getHistoryRowTitles();
    expect(titles).toContain("Klondike");
    expect(titles).toContain("FreeCell");
    expect(titles).toContain("Spider");
  });

  it("hides non-daily entries when Daily-only is toggled on", async () => {
    seedStats("klondike", [makeRecord(3000, true,  true)]);   // daily
    seedStats("freecell", [makeRecord(2000, true,  false)]);  // non-daily
    seedStats("spider",   [makeRecord(1000, false, true)]);   // daily

    const user = userEvent.setup();
    render(<StatsPage />);
    await waitForHistorySection();

    await user.click(screen.getByRole("button", { name: /daily only/i }));

    const titles = getHistoryRowTitles();
    expect(titles).toContain("Klondike");
    expect(titles).toContain("Spider");
    expect(titles).not.toContain("FreeCell");
  });

  it("restores all entries when Daily-only is toggled back off", async () => {
    seedStats("klondike", [makeRecord(3000, true,  true)]);
    seedStats("freecell", [makeRecord(2000, true,  false)]);
    seedStats("spider",   [makeRecord(1000, false, true)]);

    const user = userEvent.setup();
    render(<StatsPage />);
    await waitForHistorySection();

    const dailyBtn = screen.getByRole("button", { name: /daily only/i });
    await user.click(dailyBtn); // on
    await user.click(dailyBtn); // off

    const titles = getHistoryRowTitles();
    expect(titles).toContain("Klondike");
    expect(titles).toContain("FreeCell");
    expect(titles).toContain("Spider");
  });
});

describe("Sort order is preserved when the Daily-only filter is toggled", () => {
  it("applies the current sort (game A→Z) to the daily-only filtered set", async () => {
    // Spider (daily), Klondike (daily), FreeCell (non-daily)
    seedStats("spider",   [makeRecord(3000, true, true)]);
    seedStats("klondike", [makeRecord(2000, true, true)]);
    seedStats("freecell", [makeRecord(1000, true, false)]);

    const user = userEvent.setup();
    render(<StatsPage />);

    const section = await waitForHistorySection();

    // Click the "Game" column header to sort A→Z
    const gameHeader = within(section).getByRole("columnheader", { name: /game/i });
    await user.click(gameHeader);

    // Verify the full set is sorted A→Z
    const fullTitles = getHistoryRowTitles();
    expect(fullTitles.indexOf("FreeCell")).toBeLessThan(fullTitles.indexOf("Klondike"));
    expect(fullTitles.indexOf("Klondike")).toBeLessThan(fullTitles.indexOf("Spider"));

    // Toggle Daily-only on
    await user.click(screen.getByRole("button", { name: /daily only/i }));

    // Filtered set (Klondike + Spider only) must still be sorted A→Z
    const filteredTitles = getHistoryRowTitles();
    expect(filteredTitles).toEqual(["Klondike", "Spider"]);
  });

  it("applies a sort change (game Z→A) made while Daily-only is active", async () => {
    seedStats("klondike", [makeRecord(2000, true, true)]);
    seedStats("spider",   [makeRecord(1000, true, true)]);
    seedStats("freecell", [makeRecord(3000, true, false)]);

    const user = userEvent.setup();
    render(<StatsPage />);
    const section = await waitForHistorySection();

    // Toggle Daily-only on first
    await user.click(screen.getByRole("button", { name: /daily only/i }));

    // Click "Game" once → A→Z (ascending)
    const gameHeader = within(section).getByRole("columnheader", { name: /game/i });
    await user.click(gameHeader);
    expect(getHistoryRowTitles()).toEqual(["Klondike", "Spider"]);

    // Click "Game" again → Z→A (descending)
    await user.click(gameHeader);
    expect(getHistoryRowTitles()).toEqual(["Spider", "Klondike"]);
  });

  it("sort direction change while Daily-only is active applies only to the filtered set", async () => {
    // 3 daily entries at different dates; 1 non-daily entry with the newest date
    seedStats("klondike", [makeRecord(5000, true, false)]);  // non-daily, newest
    seedStats("freecell", [makeRecord(3000, true, true)]);   // daily
    seedStats("spider",   [makeRecord(2000, true, true)]);   // daily
    seedStats("pyramid",  [makeRecord(1000, true, true)]);   // daily

    const user = userEvent.setup();
    render(<StatsPage />);
    const section = await waitForHistorySection();

    // Toggle Daily-only on
    await user.click(screen.getByRole("button", { name: /daily only/i }));

    // Default sort is date desc (newest first)
    const titlesDesc = getHistoryRowTitles();
    expect(titlesDesc[0]).toBe("FreeCell"); // date 3000 — newest daily

    // Click "Date" header to reverse to ascending (oldest first)
    const dateHeader = within(section).getByRole("columnheader", { name: /date/i });
    await user.click(dateHeader); // currently active desc → toggle to asc
    const titlesAsc = getHistoryRowTitles();
    expect(titlesAsc[0]).toBe("Pyramid"); // date 1000 — oldest daily
    // Non-daily Klondike (date 5000) must NOT appear in the daily-only view
    expect(titlesAsc).not.toContain("Klondike");
  });
});

describe("historyLimit resets to 25 when Daily-only filter is toggled", () => {
  it("Show more appears after toggling Daily-only when 26+ daily entries existed above the reset limit", async () => {
    // Seed 28 non-daily entries for klondike and 28 daily entries for freecell.
    // Total = 56 entries; 28 are daily.
    // After raising the limit twice via "Show more" (25 → 50 → 75) all 56 are
    // visible and "Show more" is gone. Then toggling Daily-only resets
    // historyLimit to 25 — since 28 daily entries > 25, "Show more" must
    // reappear. Without the setHistoryLimit(25) reset the limit would stay at
    // 75, 28 < 75, and "Show more" would NOT appear.
    const nonDailyRecords = Array.from({ length: 28 }, (_, i) =>
      makeRecord(1000 + i, true, false),
    );
    const dailyRecords = Array.from({ length: 28 }, (_, i) =>
      makeRecord(10000 + i, true, true),
    );
    seedStats("klondike", nonDailyRecords);
    seedStats("freecell", dailyRecords);

    const user = userEvent.setup();
    render(<StatsPage />);
    await waitForHistorySection();

    // Initial state: 56 entries, limit=25, "Show more" visible
    expect(screen.getByRole("button", { name: /show more/i })).toBeInTheDocument();

    // Raise the limit: 25 → 50
    await user.click(screen.getByRole("button", { name: /show more/i }));
    // Raise the limit: 50 → 75 — all 56 visible, "Show more" gone
    await user.click(screen.getByRole("button", { name: /show more/i }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /show more/i })).toBeNull(),
    );

    // Toggle Daily-only on — limit resets to 25; 28 daily entries > 25
    await user.click(screen.getByRole("button", { name: /daily only/i }));

    // "Show more" must be visible (catches a missing setHistoryLimit(25) call)
    expect(screen.getByRole("button", { name: /show more/i })).toBeInTheDocument();
    // Only 25 of the 28 daily entries are visible (not all 28)
    expect(getHistoryRowTitles()).toHaveLength(25);
  });

  it("Show more is NOT rendered when all daily entries fit within the reset limit", async () => {
    // 30 non-daily entries raise the limit; only 5 daily entries exist.
    // After toggling Daily-only (limit resets to 25): 5 ≤ 25 → no Show more.
    const nonDailyRecords = Array.from({ length: 30 }, (_, i) =>
      makeRecord(1000 + i, true, false),
    );
    const dailyRecords = Array.from({ length: 5 }, (_, i) =>
      makeRecord(10000 + i, true, true),
    );
    seedStats("klondike", nonDailyRecords);
    seedStats("freecell", dailyRecords);

    const user = userEvent.setup();
    render(<StatsPage />);
    await waitForHistorySection();

    // Raise the limit once: 25 → 50. All 35 entries (30 non-daily + 5 daily)
    // fit within 50, so "Show more" disappears after this single click.
    await user.click(screen.getByRole("button", { name: /show more/i }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /show more/i })).toBeNull(),
    );

    // Toggle Daily-only — limit resets to 25; 5 daily ≤ 25 → no Show more
    await user.click(screen.getByRole("button", { name: /daily only/i }));

    expect(screen.queryByRole("button", { name: /show more/i })).toBeNull();
    expect(getHistoryRowTitles()).toHaveLength(5);
  });
});
