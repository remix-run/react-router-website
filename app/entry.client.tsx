import ReactDOM from "react-dom";
import { RemixBrowser } from "remix";
import { createHistory } from "./mini-history";

// @ts-expect-error
ReactDOM.hydrate(<RemixBrowser history={createHistory()} />, document);
