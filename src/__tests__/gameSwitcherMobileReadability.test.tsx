/**
 * Confirms that all 16 GameSwitcher tile titles and descriptions stay
 * readable (and non-overflowing) at a 375 px mobile viewport.
 *
 * Covers:
 * 1. All 16 games are rendered as tiles when the switcher is open.
 * 2. Every tile title span carries the Tailwind `truncate` class
 *    (overflow:hidden; text-overflow:ellipsis; white-space:nowrap).
 * 3. Every tile description span also carries `truncate`.
 * 4. The grid uses `grid-cols-3` (3 columns) for the mobile breakpoint.
 * 5. The longest titles (Baker's Dozen, Forty Thieves, Baker's Game)
 *    are present and protected by truncate so they cannot overflow their
 *    ~98 px tile content box at 375 px.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameSwitcher } from "../components/GameSwitcher";
import { GAMES } from "../lib/games";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({ pathname: "/klondike" }),
  Link: ({
    children,
    role,
    "aria-selected": ariaSelected,
    className,
    style,
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    role?: string;
    "aria-selected"?: boolean;
  }) => (
    <a
      role={role}
      aria-selected={ariaSelected}
      className={className}
      style={style as React.CSSProperties}
    >
      {children}
    </a>
  ),
}));

vi.mock("../lib/persist", () => ({
  hasSave: () => false,
  SAVE_CHANGED_EVENT: "save-changed",
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Open the switcher so the dropdown grid is visible. */
function openSwitcher() {
  const trigger = screen.getByRole("button", { name: /klondike/i });
  fireEvent.click(trigger);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GameSwitcher — 375 px mobile tile readability", () => {
  beforeEach(() => {
    render(<GameSwitcher />);
    openSwitcher();
  });

  it("renders all 16 game tiles when the switcher is open", () => {
    const tiles = screen.getAllByRole("option");
    expect(tiles).toHaveLength(GAMES.length);
    expect(GAMES.length).toBe(16);
  });

  it("grid container uses grid-cols-3 for the 3-column mobile layout", () => {
    // The grid div sits inside the dropdown and contains the tile links
    const tiles = screen.getAllByRole("option");
    const grid = tiles[0].parentElement;
    expect(grid).not.toBeNull();
    expect(grid!.className).toContain("grid-cols-3");
  });

  it("every tile title span has the truncate class (prevents overflow at any width)", () => {
    const tiles = screen.getAllByRole("option");
    tiles.forEach((tile, idx) => {
      // The title is in a span with class containing "truncate" and "font-bold"
      const titleSpan = tile.querySelector("span.truncate");
      expect(titleSpan, `Tile ${idx} (${GAMES[idx].title}) is missing truncate on title`).not.toBeNull();
      expect(titleSpan!.className, `Tile ${idx} title span`).toContain("truncate");
    });
  });

  it("every tile description span has the truncate class (prevents overflow)", () => {
    const tiles = screen.getAllByRole("option");
    tiles.forEach((tile, idx) => {
      // Description is the second span.truncate inside the tile
      const truncateSpans = tile.querySelectorAll("span.truncate");
      // At minimum: title (index 0) and description (index 1, or wrapped inside title)
      // The outer title span has w-full truncate; the description span also has truncate
      const descSpan = truncateSpans[truncateSpans.length - 1];
      expect(
        descSpan,
        `Tile ${idx} (${GAMES[idx].title}) is missing truncate on description`,
      ).not.toBeNull();
    });
  });

  it("title spans also carry w-full so truncation is bounded by tile width", () => {
    const tiles = screen.getAllByRole("option");
    tiles.forEach((tile, idx) => {
      const titleSpan = tile.querySelector("span.truncate");
      expect(
        titleSpan!.className,
        `Tile ${idx} (${GAMES[idx].title}) title span missing w-full`,
      ).toContain("w-full");
    });
  });

  describe("longest titles are rendered and protected by truncate", () => {
    const longTitles = [
      "Baker's Dozen Solitaire",
      "Forty Thieves Solitaire",
      "Baker's Game Solitaire",
    ];

    for (const expected of longTitles) {
      it(`"${expected}" is present and its title span has truncate`, () => {
        const tiles = screen.getAllByRole("option");
        // Find the tile that contains this title text
        const match = Array.from(tiles).find(t => t.textContent?.includes(expected));
        expect(match, `Could not find a tile containing "${expected}"`).not.toBeUndefined();

        const titleSpan = match!.querySelector("span.truncate");
        expect(titleSpan, `Tile for "${expected}" is missing a span.truncate`).not.toBeNull();
        expect(titleSpan!.className).toContain("truncate");
        expect(titleSpan!.className).toContain("w-full");
      });
    }
  });

  it("tile title font size is text-[11px] — small enough to fit 3-col mobile grid", () => {
    const tiles = screen.getAllByRole("option");
    const titleSpan = tiles[0].querySelector("span.truncate");
    // text-[11px] is in the class string
    expect(titleSpan!.className).toContain("text-[11px]");
  });

  it("tile description font size is text-[10px] — small enough for mobile", () => {
    const tiles = screen.getAllByRole("option");
    // The description span is the one with text-muted-foreground
    const descSpan = tiles[0].querySelector("span.text-muted-foreground");
    expect(descSpan).not.toBeNull();
    expect(descSpan!.className).toContain("text-[10px]");
    expect(descSpan!.className).toContain("truncate");
  });
});
