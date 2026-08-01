---
name: Daily challenge TDZ fix
description: Pattern required to avoid TDZ crash in dailyTrigger useEffect across classic game components
---

# Daily challenge dailyResetRef pattern

## The rule
Every game component's `dailyTrigger` useEffect **must not** reference `reset` or `resetWithSeed` directly. Instead use a `dailyResetRef` that is updated each render after `reset` is defined.

```tsx
// Near the top of the component (before the dailyTrigger useEffect):
const dailyResetRef = useRef<(() => void) | null>(null);

// The useEffect (in its original position — do NOT move it):
useEffect(() => {
  if (dailyTrigger === 0) return;
  dailyModeRef.current = true;
  statsRef.current = false;
  dailyResetRef.current?.();
}, [dailyTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

// After reset/resetWithSeed is defined (during render, not in an effect):
dailyResetRef.current = () => resetWithSeed(mode, dailySeed);
// or:
dailyResetRef.current = () => reset(dailySeed);
```

## Why
`const resetWithSeed`/`const reset` are declared ~100 lines after the `dailyTrigger` useEffect in the classic game components. During Vite HMR reconnection, React runs the effect callback before the component function has re-executed (so before `reset` is initialized). `const` has temporal dead zone → `ReferenceError: Cannot access 'resetWithSeed' before initialization`. This only manifested in dev (HMR) but indicated a latent ordering problem.

## How to apply
Any new game component that wires `useDailyChallenge()` must follow this pattern. The affected original files are: Solitaire.tsx, Spider.tsx, FreeCell.tsx, Pyramid.tsx, TriPeaks.tsx, Mahjong.tsx. The 10 newer games (Golf, FortyThieves, Yukon, Scorpion, EightOff, Canfield, Addiction, BakersDozn, BakersGame, Clock) define `reset` BEFORE the dailyTrigger effect and do not need the ref.
