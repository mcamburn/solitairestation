import { useState } from "react";

export type ShareState = "idle" | "copied" | "shared";

interface SharePayload {
  title: string;
  text: string;
  url: string;
}

/**
 * Handles sharing via the Web Share API (mobile native sheet — covers
 * Messages, email, WhatsApp, etc.) with a clipboard-copy fallback for
 * browsers that don't support navigator.share (most desktops).
 */
export function useShareStreak() {
  const [shareState, setShareState] = useState<ShareState>("idle");

  const canNativeShare =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  const share = async (payload: SharePayload) => {
    if (canNativeShare) {
      try {
        await navigator.share(payload);
        setShareState("shared");
        setTimeout(() => setShareState("idle"), 2500);
      } catch {
        // User dismissed the sheet — no feedback needed
      }
    } else {
      const text = `${payload.text}\n${payload.url}`;
      try {
        await navigator.clipboard.writeText(text);
        setShareState("copied");
        setTimeout(() => setShareState("idle"), 2500);
      } catch {
        window.prompt("Copy to share:", text);
      }
    }
  };

  const buttonLabel = (idle: string) => {
    if (shareState === "copied") return "✓ Copied!";
    if (shareState === "shared") return "✓ Shared!";
    return idle;
  };

  return { share, shareState, buttonLabel, canNativeShare };
}
