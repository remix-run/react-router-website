import { RemixBrowser } from "@remix-run/react";
import { hydrate } from "react-dom";
import { Entry } from "./entry";

// enable :active styles on iOS since we disabled the gross tap highlight color
document.addEventListener("touchstart", function () {}, true);

hydrate(
  <Entry context={window.__remixContext}>
    <RemixBrowser />
  </Entry>,
  document
);
