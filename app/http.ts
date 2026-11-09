export const CACHE_CONTROL = {
  // what we use for docs so they are up-to-date within minutes of what's on
  // github, and keep serving the last good copy if the origin errors
  doc: "public, max-age=300, stale-while-revalidate=604800, stale-if-error=604800",

  // don't cache at all
  none: "no-store, no-cache, must-revalidate, max-age=0",
};

/**
 * Sets the docs Cache-Control, except for errors, which must never be cached.
 * `errorHeaders` is only defined when the route is rendering an error.
 */
export function setDocCacheControl(
  headers: Headers,
  errorHeaders?: Headers,
): Headers {
  if (errorHeaders) {
    headers.set("Cache-Control", CACHE_CONTROL.none);
    let retryAfter = errorHeaders.get("Retry-After");
    if (retryAfter) headers.set("Retry-After", retryAfter);
  } else {
    headers.set("Cache-Control", CACHE_CONTROL.doc);
  }
  return headers;
}
