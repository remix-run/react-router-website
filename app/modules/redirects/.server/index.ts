import { type MiddlewareFunction } from "react-router";
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
 * @param unstable_url Normalized location URL (see `future.unstable_passThroughRequests`)
 */
export const handleRedirects: MiddlewareFunction = async ({ unstable_url }) => {
  let redirects = await getRedirects();
  let response = await checkUrl(unstable_url.pathname, redirects);
  if (response) throw response;
};
