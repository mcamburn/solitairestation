import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { CardAppearanceProvider } from "../components/CardPickers";
import { Toaster } from "../components/ui/sonner";
import { SAVE_RESET_EVENT } from "../lib/persist";

// Register the save-reset handler at module-load time so it is always in place
// before any child component useEffect hooks fire (React runs child effects
// before parent effects on mount, so a useEffect in RootComponent would miss
// events dispatched during game component initialisation).
// Sonner queues toasts that arrive before <Toaster> mounts and flushes them
// once the component is rendered, so this is safe to call early.
if (typeof window !== "undefined") {
  window.addEventListener(SAVE_RESET_EVENT, () => {
    toast("Your saved game was reset after an update — sorry!", {
      duration: 6000,
    });
  });
}

import appCss from "../styles.css?url";
import { reportError } from "../lib/error-reporting";
import { SITE_URL } from "../lib/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/klondike"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportError(error, { boundary: "root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/klondike"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" },
      { title: "Solitaire Station — Play Free Online Solitaire Instantly" },
      { name: "description", content: "16 free solitaire games — customizable card designs, hints, undo, and auto-save. Klondike, Spider, FreeCell, Golf, Mahjong, and more. No download or sign-up." },
      { name: "keywords", content: "free online solitaire, play solitaire instantly, klondike solitaire, spider solitaire, freecell, pyramid solitaire, mahjong solitaire, golf solitaire, forty thieves, yukon solitaire, scorpion solitaire, canfield solitaire, tripeaks solitaire, solitaire no download, solitaire turn 1, solitaire turn 3" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      // Open Graph
      { property: "og:type", content: "website" },
      // og:url is set per-route; no global default here
      { property: "og:title", content: "Solitaire Station — Play Free Online Solitaire Instantly" },
      { property: "og:description", content: "16 free solitaire games with customizable card backs and face styles — hints, undo, and auto-save included. No download or sign-up. Works on any device." },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: `${SITE_URL}/og/klondike.png?v=6` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Play Free Online Solitaire Instantly" },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      // twitter:url is set per-route
      { name: "twitter:title", content: "Solitaire Station — Play Free Online Solitaire Instantly" },
      { name: "twitter:description", content: "16 free solitaire games — customizable card designs, hints, and auto-save. Klondike, Spider, FreeCell, Golf, Mahjong, and more. No download." },
      { name: "twitter:image", content: `${SITE_URL}/og/klondike.png?v=6` },
      // PWA / mobile
      { name: "theme-color", content: "#b8901e" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Solitaire Station" },
    ],
    links: [
      // canonical is set per-route; no global fallback here
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.json" },
      // Solitaire Station card icon favicon
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      // Social profile ownership signals (rel=me tells Google these profiles belong to this domain)
      { rel: "me", href: "https://x.com/solitairestatn" },
      { rel: "me", href: "https://www.facebook.com/solitairestation" },
      { rel: "me", href: "https://www.pinterest.com/solitairestation/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const WEBSITE_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      // VideoGame is a subtype of SoftwareApplication — no need to list both
      "@type": "VideoGame",
      "@id": `${SITE_URL}/#game`,
      "url": `${SITE_URL}/`,
      "name": "Solitaire Station",
      "description": "Solitaire Station — play 16 free solitaire games instantly in your browser, with customizable card backs and face styles, hints, undo, and auto-save. Klondike, Spider, FreeCell, Pyramid, TriPeaks, Mahjong, Golf, Forty Thieves, Yukon, Scorpion, Eight Off, Canfield, Baker's Dozen, Baker's Game, Clock, and Addiction. No download or sign-up required.",
      "applicationCategory": "GameApplication",
      "genre": ["Solitaire", "Card Game", "Casual Game"],
      "operatingSystem": "Web",
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "publisher": {
        "@id": `${SITE_URL}/#organization`
      }
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "Solitaire Station",
      "url": `${SITE_URL}/`,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/favicon.svg`,
        "contentUrl": `${SITE_URL}/favicon.svg`,
      },
      "sameAs": [
        "https://x.com/solitairestatn",
        "https://www.facebook.com/solitairestation",
        "https://www.pinterest.com/solitairestation/"
      ]
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": `${SITE_URL}/`,
      "name": "Solitaire Station",
      "publisher": {
        "@id": `${SITE_URL}/#organization`
      }
    },
  ]
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head suppressHydrationWarning>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        {/* JSON-LD and analytics kept in <body> so Replit's <head> script injection
            never causes a child-node-order hydration mismatch */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: WEBSITE_LD }} />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-LC34HC1KHJ" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-LC34HC1KHJ');` }} />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CardAppearanceProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster />
      </CardAppearanceProvider>
    </QueryClientProvider>
  );
}
