import { redirect } from "remix";
import type { LoaderFunction } from "remix";

function addTrailingSlash(request: Request) {
  return (fn: () => ReturnType<LoaderFunction>) => {
    let url = new URL(request.url);
    if (
      // not a fetch request
      !url.searchParams.has("_data") &&
      // doesn't have a trailing slash
      !url.pathname.endsWith("/")
    ) {
      return redirect(request.url + "/", {
        status: process.env.NODE_ENV === "production" ? 308 : 302,
      });
    }
    return fn();
  };
}

export { addTrailingSlash };
