import { Link } from "@tanstack/react-router";
import { SolitaireStationLogo } from "./SolitaireStationLogo";

interface SiteFooterProps {
  /** Show a "← Back to game" link above the legal row (for content pages). */
  showBackLink?: boolean;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.732-8.849L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
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

        {/* Brand + social row */}
        <div
          className="mb-3 pb-3 flex flex-col items-center gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <SolitaireStationLogo variant="full" className="opacity-80 hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/solitairestatn"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Solitaire Station on X"
              className="opacity-50 hover:opacity-90 transition-opacity"
            >
              <XIcon className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/solitairestation"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Solitaire Station on Facebook"
              className="opacity-50 hover:opacity-90 transition-opacity"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
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
