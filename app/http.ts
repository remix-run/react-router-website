import { createCookie } from "@remix-run/node";

export const CACHE_CONTROL = {
  /**
   * Keep it in the browser (and CDN) for 5 minutes so when they click
   * back/forward/etc.  It's super fast, swr for 1 week on CDN so it stays fast
   * but people get typos fixes and stuff, too.
   */
  doc: "max-age=300, stale-while-revalidate=604800",
};

let prefs = createCookie("user-prefs", { maxAge: 34560000, sameSite: "lax" });

export async function getPrefs(request: Request) {
  const header = request.headers.get("Cookie");
  const cookie = await prefs.parse(header);
  return cookie || {};
}

export function serializePrefs(vals: any) {
  return prefs.serialize(vals);
}

export function isProductionHost(request: Request) {
  return "reactrouter.com" === request.headers.get("host");
}
