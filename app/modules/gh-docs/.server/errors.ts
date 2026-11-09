import { CACHE_CONTROL } from "~/http";

/** GitHub says the file or ref doesn't exist (as opposed to being down). */
export class DocNotFoundError extends Error {
  name = "DocNotFoundError";
}

/**
 * Converts a docs fetching error into an uncacheable Response. Only a real
 * "not found" is a 404; anything else is a 503 so the CDN can serve stale.
 */
export function toDocErrorResponse(error: unknown): Response {
  if (error instanceof Response) return error;

  if (error instanceof DocNotFoundError) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Cache-Control": CACHE_CONTROL.none },
    });
  }

  console.error(error);
  return new Response("Cannot reach GitHub", {
    status: 503,
    headers: { "Cache-Control": CACHE_CONTROL.none, "Retry-After": "30" },
  });
}
