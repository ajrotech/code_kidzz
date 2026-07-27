// Error monitoring (Sentry) — catches and reports crashes from real visitors,
// not just what you happen to notice yourself.
//
// Not wired to a real project yet — needs your own Sentry DSN (free tier is
// enough to start: sentry.io). Steps once you have one:
//   1. npm install @sentry/react
//   2. Set SENTRY_DSN below
//   3. Uncomment the Sentry.init(...) call
// Until then this file is a harmless no-op.

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN ?? '';

export function initMonitoring() {
  if (!SENTRY_DSN) return;

  // import * as Sentry from '@sentry/react';
  // Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.2 });
}
