import type { Route } from "../../../+types/root";
import { checkUrl } from "./check-url";
import { getRedirects } from "./get-redirects";

/**
 * Super basic redirects handling with a redirects file.
 *
 * ```
 * # from   to    status
 * /cheese  /taco  302
 *
 * # very, very, very basic support for trailing splat
 * /docs/*  /api/*
 * ```
 *
 * @param request Web Fetch Request to possibly redirect
 */
export const handleRedirects: Route.unstable_MiddlewareFunction = async (
  { request },
  next
) => {
  let redirects = await getRedirects();
  let url = new URL(request.url);
  let response = await checkUrl(url.pathname, redirects);
  if (response) throw response;
  // FIXME: Update RR to auto-bubble the internal response if `next` isn't
  // called so we can omit the return value
  return next();
};
