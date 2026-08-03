import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { WinBanner } from "@/components/WinBanner";

export const Route = createFileRoute("/win-preview")({
  component: WinPreview,
});

function WinPreview() {
  const [key, setKey] = useState(0);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <WinBanner
        key={key}
        message="Completed in 4:12 · 87 moves"
        onNew={() => setKey(k => k + 1)}
        stats={{ wins: 14, gamesPlayed: 20, losses: 6, currentStreak: 3, bestStreak: 5, bestTime: 252, totalTime: 5040 }}
      />
    </div>
  );
}
