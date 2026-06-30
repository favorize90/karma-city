import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Karma City — Capacitor hybrid configuration.
 *
 * The native shell is a thin WebView that loads the live SSR app on Vercel via
 * `server.url`. We reuse 100% of the Next.js app (RSC, middleware, server actions,
 * Supabase cookie auth) and get live updates on every Vercel deploy — no app
 * rebuild needed for web changes.
 *
 * Auth note: email+password is the reliable in-app path. Its Supabase cookies
 * carry a ~1-year Max-Age, so they persist in the native WebView cookie jar across
 * app restarts. We deliberately do NOT enable CapacitorHttp/CapacitorCookies (which
 * would route cookies through the buggy native proxy) and do NOT set
 * WKAppBoundDomains (which would block the JS bridge). Magic-link/OAuth needs
 * Universal Links + an Apple account and is disabled in the app for the demo.
 */
const config: CapacitorConfig = {
  appId: "app.karmacity.demo",
  appName: "Karma City",
  // Validated by the CLI but unused at runtime in hybrid mode (server.url wins).
  webDir: "public-cap",
  server: {
    // The live SSR app on Vercel — the whole point of the hybrid setup.
    url: "https://gamechanger-rho-ten.vercel.app",
    // HTTPS only, so cleartext stays false.
    cleartext: false,
    // Keep navigation (and thus the Supabase cookie/session context) inside the
    // WebView for the app domain + the Supabase auth domain, instead of bouncing
    // out to Safari/Chrome (which would break the cookie session).
    allowNavigation: ["gamechanger-rho-ten.vercel.app", "*.supabase.co"],
  },
  ios: {
    // Avoids content sliding under the iOS status bar/notch in a full-page web app.
    contentInset: "always",
  },
  android: {
    // All traffic is HTTPS, so no mixed content needed. Keep secure default.
    allowMixedContent: false,
  },
};

export default config;
