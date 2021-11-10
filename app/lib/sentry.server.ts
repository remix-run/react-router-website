import * as Sentry from "@sentry/node";

// You'll need to call this function anytime you want to send an event to Sentry.
function initializeSentry() {
  Sentry.init({
    dsn: "https://b6cab3d1883b49cebeb91ed4ea0b5fa3@o74198.ingest.sentry.io/5985336",

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

  return Sentry;
}

export { initializeSentry };
