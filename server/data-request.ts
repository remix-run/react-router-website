import type { Middleware } from "@remix-run/fetch-router";

// Data URLs (`.data`, and `.rsc` in RSC mode) are never content-negotiated, so
// ignore `Accept` and drop it from `Vary`. Otherwise a `<link rel="prefetch">`,
// which sends a browser `Accept`, can't be reused by the router's `fetch()`,
// which sends `*/*`, and every prefetched page downloads twice.
export function ignoreAcceptOnDataRequests(): Middleware {
  return async (context, next) => {
    let { pathname } = context.url;
    let isDataRequest =
      (context.method === "GET" || context.method === "HEAD") &&
      (pathname.endsWith(".data") || pathname.endsWith(".rsc"));

    if (!isDataRequest) {
      return next();
    }

    context.headers.delete("Accept");
    let response = await next();

    let headers = new Headers(response.headers);
    let vary = (headers.get("Vary") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value && value.toLowerCase() !== "accept");
    if (vary.length > 0) {
      headers.set("Vary", vary.join(", "));
    } else {
      headers.delete("Vary");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
