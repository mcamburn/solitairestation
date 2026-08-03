import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { type CardBackSkin, type CardFaceStyle } from "./PlayingCard";

export const SKINS: { id: CardBackSkin; label: string }[] = [
  { id: "neon",    label: "Felt"       },
  { id: "aurora",  label: "Damask"     },
  { id: "circuit", label: "Velvet"     },
  { id: "wave",    label: "Gold"       },
  { id: "ember",   label: "Ember"      },
  { id: "prism",   label: "Royal"      },
  { id: "holo",    label: "Jade"       },
  { id: "grid",    label: "Crosshatch" },
  { id: "marble",  label: "Marble"     },
];

export const FACES: { id: CardFaceStyle; label: string }[] = [
  { id: "modern",  label: "Modern"    },
  { id: "classic", label: "Classic"   },
  { id: "minimal", label: "Ivory"     },
  { id: "bold",    label: "Onyx"      },
  { id: "pixel",   label: "Pixel"     },
  { id: "script",  label: "Antique"   },
  { id: "outline", label: "Outline"   },
  { id: "retro",   label: "Verdant"   },
  { id: "stencil", label: "Parchment" },
];

/* ---------- shared context ---------- */

interface CardAppearanceContextValue {
  skin: CardBackSkin;
  face: CardFaceStyle;
  setSkin: (s: CardBackSkin) => void;
  setFace: (f: CardFaceStyle) => void;
}

const CardAppearanceContext = createContext<CardAppearanceContextValue | null>(null);

/**
 * Place once near the top of the tree (e.g. in the root route component).
 * All game components share the same skin/face state through this provider,
 * so switching games mid-session never leaves the pickers out of sync.
 */
export function CardAppearanceProvider({ children }: { children: ReactNode }) {
  const [skin, setSkinState] = useState<CardBackSkin>("neon");
  const [face, setFaceState] = useState<CardFaceStyle>("modern");

  // Read persisted values once on mount.
  useEffect(() => {
    try {
      const s = localStorage.getItem("solitaire-skin") as CardBackSkin | null;
      if (s && SKINS.some((x) => x.id === s)) setSkinState(s);
      const f = localStorage.getItem("solitaire-face") as CardFaceStyle | null;
      if (f && FACES.some((x) => x.id === f)) setFaceState(f);
    } catch {}
  }, []);

  const setSkin = (s: CardBackSkin) => {
    setSkinState(s);
    try { localStorage.setItem("solitaire-skin", s); } catch {}
  };

  const setFace = (f: CardFaceStyle) => {
    setFaceState(f);
    try { localStorage.setItem("solitaire-face", f); } catch {}
  };

  return (
    <CardAppearanceContext.Provider value={{ skin, face, setSkin, setFace }}>
      {children}
    </CardAppearanceContext.Provider>
  );
}

/**
 * Hook that returns the shared skin + face state.
 * Requires <CardAppearanceProvider> to be mounted above in the tree.
 */
export function useCardAppearance(): CardAppearanceContextValue {
  const ctx = useContext(CardAppearanceContext);
  if (!ctx) throw new Error("useCardAppearance must be used inside <CardAppearanceProvider>");
  return ctx;
}

/* ---------- new-game toast ---------- */

/**
 * Lightweight hook that tracks visibility of a "new game started" toast.
 * Call `show()` inside reset(); render <NewGameToast> anywhere in the tree.
 */
export function useNewGameToast() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { visible, show };
}

/**
 * Fixed-position toast that briefly confirms which skin + face is active
 * after starting a new game.  Fades in over ~150 ms and fades out over
 * ~300 ms before being removed from the DOM.
 */
export function NewGameToast({
  visible,
  skin,
  face,
}: {
  visible: boolean;
  skin: CardBackSkin;
  face: CardFaceStyle;
}) {
  const skinLabel = SKINS.find((s) => s.id === skin)?.label ?? skin;
  const faceLabel = FACES.find((f) => f.id === face)?.label ?? face;

  // `mounted` keeps the element in the DOM during the fade-out transition.
  const [mounted, setMounted] = useState(false);
  // `shown` drives the CSS opacity/transform so transitions fire correctly.
  const [shown, setShown] = useState(false);
  const fadeOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks whether a fade-out is in progress so the visibilitychange handler
  // can flush the unmount when the browser throttled the 300 ms timer.
  const isFadingOutRef = useRef(false);

  useEffect(() => {
    if (visible) {
      // Cancel any in-flight fade-out.
      if (fadeOutTimer.current) {
        clearTimeout(fadeOutTimer.current);
        fadeOutTimer.current = null;
        isFadingOutRef.current = false;
      }
      // Mount first, then on the next animation frame switch to shown=true so
      // the browser registers the initial opacity:0 state before transitioning.
      setMounted(true);
      requestAnimationFrame(() => setShown(true));
    } else {
      // Start the fade-out; remove from DOM once the transition finishes.
      setShown(false);
      isFadingOutRef.current = true;
      fadeOutTimer.current = setTimeout(() => {
        setMounted(false);
        isFadingOutRef.current = false;
      }, 300);
    }

    return () => {
      if (fadeOutTimer.current) clearTimeout(fadeOutTimer.current);
    };
  }, [visible]);

  // Browsers throttle setTimeout when a tab is hidden, which can leave the
  // 300 ms fade-out timer stuck.  When the tab becomes visible again and a
  // fade-out is in progress, flush the unmount immediately so the toast is
  // never left frozen on-screen.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isFadingOutRef.current) {
        if (fadeOutTimer.current) {
          clearTimeout(fadeOutTimer.current);
          fadeOutTimer.current = null;
        }
        isFadingOutRef.current = false;
        setMounted(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 whitespace-nowrap rounded-2xl border border-border/60 bg-background/90 px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md"
      style={{
        boxShadow: "0 8px 32px -8px var(--neon)",
        // Combine the centering translate with a small vertical nudge for polish.
        transform: `translateX(-50%) translateY(${shown ? "0px" : "6px"})`,
        opacity: shown ? 1 : 0,
        transition: shown
          ? "opacity 150ms ease-out, transform 150ms ease-out"
          : "opacity 300ms ease-in, transform 300ms ease-in",
      }}
    >
      <span className="mr-1.5 font-bold" style={{ color: "var(--neon)" }}>
        ✓
      </span>
      {skinLabel} · {faceLabel}
    </div>
  );
}

export function SkinPicker({
  skin,
  onChange,
}: {
  skin: CardBackSkin;
  onChange: (s: CardBackSkin) => void;
}) {
  return (
    <div className="picker-wrap glass mt-3 rounded-2xl px-3 py-2.5">
      {/* Mobile: scrollable row of mini card-back pattern chips */}
      <div className="flex items-center gap-2 md:hidden">
        <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Card back
        </span>
        <div className="flex gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SKINS.map((s) => {
            const active = s.id === skin;
            return (
              <button
                key={s.id}
                onClick={() => onChange(s.id)}
                title={s.label}
                aria-label={s.label}
                aria-pressed={active}
                className={`card-back skin-${s.id} relative shrink-0 h-10 w-7 rounded-[5px] transition-all ${
                  active
                    ? "ring-2 ring-primary shadow-[0_0_8px_-2px_var(--neon)]"
                    : "opacity-60"
                }`}
              >
                <span
                  className="card-back-pattern"
                  style={{ position: "absolute", inset: 2, borderRadius: 3 }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: pill buttons */}
      <div className="hidden md:flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Card back
        </span>
        {SKINS.map((s) => {
          const active = s.id === skin;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className={`group flex items-center gap-2 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
                active
                  ? "border-transparent text-primary-foreground"
                  : "border-border bg-secondary/40 text-secondary-foreground hover:bg-secondary/70"
              }`}
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, var(--neon), var(--neon-2))",
                      boxShadow: "0 4px 16px -8px var(--neon)",
                    }
                  : undefined
              }
              aria-pressed={active}
            >
              <span
                className={`card-back skin-${s.id} h-5 w-4 rounded-[4px]`}
                aria-hidden
              >
                <span className="card-back-pattern" style={{ inset: 1, borderRadius: 3 }} />
              </span>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── AppearanceBar ────────────────────────────────────────────────────────────

export interface ModeOption { value: string; label: string; sub?: string; }
export interface ModeConfig {
  label: string;
  options: ModeOption[];
  current: string;
  onChange: (v: string) => void;
  /** When true the dropdown renders but mode cannot be changed (sub-pages). */
  locked?: boolean;
}

function faceFont(id: string): CSSProperties {
  return {
    fontFamily:
      id === "classic" ? "Georgia, serif"
      : id === "pixel" ? "var(--font-mono)"
      : "var(--font-display)",
  };
}

function FaceGlyph({ id, size }: { id: string; size: number }) {
  const isBold = id === "bold";
  const inner =
    id === "outline" ? (
      <span style={{ color: "transparent", WebkitTextStroke: `${Math.max(1, size * 0.07)}px #1a1a1a` }}>A</span>
    ) : id === "script" ? (
      <span style={{ display: "block", fontStyle: "italic", transform: "rotate(-6deg)" }}>A</span>
    ) : id === "retro" ? (
      <span style={{ color: "#c8a84b", textShadow: "1px 1px 0 #7a5c1e" }}>A</span>
    ) : id === "stencil" ? (
      <span style={{ fontWeight: 900 }}>A</span>
    ) : (
      "A"
    );
  return (
    <span
      className={`flex items-center justify-center rounded-[3px] font-bold shrink-0 ${
        isBold ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
      }`}
      style={{ width: Math.round(size * 0.72), height: size, fontSize: Math.round(size * 0.62), ...faceFont(id) }}
    >
      {inner}
    </span>
  );
}

function BackSwatch({ id, w, h }: { id: string; w: number; h: number }) {
  const inset = Math.max(1, Math.round(w * 0.1));
  return (
    <span
      className={`card-back skin-${id} shrink-0`}
      style={{ width: w, height: h, display: "inline-block", position: "relative", borderRadius: 4 }}
    >
      <span className="card-back-pattern" style={{ position: "absolute", inset, borderRadius: 3 }} />
    </span>
  );
}

const CHEVRON = (
  <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden>
    <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Shared portal panel styles — glass card floating above everything. */
const PANEL_BASE_STYLE: CSSProperties = {
  position: "fixed",
  zIndex: 9999,
};

/** Distinct accent colour per section. */
const ACCENT = {
  mode: "#d4a832", // gold    — game mode / rule set
  back: "#5a9e6f", // sage    — card back design
  face: "#c05848", // crimson — card face style
} as const;

/** Compute fixed panel position from a trigger element's bounding rect.
 *  On mobile (< 640 px) the panel spans the full width of the AppearanceBar
 *  (passed as barEl) so all three sections share a consistent panel width. */
function triggerToPos(el: HTMLElement, alignRight: boolean, barEl?: HTMLElement | null): CSSProperties {
  const r = el.getBoundingClientRect();
  if (window.innerWidth < 640 && barEl) {
    const bar = barEl.getBoundingClientRect();
    return { top: r.bottom + 6, left: bar.left, width: bar.width };
  }
  const pos: CSSProperties = { top: r.bottom + 6, width: r.width };
  if (alignRight) pos.right = window.innerWidth - r.right;
  else pos.left = r.left;
  return pos;
}

/**
 * A single compact glass row combining Mode/Suits, Card Back, and Card Face
 * selectors into custom dropdowns. Panels are portalled to <body> so they
 * always float above the game board regardless of stacking contexts.
 */
export function AppearanceBar({
  skin,
  face,
  onSkinChange,
  onFaceChange,
  mode,
}: {
  skin: CardBackSkin;
  face: CardFaceStyle;
  onSkinChange: (s: CardBackSkin) => void;
  onFaceChange: (f: CardFaceStyle) => void;
  mode?: ModeConfig;
}) {
  const [open, setOpen] = useState<"mode" | "back" | "face" | null>(null);
  const [panelPos, setPanelPos] = useState<CSSProperties>({});
  const barRef  = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const faceRef = useRef<HTMLButtonElement>(null);

  const getRef = (p: "mode" | "back" | "face") =>
    p === "mode" ? modeRef : p === "back" ? backRef : faceRef;

  // Open a panel, computing position from the trigger's bounding rect.
  const openPanel = (p: "mode" | "back" | "face") => {
    if (open === p) { setOpen(null); return; }
    const el = getRef(p).current;
    if (el) setPanelPos(triggerToPos(el, p === "face", barRef.current));
    setOpen(p);
  };

  // Close when clicking outside the bar or the open portal panel.
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const t = e.target as Node;
      if (barRef.current?.contains(t)) return;
      if (document.getElementById("appearance-panel")?.contains(t)) return;
      setOpen(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Reposition on scroll / resize while open.
  useEffect(() => {
    if (!open) return;
    const recompute = () => {
      const el = getRef(open).current;
      if (el) setPanelPos(triggerToPos(el, open === "face", barRef.current));
    };
    window.addEventListener("scroll", recompute, true);
    window.addEventListener("resize", recompute);
    return () => { window.removeEventListener("scroll", recompute, true); window.removeEventListener("resize", recompute); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const skinObj = SKINS.find((s) => s.id === skin)!;
  const faceObj = FACES.find((f) => f.id === face)!;
  const modeOpt = mode?.options.find((o) => o.value === mode.current);

  const triggerBase =
    "w-full h-full flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3.5 text-left transition-colors hover:bg-secondary/40 rounded-none focus-visible:outline-none focus-visible:bg-secondary/40";
  const nameCls  = "text-sm font-semibold text-foreground truncate";
  const chevronCls = "ml-auto shrink-0 text-muted-foreground transition-transform duration-150";

  // Shared label style — bold small-caps, accent colour per section.
  const labelStyle = (color: string): CSSProperties => ({
    color,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    flexShrink: 0,
    userSelect: "none",
  });

  // ── Panel contents (rendered via portal) ────────────────────────────────
  const modePanel = mode && open === "mode" && createPortal(
    <div
      id="appearance-panel"
      className="glass rounded-xl border border-border shadow-xl overflow-hidden"
      style={{ ...PANEL_BASE_STYLE, ...panelPos }}
      role="listbox"
    >
      {mode.options.map((opt) => {
        const active = opt.value === mode.current;
        return (
          <button
            key={opt.value}
            role="option"
            aria-selected={active}
            onClick={() => { mode.onChange(opt.value); setOpen(null); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-left transition hover:bg-secondary/50 ${active ? "bg-secondary/60" : ""}`}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={active
                ? { background: ACCENT.mode, boxShadow: `0 0 6px ${ACCENT.mode}` }
                : { background: "var(--muted)" }}
            />
            <div className="min-w-0">
              <div className={`text-sm font-semibold ${active ? "text-foreground" : "text-secondary-foreground"}`}>{opt.label}</div>
              {opt.sub && <div className="text-xs text-muted-foreground truncate">{opt.sub}</div>}
            </div>
            {active && <span className="ml-auto text-xs font-bold shrink-0" style={{ color: ACCENT.mode }}>✓</span>}
          </button>
        );
      })}
    </div>,
    document.body,
  );

  // Desktop-only portal panels for Back and Face (hidden on mobile via JS guard).
  // On mobile (< 640 px) the chip rows render inline below the bar instead.
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 640;

  const backPanel = open === "back" && isDesktop && createPortal(
    <div
      id="appearance-panel"
      className="glass rounded-xl border border-border shadow-xl p-2"
      style={{ ...PANEL_BASE_STYLE, ...panelPos }}
      role="listbox"
    >
      <div className="grid grid-cols-3 gap-1.5">
        {SKINS.map((s) => {
          const active = s.id === skin;
          return (
            <button
              key={s.id}
              role="option"
              aria-selected={active}
              onClick={() => { onSkinChange(s.id); setOpen(null); }}
              className={`flex flex-col items-center gap-1.5 rounded-lg p-2 transition hover:bg-secondary/50 ${active ? "bg-secondary/60" : ""}`}
              style={active ? { outline: `1.5px solid ${ACCENT.back}`, outlineOffset: -1 } : undefined}
            >
              <BackSwatch id={s.id} w={44} h={62} />
              <span className={`text-[11px] font-medium leading-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );

  const facePanel = open === "face" && isDesktop && createPortal(
    <div
      id="appearance-panel"
      className="glass rounded-xl border border-border shadow-xl p-2"
      style={{ ...PANEL_BASE_STYLE, ...panelPos }}
      role="listbox"
    >
      <div className="grid grid-cols-3 gap-1.5">
        {FACES.map((f) => {
          const active = f.id === face;
          return (
            <button
              key={f.id}
              role="option"
              aria-selected={active}
              onClick={() => { onFaceChange(f.id); setOpen(null); }}
              className={`flex flex-col items-center gap-1.5 rounded-lg p-2 transition hover:bg-secondary/50 ${active ? "bg-secondary/60" : ""}`}
              style={active ? { outline: `1.5px solid ${ACCENT.face}`, outlineOffset: -1 } : undefined}
            >
              <FaceGlyph id={f.id} size={44} />
              <span className={`text-[11px] font-medium leading-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {f.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );

  return (
    <>
      {modePanel}
      {backPanel}
      {facePanel}
      <div
        ref={barRef}
        className="game-controls glass mt-3 rounded-2xl flex items-stretch divide-x divide-border"
      >
        {/* ── Mode / Suits ── */}
        {mode && (
          <div className="relative flex-1 min-w-0">
            <button
              ref={modeRef}
              onClick={() => !mode.locked && openPanel("mode")}
              className={`${triggerBase} ${mode.locked ? "cursor-default pointer-events-none" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={open === "mode"}
            >
              <span style={labelStyle(ACCENT.mode)}>{mode.label}</span>
              <span className={nameCls}>{modeOpt?.label ?? "—"}</span>
              {!mode.locked && (
                <span className={chevronCls} style={{ transform: open === "mode" ? "rotate(180deg)" : "", color: ACCENT.mode }}>
                  {CHEVRON}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── Card Back ── */}
        <div className="relative flex-1 min-w-0">
          <button
            ref={backRef}
            onClick={() => openPanel("back")}
            className={triggerBase}
            aria-haspopup="listbox"
            aria-expanded={open === "back"}
          >
            <span style={labelStyle(ACCENT.back)}>BACK</span>
            <BackSwatch id={skin} w={22} h={30} />
            <span className={nameCls}>{skinObj.label}</span>
            <span className={chevronCls} style={{ transform: open === "back" ? "rotate(180deg)" : "", color: ACCENT.back }}>{CHEVRON}</span>
          </button>
        </div>

        {/* ── Card Face ── */}
        <div className="relative flex-1 min-w-0">
          <button
            ref={faceRef}
            onClick={() => openPanel("face")}
            className={triggerBase}
            aria-haspopup="listbox"
            aria-expanded={open === "face"}
          >
            <span style={labelStyle(ACCENT.face)}>FACE</span>
            <FaceGlyph id={face} size={26} />
            <span className={nameCls}>{faceObj.label}</span>
            <span className={chevronCls} style={{ transform: open === "face" ? "rotate(180deg)" : "", color: ACCENT.face }}>{CHEVRON}</span>
          </button>
        </div>
      </div>

      {/* ── Mobile inline chip rows (visible only on < 640 px screens) ── */}
      {/* Card Back chips — horizontal scroll row showing each skin's gradient/texture */}
      {open === "back" && !isDesktop && (
        <div
          id="appearance-panel"
          className="block sm:hidden glass mt-1.5 rounded-2xl px-3 py-2.5"
          role="listbox"
          aria-label="Card back"
        >
          <div className="flex gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SKINS.map((s) => {
              const active = s.id === skin;
              return (
                <button
                  key={s.id}
                  role="option"
                  aria-selected={active}
                  aria-label={s.label}
                  title={s.label}
                  onClick={() => { onSkinChange(s.id); setOpen(null); }}
                  className={`card-back skin-${s.id} relative shrink-0 h-12 w-9 rounded-[5px] transition-all ${
                    active
                      ? "ring-2 ring-primary shadow-[0_0_10px_-2px_var(--neon)]"
                      : "opacity-60 hover:opacity-80"
                  }`}
                >
                  <span
                    className="card-back-pattern"
                    style={{ position: "absolute", inset: 2, borderRadius: 3 }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Card Face chips — horizontal scroll row showing each face style's "A" glyph */}
      {open === "face" && !isDesktop && (
        <div
          id="appearance-panel"
          className="block sm:hidden glass mt-1.5 rounded-2xl px-3 py-2.5"
          role="listbox"
          aria-label="Card face"
        >
          <div className="flex gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FACES.map((f) => {
              const active = f.id === face;
              const isDark = f.id === "bold" || f.id === "retro";
              const previewFont =
                f.id === "classic" ? "Georgia, serif"
                : f.id === "pixel" ? "var(--font-mono)"
                : "var(--font-display)";
              return (
                <button
                  key={f.id}
                  role="option"
                  aria-selected={active}
                  aria-label={f.label}
                  title={f.label}
                  onClick={() => { onFaceChange(f.id); setOpen(null); }}
                  className={`relative shrink-0 h-12 w-9 rounded-[5px] flex items-center justify-center font-bold text-[15px] transition-all ${
                    isDark ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                  } ${
                    active
                      ? "ring-2 ring-primary shadow-[0_0_10px_-2px_var(--neon)]"
                      : "opacity-60 hover:opacity-80"
                  }`}
                  style={{ fontFamily: previewFont }}
                >
                  {f.id === "outline" ? (
                    <span style={{ color: "transparent", WebkitTextStroke: "1.5px #1a1a1a" }}>A</span>
                  ) : f.id === "script" ? (
                    <span style={{ display: "block", transform: "rotate(-6deg)", fontStyle: "italic" }}>A</span>
                  ) : f.id === "retro" ? (
                    <span style={{ color: "#c8a84b", textShadow: "1px 1px 0 #7a5c1e" }}>A</span>
                  ) : f.id === "stencil" ? (
                    <span style={{ fontWeight: 900 }}>A</span>
                  ) : (
                    "A"
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export function FacePicker({
  face,
  onChange,
}: {
  face: CardFaceStyle;
  onChange: (f: CardFaceStyle) => void;
}) {
  return (
    <div className="picker-wrap glass mt-3 rounded-2xl px-3 py-2.5">
      {/* Mobile: scrollable row of mini face-style preview chips */}
      <div className="flex items-center gap-2 md:hidden">
        <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Card face
        </span>
        <div className="flex gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FACES.map((f) => {
            const active = f.id === face;
            const isDark = f.id === "bold";
            const previewFont =
              f.id === "classic"
                ? "Georgia, serif"
                : f.id === "pixel"
                  ? "var(--font-mono)"
                  : "var(--font-display)";
            return (
              <button
                key={f.id}
                onClick={() => onChange(f.id)}
                title={f.label}
                aria-label={f.label}
                aria-pressed={active}
                className={`relative shrink-0 h-10 w-7 rounded-[5px] flex items-center justify-center font-bold transition-all ${
                  isDark ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
                } ${
                  active
                    ? "ring-2 ring-primary shadow-[0_0_8px_-2px_var(--neon)]"
                    : "opacity-60"
                }`}
                style={{ fontFamily: previewFont, fontSize: 14 }}
              >
                {f.id === "outline" ? (
                  <span style={{ color: "transparent", WebkitTextStroke: "1.5px #1a1a1a" }}>
                    A
                  </span>
                ) : f.id === "script" ? (
                  <span style={{ display: "block", transform: "rotate(-6deg)", fontStyle: "italic" }}>
                    A
                  </span>
                ) : f.id === "retro" ? (
                  <span style={{ color: "#c8a84b", textShadow: "1px 1px 0 #7a5c1e" }}>A</span>
                ) : f.id === "stencil" ? (
                  <span style={{ letterSpacing: "0.02em", fontWeight: 900, textTransform: "uppercase" }}>
                    A
                  </span>
                ) : (
                  "A"
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: pill buttons */}
      <div className="hidden md:flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Card face
        </span>
        {FACES.map((f) => {
          const active = f.id === face;
          const previewFont =
            f.id === "classic"
              ? "Georgia, serif"
              : f.id === "pixel"
                ? "var(--font-mono)"
                : "var(--font-display)";
          return (
            <button
              key={f.id}
              onClick={() => onChange(f.id)}
              className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
                active
                  ? "border-transparent text-primary-foreground"
                  : "border-border bg-secondary/40 text-secondary-foreground hover:bg-secondary/70"
              }`}
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, var(--neon), var(--neon-2))",
                      boxShadow: "0 4px 16px -8px var(--neon)",
                    }
                  : undefined
              }
              aria-pressed={active}
            >
              <span
                className={`flex h-5 w-4 items-center justify-center rounded-[4px] border text-[10px] font-bold ${
                  f.id === "bold"
                    ? "border-white/10 bg-neutral-900 text-white"
                    : "border-black/10 bg-white text-neutral-900"
                }`}
                style={{ fontFamily: previewFont }}
                aria-hidden
              >
                A
              </span>
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
