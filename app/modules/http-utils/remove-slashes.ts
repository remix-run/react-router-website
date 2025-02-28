import { redirect } from "react-router";
import type { Route } from "../../+types/root";

export const removeTrailingSlashes: Route.unstable_MiddlewareFunction = async (
  { request },
  next
) => {
  let url = new URL(request.url);
  if (url.pathname.endsWith("/") && url.pathname !== "/") {
    url.pathname = url.pathname.slice(0, -1);
    throw redirect(url.toString());
  }
  // FIXME: Update RR to auto-bubble the internal response if `next` isn't
  // called so we can omit the return value
  return next();
};
