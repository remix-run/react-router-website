import ReactDOM from "react-dom";
import { RemixBrowser } from "remix";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

Sentry.init({
  dsn: "https://b6cab3d1883b49cebeb91ed4ea0b5fa3@o74198.ingest.sentry.io/5985336",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

ReactDOM.hydrate(<RemixBrowser />, document);
