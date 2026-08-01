import { createFileRoute, redirect } from "@tanstack/react-router";

// /klondike now redirects to / (Klondike is the home page)
export const Route = createFileRoute("/klondike")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
