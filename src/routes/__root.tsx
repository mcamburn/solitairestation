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
            to="/"
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
            href="/"
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
      { title: "Solitaire Station — Play Free Online Solitaire" },
      { name: "description", content: "Solitaire Station — play free online Solitaire with no registration, no downloads, and no full-screen ads. Enjoy classic Klondike Solitaire Turn 1 or Turn 3, Vegas scoring, Double Klondike, unlimited undo, and six card games on mobile or desktop." },
      { name: "keywords", content: "free online solitaire, klondike solitaire, classic solitaire free, solitaire turn 3, solitaire turn 1, play solitaire online, solitaire no download, spider solitaire, freecell, pyramid solitaire" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://free-klondike-solitaire.com/" },
      { property: "og:title", content: "Solitaire Station — Play Free Online Solitaire" },
      { property: "og:description", content: "Play free online Solitaire at Solitaire Station. Features Klondike Turn 1 & Turn 3, Vegas scoring, Double Klondike, hints, unlimited undo, and six card games. No downloads required." },
      { property: "og:site_name", content: "Solitaire Station" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: "https://free-klondike-solitaire.com/og/klondike.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Solitaire Station — Play Free Online Solitaire" },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: "https://free-klondike-solitaire.com/" },
      { name: "twitter:title", content: "Solitaire Station — Play Free Online Solitaire" },
      { name: "twitter:description", content: "Play free online Solitaire at Solitaire Station. Features Klondike Turn 1 & Turn 3, hints, unlimited undo, and six card games. No downloads required." },
      { name: "twitter:image", content: "https://free-klondike-solitaire.com/og/klondike.png" },
      // PWA / mobile
      { name: "theme-color", content: "#b8901e" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Solitaire Station" },
    ],
    links: [
      { rel: "canonical", href: "https://free-klondike-solitaire.com/" },
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
      "@type": ["SoftwareApplication", "VideoGame"],
      "@id": "https://free-klondike-solitaire.com/#game",
      "url": "https://free-klondike-solitaire.com/",
      "name": "Solitaire Station",
      "headline": "Play Free Online Solitaire at Solitaire Station",
      "description": "Solitaire Station — play free online solitaire in your browser. Klondike Turn 1 & Turn 3, Vegas scoring, Double Klondike, Spider, FreeCell, Pyramid, TriPeaks, and Mahjong. No download required.",
      "applicationCategory": "GameApplication",
      "gameItem": "Card Game",
      "genre": ["Solitaire", "Card Game", "Casual Game"],
      "operatingSystem": "Any (Browser-based)",
      "inLanguage": "en",
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Solitaire Station",
        "url": "https://free-klondike-solitaire.com/"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://free-klondike-solitaire.com/#website",
      "url": "https://free-klondike-solitaire.com/",
      "name": "Solitaire Station",
      "publisher": {
        "@id": "https://free-klondike-solitaire.com/#game"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://free-klondike-solitaire.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is this Klondike Solitaire game completely free to play?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Solitaire Station is 100% free to play directly in your web browser with no download, subscription, or account creation required."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between Solitaire Turn 1 and Turn 3?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In Turn 1 Solitaire, one card is drawn from the stockpile at a time, making games easier to win. In Turn 3 Solitaire, three cards are drawn at a time, increasing difficulty and requiring deeper strategic planning."
          }
        },
        {
          "@type": "Question",
          "name": "Can I play Klondike Solitaire on mobile devices?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, our game is fully optimized for touch controls on smartphones and tablets, compatible with both iOS and Android browsers."
          }
        }
      ]
    }
  ]
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: WEBSITE_LD }} />
      </head>
      <body>
        {children}
        <Scripts />
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
