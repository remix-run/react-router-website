import { redirect, type unstable_MiddlewareFunction } from "react-router";

export const removeTrailingSlashes: unstable_MiddlewareFunction<
  void | Response
> = async ({ request }) => {
  let url = new URL(request.url);
  if (url.pathname.endsWith("/") && url.pathname !== "/") {
    url.pathname = url.pathname.slice(0, -1);
    throw redirect(url.toString());
  }
};
