// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
//
// NOTE — tsconfig-paths (native resolver): @lovable.dev/vite-tanstack-config v2.8.2 unconditionally
// registers vite-tsconfig-paths and exposes no option to disable it or prefer Vite's native
// resolve.tsconfigPaths. Switching to the native resolver at this layer is not possible without
// patching the package. The vitest config (vitest.config.ts) already uses resolve.tsconfigPaths:true
// for test runs; for the main dev/build pipeline the third-party plugin remains in place via the
// wrapper. Revisit if a future version of the wrapper adds a tsConfigPaths:false option.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // The Lovable config defaults to the Cloudflare Workers preset, which
  // doesn't run as a plain Node process. Replit's deployment runs the app
  // as a Node server, so build a Node-compatible server bundle instead.
  nitro: {
    preset: "node-server",
  },
  // Replit's container doesn't support IPv6 bind (::) and proxies the preview
  // through an iframe on a different origin, so we need 0.0.0.0:5000 + allowedHosts.
  vite: {
    server: {
      host: "0.0.0.0",
      port: 5000,
      strictPort: true,
      allowedHosts: true,
    },
  },
});
