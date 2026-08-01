import { createFileRoute, redirect } from "@tanstack/react-router";

// The home page redirects to /klondike (Klondike is the primary game)
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/klondike" });
  },
  component: () => null,
});
