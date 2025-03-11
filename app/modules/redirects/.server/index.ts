import { type unstable_MiddlewareFunction } from "react-router";
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
export const handleRedirects: unstable_MiddlewareFunction<
  void | Response
> = async ({ request }) => {
  let redirects = await getRedirects();
  let url = new URL(request.url);
  let response = await checkUrl(url.pathname, redirects);
  if (response) throw response;
};
