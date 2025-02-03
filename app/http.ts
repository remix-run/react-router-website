import { ensureSecure } from "~/modules/http-utils/ensure-secure";
import { handleRedirects } from "~/modules/redirects/.server";
import { removeTrailingSlashes } from "~/modules/http-utils/remove-slashes";

export const CACHE_CONTROL = {
  // what we use for docs so they are up-to-date within minutes of what's on
  // github
  doc: "public, max-age=300, stale-while-revalidate=604800",

  // don't cache at all
  none: "no-store, no-cache, must-revalidate, max-age=0",
};

export async function middlewares(request: Request): Promise<void> {
  await ensureSecure(request);
  await removeTrailingSlashes(request);
  await handleRedirects(request);
}
