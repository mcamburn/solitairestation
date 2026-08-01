import { Link } from "@tanstack/react-router";
import { SolitaireStationLogo } from "./SolitaireStationLogo";

interface SiteFooterProps {
  /** Show a "← Back to game" link above the legal row (for content pages). */
  showBackLink?: boolean;
}

export function SiteFooter({ showBackLink }: SiteFooterProps) {
  return (
    <footer className="mt-10">
      <div
        className="glass rounded-2xl px-5 py-4 text-xs text-muted-foreground"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {showBackLink && (
          <div
            className="mb-3 pb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Link
              to="/"
              className="uppercase tracking-[0.22em] transition hover:text-foreground"
            >
              ← Back to game
            </Link>
          </div>
        )}

        {/* Brand + legal row */}
        <div className="mb-3 pb-3 flex justify-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <SolitaireStationLogo variant="full" className="opacity-80 hover:opacity-100 transition-opacity" />
        </div>

        {/* Legal row */}
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div>© 2026 Publish Port. All rights reserved.</div>
          <nav className="flex items-center gap-5" aria-label="Site links">
            <Link to="/guides" className="transition hover:text-foreground">Guides</Link>
            <Link to="/stats" className="transition hover:text-foreground">My Stats</Link>
            <Link to="/about" className="transition hover:text-foreground">About</Link>
            <Link to="/privacy" className="transition hover:text-foreground">Privacy Policy</Link>
            <Link to="/terms" className="transition hover:text-foreground">Terms of Use</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
