import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /klondike is the legacy URL for the Klondike Solitaire game.
 * The canonical URL is now the domain root (/), which serves the game directly.
 * This 301 redirect consolidates all link equity onto the domain root.
 */
export const Route = createFileRoute("/klondike")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
