import * as React from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";

// enable :active styles on iOS since we disabled the gross tap highlight color
document.addEventListener("touchstart", function () {}, true);

requestIdleCallback(() => {
  React.startTransition(() => {
    hydrateRoot(
      document,
      <React.StrictMode>
        <RemixBrowser />
      </React.StrictMode>
    );
  });
});
