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

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
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
            <a
              href="https://www.pinterest.com/solitairestation/"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Solitaire Station on Pinterest"
              className="opacity-50 hover:opacity-90 transition-opacity"
            >
              <PinterestIcon className="h-4 w-4" />
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
