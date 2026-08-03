/** Canonical production origin for Solitaire Station — used for absolute og:image and og:url meta tags. */
export const SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  "https://www.solitairestation.com";
