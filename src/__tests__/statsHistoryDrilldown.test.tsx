/**
 * Tests for the per-game history drilldown in the Stats page.
 *
 * Covers:
 * 1. Games with history show an expand toggle button.
 * 2. Games with no history do not show the toggle.
 * 3. Clicking the toggle reveals a mini-table with labeled columns
 *    (Result, Time, Moves, Date) — ensuring values are never shown under
 *    the wrong outer column heading.
 * 4. Win records display the correct result label and elapsed time.
 * 5. Loss records display "Loss" and show "—" for time.
 * 6. Daily-challenge records show the DailyBadge.
 * 7. Clicking the toggle a second time collapses the history.
 * 8. Mobile cards: toggle shows/hides inline history with correct labels.
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

// Mock SiteFooter to avoid pulling in its own Link dependencies
vi.mock("@/components/SiteFooter", () => ({
  SiteFooter: () => <footer data-testid="site-footer" />,
}));

// ---------------------------------------------------------------------------
// Import AFTER mocks are registered
// ---------------------------------------------------------------------------

import { Route } from "../routes/stats";

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

const STATS_PREFIX = "neon-solitaire:stats:";

const WIN_RECORD = {
  date: 1700000000000,
  won: true,
  moves: 45,
  durationSeconds: 125, // 2:05
  isDaily: false,
};

const DAILY_LOSS_RECORD = {
  date: 1699900000000,
  won: false,
  moves: 30,
  durationSeconds: 0,
  isDaily: true,
};

function seedStats(saveKey: string, history: typeof WIN_RECORD[]) {
  const stats = {
    gamesPlayed: history.length,
    wins: history.filter((r) => r.won).length,
    losses: history.filter((r) => !r.won).length,
    currentStreak: 0,
    longestStreak: 1,
    bestTime: 125,
    bestMoves: null,
    avgTime: 125,
    avgMoves: null,
    lastPlayedAt: Date.now(),
    history,
  };
  localStorage.setItem(STATS_PREFIX + saveKey, JSON.stringify(stats));
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const StatsPage = Route.component as () => JSX.Element;

/** Return the desktop mini-table for a game after expanding it. */
async function expandDesktopHistory(user: ReturnType<typeof userEvent.setup>, saveKey: string) {
  const expandBtn = await screen.findByRole("button", {
    name: new RegExp(`expand ${saveKey} history`, "i"),
  });
  await user.click(expandBtn);
  return screen.getByTestId(`history-table-${saveKey}`);
}

// ---------------------------------------------------------------------------
// Desktop table drilldown
// ---------------------------------------------------------------------------

describe("Stats page — per-game history drilldown (desktop)", () => {
  it("shows an expand button for a game that has history", async () => {
    seedStats("klondike", [WIN_RECORD]);
    render(<StatsPage />);

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /expand klondike history/i }),
      ).not.toBeNull(),
    );

    expect(
      screen.getByRole("button", { name: /expand klondike history/i }),
    ).toBeInTheDocument();
  });

  it("does not show an expand button for a game with no history", async () => {
    seedStats("klondike", [WIN_RECORD]); // only klondike gets data
    render(<StatsPage />);

    // Wait for hydration
    await screen.findByRole("button", { name: /expand klondike history/i });

    expect(
      screen.queryByRole("button", { name: /expand freecell history/i }),
    ).toBeNull();
  });

  it("reveals a mini-table with labeled columns when expanded", async () => {
    seedStats("klondike", [WIN_RECORD]);
    const user = userEvent.setup();
    render(<StatsPage />);

    const miniTable = await expandDesktopHistory(user, "klondike");

    // All four column labels must be present inside the mini-table
    expect(within(miniTable).getByRole("columnheader", { name: /^result$/i })).toBeInTheDocument();
    expect(within(miniTable).getByRole("columnheader", { name: /^time$/i })).toBeInTheDocument();
    expect(within(miniTable).getByRole("columnheader", { name: /^moves$/i })).toBeInTheDocument();
    expect(within(miniTable).getByRole("columnheader", { name: /^date$/i })).toBeInTheDocument();
  });

  it("shows a win record with elapsed time and move count", async () => {
    seedStats("klondike", [WIN_RECORD]);
    const user = userEvent.setup();
    render(<StatsPage />);

    const miniTable = await expandDesktopHistory(user, "klondike");

    expect(within(miniTable).getByText("✓ Win")).toBeInTheDocument();
    expect(within(miniTable).getByText("2:05")).toBeInTheDocument(); // 125 s = 2:05
    expect(within(miniTable).getByText("45")).toBeInTheDocument();
  });

  it("shows a loss record with '—' for time", async () => {
    seedStats("klondike", [DAILY_LOSS_RECORD]);
    const user = userEvent.setup();
    render(<StatsPage />);

    const miniTable = await expandDesktopHistory(user, "klondike");

    expect(within(miniTable).getByText("✗ Loss")).toBeInTheDocument();
    // Time cell should be "—" for losses
    const timeCells = within(miniTable).getAllByText("—");
    expect(timeCells.length).toBeGreaterThan(0);
  });

  it("shows the DailyBadge for daily-challenge records", async () => {
    seedStats("klondike", [DAILY_LOSS_RECORD]);
    const user = userEvent.setup();
    render(<StatsPage />);

    const miniTable = await expandDesktopHistory(user, "klondike");

    // DailyBadge renders "📅 Daily"
    expect(within(miniTable).getByText(/Daily/i)).toBeInTheDocument();
  });

  it("collapses history when the toggle is clicked a second time", async () => {
    seedStats("klondike", [WIN_RECORD]);
    const user = userEvent.setup();
    render(<StatsPage />);

    await expandDesktopHistory(user, "klondike");

    // Mini-table is visible
    expect(screen.getByTestId("history-table-klondike")).toBeInTheDocument();

    // Both desktop and mobile render a "Collapse …" button (same shared state).
    // Click the first one — it collapses both views.
    const collapseBtns = screen.getAllByRole("button", {
      name: /collapse klondike history/i,
    });
    await user.click(collapseBtns[0]);

    expect(screen.queryByTestId("history-table-klondike")).toBeNull();
  });

  it("keeps each game's history expanded independently", async () => {
    seedStats("klondike", [WIN_RECORD]);
    seedStats("freecell", [DAILY_LOSS_RECORD]);
    const user = userEvent.setup();
    render(<StatsPage />);

    // Expand Klondike
    await expandDesktopHistory(user, "klondike");
    expect(within(screen.getByTestId("history-table-klondike")).getByText("✓ Win")).toBeInTheDocument();

    // Expand FreeCell — Klondike should still be expanded
    await expandDesktopHistory(user, "freecell");
    expect(within(screen.getByTestId("history-table-freecell")).getByText("✗ Loss")).toBeInTheDocument();
    expect(screen.getByTestId("history-table-klondike")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Mobile card drilldown
// ---------------------------------------------------------------------------

describe("Stats page — per-game history drilldown (mobile card)", () => {
  it("shows a 'Show history' button on mobile cards with history", async () => {
    seedStats("klondike", [WIN_RECORD]);
    render(<StatsPage />);

    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /show klondike history/i }),
      ).not.toBeNull(),
    );

    expect(
      screen.getByRole("button", { name: /show klondike history/i }),
    ).toBeInTheDocument();
  });

  it("reveals inline history on mobile when toggled", async () => {
    seedStats("klondike", [WIN_RECORD]);
    const user = userEvent.setup();
    render(<StatsPage />);

    const btn = await screen.findByRole("button", {
      name: /show klondike history/i,
    });
    await user.click(btn);

    // At least one "✓ Win" label appears (desktop + mobile)
    expect(screen.getAllByText("✓ Win").length).toBeGreaterThan(0);
  });

  it("shows DailyBadge in the mobile inline history for daily records", async () => {
    seedStats("klondike", [DAILY_LOSS_RECORD]);
    const user = userEvent.setup();
    render(<StatsPage />);

    const btn = await screen.findByRole("button", {
      name: /show klondike history/i,
    });
    await user.click(btn);

    const dailyBadges = screen.getAllByText(/Daily/i);
    expect(dailyBadges.length).toBeGreaterThan(0);
  });

  it("collapses inline history when the toggle is clicked again", async () => {
    seedStats("klondike", [WIN_RECORD]);
    const user = userEvent.setup();
    render(<StatsPage />);

    // Open via mobile button (also expands the desktop view — shared state)
    const showBtn = await screen.findByRole("button", {
      name: /show klondike history/i,
    });
    await user.click(showBtn);

    // The desktop mini-table should now be present
    expect(screen.getByTestId("history-table-klondike")).toBeInTheDocument();

    // Both desktop and mobile render a "Collapse …" button. Click the first.
    const collapseBtns = screen.getAllByRole("button", {
      name: /collapse klondike history/i,
    });
    await user.click(collapseBtns[0]);

    // Both views should be collapsed — mini-table gone
    expect(screen.queryByTestId("history-table-klondike")).toBeNull();
  });
});
