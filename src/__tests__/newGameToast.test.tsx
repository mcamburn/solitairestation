/**
 * Tests for NewGameToast animation resilience under rapid re-triggering.
 *
 * Covers:
 * 1. Calling show() twice in quick succession keeps the toast visible and
 *    resets the auto-hide timer (doesn't get stuck invisible).
 * 2. The toast element is removed from the DOM exactly after the 300 ms
 *    fade-out period once visible becomes false.
 * 3. Calling show() again while the fade-out is in progress cancels the
 *    unmount timer so the toast stays in the DOM.
 */

import { render, screen, act } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NewGameToast, useNewGameToast } from "../components/CardPickers";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Renders the hook and the component together, exposing a "New Game" button
 * and a readout of the raw `visible` boolean.
 */
function ToastHarness() {
  const { visible, show } = useNewGameToast();
  return (
    <>
      <button data-testid="show-btn" onClick={show}>
        New Game
      </button>
      <span data-testid="visible">{String(visible)}</span>
      <NewGameToast visible={visible} skin="neon" face="modern" />
    </>
  );
}

/**
 * Wraps NewGameToast with a controllable `visible` prop so we can test the
 * component's internal mounting/unmounting logic in isolation.
 */
function ControlledToast({ initialVisible = false }: { initialVisible?: boolean }) {
  const [visible, setVisible] = useState(initialVisible);
  return (
    <>
      <button data-testid="show-btn" onClick={() => setVisible(true)}>
        Show
      </button>
      <button data-testid="hide-btn" onClick={() => setVisible(false)}>
        Hide
      </button>
      <NewGameToast visible={visible} skin="neon" face="modern" />
    </>
  );
}

// ---------------------------------------------------------------------------
// useNewGameToast — rapid double-show
// ---------------------------------------------------------------------------

describe("useNewGameToast — rapid double-show", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps visible=true when show() is called a second time within 300 ms", async () => {
    render(<ToastHarness />);
    const btn = screen.getByTestId("show-btn");

    // First show
    await act(async () => {
      btn.click();
    });
    expect(screen.getByTestId("visible").textContent).toBe("true");

    // Second show at ~100 ms (well within the 300 ms fade-out window)
    await act(async () => {
      vi.advanceTimersByTime(100);
      btn.click();
    });

    expect(screen.getByTestId("visible").textContent).toBe("true");
  });

  it("resets the auto-hide timer so the toast stays visible for a fresh 2500 ms after the second show()", async () => {
    render(<ToastHarness />);
    const btn = screen.getByTestId("show-btn");

    // First show at t=0
    await act(async () => {
      btn.click();
    });

    // Second show at t=100 ms — timer should restart from here
    await act(async () => {
      vi.advanceTimersByTime(100);
      btn.click();
    });

    // At t=100+2499=2599 ms the toast should still be visible
    await act(async () => {
      vi.advanceTimersByTime(2499);
    });
    expect(screen.getByTestId("visible").textContent).toBe("true");

    // At t=100+2500=2600 ms the timer fires and visible becomes false
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("visible").textContent).toBe("false");
  });

  it("toast element stays in the DOM while visible is still true after rapid double-show", async () => {
    render(<ToastHarness />);
    const btn = screen.getByTestId("show-btn");

    await act(async () => {
      btn.click();
    });
    // Allow requestAnimationFrame (shown state) to flush
    await act(async () => {
      vi.runAllTimers();
    });

    // Element should be present
    expect(screen.getByText(/Neon/)).toBeInTheDocument();

    // Rapid second click
    await act(async () => {
      btn.click();
    });

    // Element must still be present
    expect(screen.getByText(/Neon/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// NewGameToast — DOM removal after fade-out
// ---------------------------------------------------------------------------

describe("NewGameToast — DOM removal after fade-out", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("mounts and renders the toast element when visible=true", async () => {
    render(<ControlledToast />);

    await act(async () => {
      screen.getByTestId("show-btn").click();
    });
    // Allow requestAnimationFrame to flush
    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText(/Neon/)).toBeInTheDocument();
  });

  it("keeps the element in the DOM for the full 300 ms fade-out after visible becomes false", async () => {
    render(<ControlledToast initialVisible />);

    // Allow initial mount + RAF
    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText(/Neon/)).toBeInTheDocument();

    // Trigger hide
    await act(async () => {
      screen.getByTestId("hide-btn").click();
    });

    // 1 ms before the fade-out completes — still mounted
    await act(async () => {
      vi.advanceTimersByTime(299);
    });
    expect(screen.getByText(/Neon/)).toBeInTheDocument();
  });

  it("removes the element from the DOM after the 300 ms fade-out completes", async () => {
    render(<ControlledToast initialVisible />);

    // Allow initial mount + RAF
    await act(async () => {
      vi.runAllTimers();
    });

    // Trigger hide
    await act(async () => {
      screen.getByTestId("hide-btn").click();
    });

    // Advance exactly 300 ms — unmount timer fires
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText(/Neon/)).not.toBeInTheDocument();
  });

  it("cancels the fade-out unmount timer when visible becomes true again within 300 ms", async () => {
    render(<ControlledToast initialVisible />);

    // Allow initial mount
    await act(async () => {
      vi.runAllTimers();
    });

    // Hide the toast
    await act(async () => {
      screen.getByTestId("hide-btn").click();
    });

    // 100 ms into the 300 ms fade-out — show it again
    await act(async () => {
      vi.advanceTimersByTime(100);
      screen.getByTestId("show-btn").click();
    });

    // Advance past the original 300 ms window — element must still be mounted
    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByText(/Neon/)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// NewGameToast — visibilitychange resilience
// ---------------------------------------------------------------------------

describe("NewGameToast — visibilitychange resilience", () => {
  /** Helper: set document.visibilityState and dispatch the event. */
  function setTabVisibility(state: "visible" | "hidden") {
    Object.defineProperty(document, "visibilityState", {
      value: state,
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }

  beforeEach(() => {
    vi.useFakeTimers();
    // Start with the tab visible.
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    // Reset to visible so other test suites are unaffected.
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
  });

  it("removes the toast from the DOM when the tab is restored after the 300 ms fade-out timer was throttled", async () => {
    render(<ControlledToast initialVisible />);

    // Allow initial mount + RAF.
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.getByText(/Neon/)).toBeInTheDocument();

    // Hide the toast — starts the 300 ms unmount timer.
    await act(async () => {
      screen.getByTestId("hide-btn").click();
    });

    // Simulate the tab being hidden before the 300 ms timer fires (throttled).
    act(() => setTabVisibility("hidden"));

    // Restore the tab — the visibilitychange handler should flush the unmount.
    await act(async () => {
      setTabVisibility("visible");
    });

    expect(screen.queryByText(/Neon/)).not.toBeInTheDocument();
  });

  it("does not remove the toast when the tab is hidden and restored while the toast is still actively shown", async () => {
    render(<ControlledToast initialVisible />);

    // Allow initial mount + RAF.
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.getByText(/Neon/)).toBeInTheDocument();

    // Tab hidden then immediately restored — toast is NOT fading out.
    act(() => setTabVisibility("hidden"));
    await act(async () => {
      setTabVisibility("visible");
    });

    // Toast must still be present.
    expect(screen.getByText(/Neon/)).toBeInTheDocument();
  });

  it("removes the toast via the normal timer when the tab stays visible the whole time", async () => {
    render(<ControlledToast initialVisible />);

    await act(async () => {
      vi.runAllTimers();
    });

    // Trigger fade-out.
    await act(async () => {
      screen.getByTestId("hide-btn").click();
    });

    // Advance exactly 300 ms — timer fires without any visibilitychange.
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText(/Neon/)).not.toBeInTheDocument();
  });

  it("does not remove the toast when the tab is restored before hide() is called", async () => {
    render(<ControlledToast initialVisible />);

    await act(async () => {
      vi.runAllTimers();
    });

    // Tab toggled but the toast has not been hidden yet.
    act(() => setTabVisibility("hidden"));
    await act(async () => {
      setTabVisibility("visible");
    });

    // Toast should still be mounted and the hide button should work normally.
    expect(screen.getByText(/Neon/)).toBeInTheDocument();

    // Trigger hide (flush effects so the 300 ms timer is registered).
    await act(async () => {
      screen.getByTestId("hide-btn").click();
    });
    // Now advance time — the timer was registered in the previous act.
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText(/Neon/)).not.toBeInTheDocument();
  });

  it("show() after a throttled fade-out restores and keeps the toast visible", async () => {
    render(<ControlledToast initialVisible />);

    await act(async () => {
      vi.runAllTimers();
    });

    // Start fade-out.
    await act(async () => {
      screen.getByTestId("hide-btn").click();
    });

    // Tab hidden — 300 ms timer throttled.
    act(() => setTabVisibility("hidden"));

    // User clicks Show again while tab is still hidden.
    await act(async () => {
      screen.getByTestId("show-btn").click();
    });

    // Tab restored.
    await act(async () => {
      setTabVisibility("visible");
    });

    // Toast must still be present (show() cancelled the fade-out).
    expect(screen.getByText(/Neon/)).toBeInTheDocument();
  });
});
