import type { Middleware, RequestContext } from "@remix-run/fetch-router";

// Data URLs (`.data`, and `.rsc` in RSC mode) are never content-negotiated, so
// ignore `Accept` and drop it from `Vary`. Otherwise a `<link rel="prefetch">`,
// which sends a browser `Accept`, can't be reused by the router's `fetch()`,
// which sends `*/*`, and every prefetched page downloads twice.
export function ignoreAcceptOnDataRequests(): Middleware {
  return async (context, next) => {
    if (!isDataRequest(context)) {
      return next();
    }

    context.headers.delete("Accept");
    return withoutVary(await next(), "Accept");
  };
}

function isDataRequest(context: RequestContext): boolean {
  if (context.method !== "GET" && context.method !== "HEAD") {
    return false;
  }

  let { pathname } = context.url;
  return pathname.endsWith(".data") || pathname.endsWith(".rsc");
}

function withoutVary(response: Response, headerName: string): Response {
  let vary = response.headers.get("Vary");
  if (!vary) {
    return response;
  }

  let values = vary.split(",").map((value) => value.trim());
  let remaining = values.filter(
    (value) => value && value.toLowerCase() !== headerName.toLowerCase(),
  );
  if (remaining.length === values.length) {
    return response;
  }

  let headers = new Headers(response.headers);
  if (remaining.length > 0) {
    headers.set("Vary", remaining.join(", "));
  } else {
    headers.delete("Vary");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
