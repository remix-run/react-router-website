export const CACHE_CONTROL = {
  // what we use for docs so they are up-to-date within minutes of what's on
  // github
  doc: "public, max-age=300, stale-while-revalidate=604800",

  // don't cache at all
  none: "no-store, no-cache, must-revalidate, max-age=0",
};
