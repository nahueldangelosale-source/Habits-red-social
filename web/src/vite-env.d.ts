/// <reference types="vite/client" />

/**
 * Bienestar APP — Vite Environment Variable Type Declarations
 * 
 * All custom env vars must be prefixed with VITE_ to be exposed to the client.
 * @see https://vitejs.dev/guide/env-and-mode.html
 */
interface ImportMetaEnv {
  // ─── API ────────────────────────────────────────────────────────────
  /** Backend API base URL (e.g. http://localhost:8000) */
  readonly VITE_API_URL: string;

  // ─── Google OAuth 2.0 ───────────────────────────────────────────────
  /** Google OAuth Client ID for GIS One-Tap & Token Client */
  readonly VITE_GOOGLE_CLIENT_ID?: string;

  // ─── Observability ──────────────────────────────────────────────────
  /** Sentry DSN for error tracking */
  readonly VITE_SENTRY_DSN?: string;
  /** PostHog project key for product analytics */
  readonly VITE_POSTHOG_KEY?: string;
  /** Enable/disable telemetry (default: false) */
  readonly VITE_ENABLE_TELEMETRY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
