/**
 * Tests for CardAppearanceProvider localStorage persistence.
 *
 * Covers:
 * 1. Provider reads skin/face from localStorage on mount (simulates page reload).
 * 2. setSkin / setFace write the correct keys to localStorage.
 * 3. Changing skin in one mounted provider is visible to another provider that
 *    mounts afterward — simulating navigating between game pages while sharing
 *    the same root-level provider (or re-mounting after navigation).
 * 4. All five game-page skin/face keys round-trip correctly via the provider.
 */

import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { CardAppearanceProvider, useCardAppearance, SKINS, FACES } from "../components/CardPickers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A minimal consumer that displays current skin/face and exposes setters. */
function Consumer() {
  const { skin, face, setSkin, setFace } = useCardAppearance();
  return (
    <div>
      <span data-testid="skin">{skin}</span>
      <span data-testid="face">{face}</span>
      {SKINS.map((s) => (
        <button key={s.id} data-testid={`set-skin-${s.id}`} onClick={() => setSkin(s.id)}>
          {s.label}
        </button>
      ))}
      {FACES.map((f) => (
        <button key={f.id} data-testid={`set-face-${f.id}`} onClick={() => setFace(f.id)}>
          {f.label}
        </button>
      ))}
    </div>
  );
}

function renderWithProvider() {
  return render(
    <CardAppearanceProvider>
      <Consumer />
    </CardAppearanceProvider>,
  );
}

// ---------------------------------------------------------------------------
// Setup: clear localStorage before each test so tests don't bleed into each other
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CardAppearanceProvider — default values", () => {
  it("defaults to skin=neon and face=modern when localStorage is empty", () => {
    renderWithProvider();
    expect(screen.getByTestId("skin").textContent).toBe("neon");
    expect(screen.getByTestId("face").textContent).toBe("modern");
  });
});

describe("CardAppearanceProvider — writes to localStorage", () => {
  it("persists skin to localStorage when setSkin is called", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("set-skin-aurora"));

    expect(localStorage.getItem("solitaire-skin")).toBe("aurora");
  });

  it("persists face to localStorage when setFace is called", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("set-face-classic"));

    expect(localStorage.getItem("solitaire-face")).toBe("classic");
  });

  it("updates displayed skin immediately", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("set-skin-circuit"));

    expect(screen.getByTestId("skin").textContent).toBe("circuit");
  });

  it("updates displayed face immediately", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByTestId("set-face-bold"));

    expect(screen.getByTestId("face").textContent).toBe("bold");
  });
});

describe("CardAppearanceProvider — reads from localStorage on mount (simulates reload)", () => {
  it("restores a previously saved skin after a remount", async () => {
    // Simulate a prior session that saved a skin.
    localStorage.setItem("solitaire-skin", "ember");

    renderWithProvider();

    // The useEffect on mount should apply the stored value.
    expect(await screen.findByTestId("skin")).toHaveTextContent("ember");
  });

  it("restores a previously saved face after a remount", async () => {
    localStorage.setItem("solitaire-face", "pixel");

    renderWithProvider();

    expect(await screen.findByTestId("face")).toHaveTextContent("pixel");
  });

  it("restores both skin and face together after a remount", async () => {
    localStorage.setItem("solitaire-skin", "marble");
    localStorage.setItem("solitaire-face", "retro");

    renderWithProvider();

    expect(await screen.findByTestId("skin")).toHaveTextContent("marble");
    expect(await screen.findByTestId("face")).toHaveTextContent("retro");
  });

  it("ignores unknown skin values from localStorage and keeps the default", async () => {
    localStorage.setItem("solitaire-skin", "unknown-skin-xyz");

    renderWithProvider();

    // Should fall back to the default
    expect(screen.getByTestId("skin").textContent).toBe("neon");
  });

  it("ignores unknown face values from localStorage and keeps the default", async () => {
    localStorage.setItem("solitaire-face", "unknown-face-xyz");

    renderWithProvider();

    expect(screen.getByTestId("face").textContent).toBe("modern");
  });
});

describe("CardAppearanceProvider — all valid skin IDs survive a reload", () => {
  for (const { id } of SKINS) {
    it(`skin "${id}" is restored after a remount`, async () => {
      localStorage.setItem("solitaire-skin", id);
      renderWithProvider();
      expect(await screen.findByTestId("skin")).toHaveTextContent(id);
    });
  }
});

describe("CardAppearanceProvider — all valid face IDs survive a reload", () => {
  for (const { id } of FACES) {
    it(`face "${id}" is restored after a remount`, async () => {
      localStorage.setItem("solitaire-face", id);
      renderWithProvider();
      expect(await screen.findByTestId("face")).toHaveTextContent(id);
    });
  }
});

describe("CardAppearanceProvider — cross-game skin sharing via localStorage", () => {
  it("skin set in one session is visible to a new session (simulates navigating between games)", async () => {
    // Session A (e.g. Spider page): set skin to "holo"
    const user = userEvent.setup();
    const { unmount } = renderWithProvider();
    await user.click(screen.getByTestId("set-skin-holo"));
    expect(localStorage.getItem("solitaire-skin")).toBe("holo");
    unmount();

    // Session B (e.g. FreeCell page): new provider reads the stored value
    renderWithProvider();
    expect(await screen.findByTestId("skin")).toHaveTextContent("holo");
  });

  it("face set in one session is visible to a new session", async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProvider();
    await user.click(screen.getByTestId("set-face-script"));
    expect(localStorage.getItem("solitaire-face")).toBe("script");
    unmount();

    renderWithProvider();
    expect(await screen.findByTestId("face")).toHaveTextContent("script");
  });

  it("setting skin and face on Spider then reloading FreeCell keeps both", async () => {
    // Represents: user on Spider, picks skin=wave and face=outline
    const user = userEvent.setup();
    const { unmount } = renderWithProvider();
    await user.click(screen.getByTestId("set-skin-wave"));
    await user.click(screen.getByTestId("set-face-outline"));
    unmount();

    // User navigates to FreeCell (new mount of the same provider)
    renderWithProvider();
    expect(await screen.findByTestId("skin")).toHaveTextContent("wave");
    expect(await screen.findByTestId("face")).toHaveTextContent("outline");
  });
});
