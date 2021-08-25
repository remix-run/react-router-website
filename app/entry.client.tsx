import ReactDOM from "react-dom";
import { RemixBrowser } from "remix";

if (window.history.scrollRestoration !== "manual") {
  window.history.scrollRestoration = "manual";
}

ReactDOM.hydrate(<RemixBrowser />, document);
