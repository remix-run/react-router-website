import { RemixBrowser } from "@remix-run/react";
import { hydrate } from "react-dom";

// enable :active styles on iOS since we disabled the gross tap highlight color
document.addEventListener("touchstart", function () {}, true);

hydrate(<RemixBrowser />, document);
