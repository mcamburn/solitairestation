import type { GameStats } from "@/lib/stats";
import { getWinRate, formatStatTime } from "@/lib/stats";

interface WinBannerProps {
  message?: string;
  onNew: () => void;
  variant?: "win" | "stuck";
  stats?: GameStats | null;
}

export function WinBanner({ message, onNew, variant = "win", stats }: WinBannerProps) {
  const isStuck = variant === "stuck";

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

  return (
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
      <button
        onClick={onNew}
        className="mt-5 rounded-xl px-7 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}
      >
        {isStuck ? "New Game" : "Play Again"}
      </button>
    </div>
  );
}
