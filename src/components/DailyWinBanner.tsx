import { useState } from "react";
import type { GameStats } from "@/lib/stats";
import { getWinRate, formatStatTime } from "@/lib/stats";
import { WinCelebration } from "./WinCelebration";
import { useDailyChallenge } from "@/contexts/DailyChallengeContext";
import { getTodayKey } from "@/lib/daily";
import { SITE_URL } from "@/lib/site";
import { getGameLabel } from "@/lib/gameLabels";
import { useShareStreak } from "@/hooks/useShareStreak";

interface DailyWinBannerProps {
  message?: string;
  onNew: () => void;
  variant?: "win" | "stuck";
  stats?: GameStats | null;
  modeLabel?: string;
}

/**
 * Drop-in replacement for WinBanner that shows an enhanced daily-challenge
 * celebration when the game was won in daily mode. Falls back to the
 * standard WinBanner UI for regular wins and for stuck/no-moves states.
 */
export function DailyWinBanner({ message, onNew, variant = "win", stats, modeLabel }: DailyWinBannerProps) {
  const { justWonDailyStreak, clearDailyWin, activateDaily, gameKey } = useDailyChallenge();
  const [celebrating, setCelebrating] = useState(true);
  const { share, buttonLabel } = useShareStreak();

  const handleNew = () => {
    clearDailyWin();
    onNew();
  };

  const handleReplayDaily = () => {
    // Re-deal today's seed without affecting the streak
    activateDaily();
  };

  const gameLabel = getGameLabel(gameKey);
  const gameUrl = `${SITE_URL}/${gameKey}`;

  const isStuck = variant === "stuck";
  const isDaily = !isStuck && justWonDailyStreak !== null;

  // ── Regular / stuck path ──────────────────────────────────────────────────
  if (!isDaily) {
    const statItems: string[] = [];
    if (stats && stats.gamesPlayed > 0) {
      statItems.push(`${stats.wins} win${stats.wins !== 1 ? "s" : ""} / ${stats.gamesPlayed} played`);
      if (stats.gamesPlayed > 1) statItems.push(`${getWinRate(stats)}% win rate`);
      if (stats.currentStreak >= 2) statItems.push(`🔥 ${stats.currentStreak} streak`);
      if (stats.bestTime !== null) statItems.push(`Best: ${formatStatTime(stats.bestTime)}`);
      if (stats.bestRun > 0) statItems.push(`Best run: ${stats.bestRun}`);
    }

    return (
      <>
        {celebrating && !isStuck && <WinCelebration onDone={() => setCelebrating(false)} />}
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
          {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
          {statItems.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">{statItems.join(" · ")}</p>
          )}
          <div className={`mt-5 flex flex-col gap-2 ${!isStuck ? "sm:flex-row sm:justify-center" : ""}`}>
            {!isStuck && (
              <button
                onClick={() => {
                  const streak = stats?.currentStreak ?? 0;
                  const text = streak >= 2
                    ? `🔥 ${streak}-game win streak on Solitaire Station!\nPlaying ${gameLabel} — can you beat it?`
                    : `🎉 Just won a game of ${gameLabel} on Solitaire Station!`;
                  share({ title: "Solitaire Station", text, url: gameUrl });
                }}
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
              onClick={handleNew}
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

  // ── Daily win path ────────────────────────────────────────────────────────
  const today = getTodayKey(); // YYYY-MM-DD
  // Parse as UTC noon so local-timezone offsets don't shift the date
  const dateObj = new Date(today + "T12:00:00Z");
  const dateLabel = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const streakLabel =
    justWonDailyStreak === 1
      ? "1st daily complete!"
      : `${justWonDailyStreak}-day streak 🔥`;

  const siteHost = SITE_URL.replace(/^https?:\/\/(www\.)?/, "");
  const dailyShareText = [
    `🃏 Solitaire Station – Daily ${gameLabel}`,
    `📅 ${dateLabel} (local time)`,
    `🔥 ${streakLabel}`,
    ``,
    `16 free card games at ${siteHost}`,
  ].join("\n");

  const handleDailyShare = () => {
    share({
      title: `Solitaire Station – Daily ${gameLabel}`,
      text: dailyShareText,
      url: gameUrl,
    });
  };

  const statItems: string[] = [];
  if (stats && stats.gamesPlayed > 0) {
    statItems.push(`${stats.wins} win${stats.wins !== 1 ? "s" : ""} / ${stats.gamesPlayed} played`);
    if (stats.gamesPlayed > 1) statItems.push(`${getWinRate(stats)}% win rate`);
    if (stats.bestTime !== null) statItems.push(`Best: ${formatStatTime(stats.bestTime)}`);
    if (stats.bestRun > 0) statItems.push(`Best run: ${stats.bestRun}`);
  }

  return (
    <>
      {celebrating && <WinCelebration onDone={() => setCelebrating(false)} />}
      <div
        className="glass mt-6 rounded-2xl px-8 py-10 text-center"
        style={{
          borderColor: "var(--neon-2)",
          boxShadow: "0 0 60px -8px var(--neon-2), 0 0 20px -4px var(--neon)",
        }}
      >
        {/* Daily badge */}
        <div
          className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
          style={{
            background: "linear-gradient(135deg, var(--neon), var(--neon-2))",
            color: "var(--primary-foreground)",
          }}
        >
          ☀️ Daily{modeLabel ? ` · ${modeLabel}` : " Complete"}
        </div>

        <div className="text-5xl">🎉</div>

        <h2
          className="mt-3 text-3xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--neon)" }}
        >
          You won!
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">{dateLabel}</p>

        {/* Streak highlight */}
        <div
          className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5"
          style={{
            background: "linear-gradient(135deg, color-mix(in srgb, var(--neon) 15%, transparent), color-mix(in srgb, var(--neon-2) 15%, transparent))",
            border: "1px solid color-mix(in srgb, var(--neon-2) 40%, transparent)",
          }}
        >
          <span className="text-2xl">🔥</span>
          <span
            className="text-lg font-bold"
            style={{ color: "var(--neon-2)", fontFamily: "var(--font-display)" }}
          >
            {streakLabel}
          </span>
        </div>

        {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}

        {statItems.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">{statItems.join(" · ")}</p>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={handleDailyShare}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{
              background: "color-mix(in srgb, var(--neon-2) 20%, transparent)",
              border: "1px solid color-mix(in srgb, var(--neon-2) 50%, transparent)",
              color: "var(--neon-2)",
            }}
          >
            {buttonLabel("📤 Share Result")}
          </button>
          <button
            onClick={handleNew}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--neon), var(--neon-2))" }}
          >
            Play Again
          </button>
        </div>

        {/* Replay daily — practice only, no streak effect */}
        <div className="mt-3">
          <button
            onClick={handleReplayDaily}
            className="rounded-xl px-5 py-2 text-sm font-medium transition hover:opacity-80"
            style={{
              background: "color-mix(in srgb, var(--foreground) 8%, transparent)",
              border: "1px solid color-mix(in srgb, var(--foreground) 20%, transparent)",
              color: "var(--muted-foreground)",
            }}
          >
            🔁 Replay Today's Deal
          </button>
          <p className="mt-1 text-xs text-muted-foreground opacity-70">
            Practice only — won't affect your streak
          </p>
        </div>
      </div>
    </>
  );
}
