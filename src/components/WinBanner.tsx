import { useState } from "react";
import type { GameStats } from "@/lib/stats";
import { getWinRate, formatStatTime } from "@/lib/stats";
import { WinCelebration } from "./WinCelebration";
import { useShareStreak } from "@/hooks/useShareStreak";
import { SITE_URL } from "@/lib/site";
import { getGameLabel } from "@/lib/gameLabels";

interface WinBannerProps {
  message?: string;
  onNew: () => void;
  variant?: "win" | "stuck";
  stats?: GameStats | null;
  gameKey?: string;
}

export function WinBanner({ message, onNew, variant = "win", stats, gameKey }: WinBannerProps) {
  const isStuck = variant === "stuck";
  const [celebrating, setCelebrating] = useState(!isStuck);
  const { share, buttonLabel } = useShareStreak();

  const statItems: string[] = [];
  if (stats && stats.gamesPlayed > 0) {
    statItems.push(`${stats.wins} win${stats.wins !== 1 ? "s" : ""} / ${stats.gamesPlayed} played`);
    if (stats.gamesPlayed > 1) {
      statItems.push(`${getWinRate(stats)}% win rate`);
    }
    if (stats.currentStreak >= 2) {
      statItems.push(`🔥 ${stats.currentStreak} streak`);
    }
    if (stats.bestTime !== null) {
      statItems.push(`Best: ${formatStatTime(stats.bestTime)}`);
    }
  }

  const handleShare = () => {
    const gameName = gameKey ? getGameLabel(gameKey) : "Solitaire";
    const gameUrl = gameKey ? `${SITE_URL}/${gameKey}` : SITE_URL;
    const streak = stats?.currentStreak ?? 0;
    const text = streak >= 2
      ? `🔥 ${streak}-game win streak on Solitaire Station!\nPlaying ${gameName} — can you beat it?`
      : `🎉 Just won a game of ${gameName} on Solitaire Station!`;
    share({ title: "Solitaire Station", text, url: gameUrl });
  };

  return (
    <>
      {celebrating && <WinCelebration onDone={() => setCelebrating(false)} />}
      <div
        className="glass mt-6 rounded-2xl px-8 py-10 text-center"
        style={{
          borderColor: isStuck ? "var(--muted-foreground)" : "var(--neon)",
          boxShadow: isStuck
            ? "0 0 40px -8px hsl(var(--muted-foreground))"
            : "0 0 40px -8px var(--neon)",
        }}
      >
        <div className="text-5xl">{isStuck ? "🚫" : "🎉"}</div>
        <h2
          className="mt-3 text-3xl font-bold tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: isStuck ? "var(--foreground)" : "var(--neon)",
          }}
        >
          {isStuck ? "No more moves" : "You won!"}
        </h2>
        {message && (
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        )}
        {statItems.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {statItems.join(" · ")}
          </p>
        )}
        <div className={`mt-5 flex flex-col gap-2 ${!isStuck ? "sm:flex-row sm:justify-center" : ""}`}>
          {!isStuck && (
            <button
              onClick={handleShare}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
              style={{
                background: "color-mix(in srgb, var(--neon) 20%, transparent)",
                border: "1px solid color-mix(in srgb, var(--neon) 50%, transparent)",
                color: "var(--neon)",
              }}
            >
              {buttonLabel("📤 Share")}
            </button>
          )}
          <button
            onClick={onNew}
            className="rounded-xl px-7 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}
          >
            {isStuck ? "New Game" : "Play Again"}
          </button>
        </div>
      </div>
    </>
  );
}
