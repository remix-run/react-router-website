import ReactDOM from "react-dom";
import { RemixBrowser } from "remix";
import { createHistory } from "./mini-history";

ReactDOM.hydrate(<RemixBrowser history={createHistory()} />, document);
