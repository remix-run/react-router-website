import { ensureSecure } from "~/modules/http-utils/ensure-secure";
import { handleRedirects } from "~/modules/redirects/.server";
import { removeTrailingSlashes } from "~/modules/http-utils/remove-slashes";

export const CACHE_CONTROL = {
  /**
   * Keep it in the browser (and CDN) for 5 minutes so when they click
   * back/forward/etc.  It's super fast, swr for 1 week on CDN so it stays fast
   * but people get typos fixes and stuff, too.
   */
  doc: "max-age=300, stale-while-revalidate=604800",
};

export async function whyDoWeNotHaveGoodMiddleWareYetRyan(
  request: Request
): Promise<void> {
  await ensureSecure(request);
  await removeTrailingSlashes(request);
  await handleRedirects(request);
}
