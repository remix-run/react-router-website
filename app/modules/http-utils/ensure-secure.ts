import { redirect } from "react-router";
import type { Route } from "../../+types/root";

export const ensureSecure: Route.unstable_MiddlewareFunction = async (
  { request },
  next
) => {
  let proto = request.headers.get("x-forwarded-proto");
  // this indirectly allows `http://localhost` because there is no
  // "x-forwarded-proto" in the local server headers
  if (proto === "http") {
    let secureUrl = new URL(request.url);
    secureUrl.protocol = "https:";
    throw redirect(secureUrl.toString());
  }
  // FIXME: Update RR to auto-bubble the internal response if `next` isn't
  // called so we can omit the return value
  return next();
};
