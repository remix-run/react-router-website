import { redirect } from "react-router";
import type { Route } from "./+types/docs-index";

export function loader({ request }: Route.LoaderArgs) {
  let url = new URL(request.url);
  if (!url.pathname.endsWith("/")) {
    url.pathname += "/";
  }

  if (url.pathname.match(/^\/?(6)/)) {
    return redirect("/en" + url.pathname);
  } else {
    return redirect(url.pathname + "home");
  }
}
