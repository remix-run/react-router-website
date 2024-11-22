import { redirect } from "react-router";
import type { Route } from "./+types/docs-index";

export function loader({ request }: Route.LoaderArgs) {
  let url = new URL(request.url);
  if (!url.pathname.endsWith("/")) {
    url.pathname += "/";
  }

  return redirect(url.pathname + "home");
}
