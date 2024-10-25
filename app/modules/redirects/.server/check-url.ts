import { redirect } from "react-router";
import type { Redirect } from "./get-redirects";

export async function checkUrl(url: string, redirects: Redirect[]) {
  for (let r of redirects) {
    let [from, to, splat, status] = r;
    let match = splat ? url.startsWith(from) : from === url;
    if (match) {
      let location = to;
      if (to.endsWith("/*")) {
        let base = to.slice(0, -2);
        let splatPath = url.replace(from, "");
        location = base + splatPath;
      }
      if (
        !location.startsWith("/") &&
        !location.startsWith("http://") &&
        !location.startsWith("https://")
      ) {
        location = "/" + location;
      }
      return redirect(location, { status });
    }
  }
  return null;
}
