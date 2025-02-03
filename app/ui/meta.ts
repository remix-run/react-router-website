import type { loader as docsLoader } from "~/pages/docs-layout";

type DocsData = Awaited<ReturnType<typeof docsLoader>>;

export function getDocTitle(api: DocsData, title: string) {
  let { releaseBranch, branches, currentGitHubRef } = api.header;

  let titleRef =
    currentGitHubRef === releaseBranch
      ? ""
      : branches.includes(currentGitHubRef)
        ? `(${currentGitHubRef} branch)`
        : currentGitHubRef.startsWith("v")
          ? currentGitHubRef
          : `v${currentGitHubRef}`;

  return `${title} ${titleRef}`;
}

export function getRobots(isProductionHost: boolean, parentData: DocsData) {
  let { releaseBranch, currentGitHubRef, refParam } = parentData.header;
  let isMainBranch = currentGitHubRef === releaseBranch;
  let robots = "noindex,nofollow";
  // Since "main" is the default branch we pull docs from, we don't want to
  // index the indentical pages that have "main" in the URL
  //
  // ✅ "/api/start/overview"
  // ❌ "/api/main/start/overview"
  //
  // `isMainBranch` is true with "main" and an undefined `refParam`, so we have
  // to explicitly check for the param to know if we shouldn't index
  //
  // TODO: I believe we need the v6 docs to be able to be indexed for docsearch crawler to find them. I could be wrong
  if (isProductionHost && isMainBranch && refParam !== "main") {
    robots = "index,follow";
  }

  return [
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
  ];
}

export function getDocsSearch(refParam?: string) {
  console.log({ refParam });
  return [
    { name: "docsearch:language", content: "en" },
    // TODO: this `refParam` for the v6 docs doesn't always exist
    // For example, this valid URL is what most users are hitting: http://localhost:3000/6.29.0/start/overview
    // this results in `refParam` being `undefined`
    //
    // Another thing to decide -- do we just want to do "v6" vs "v7", or do we want want search to be super version specific?
    { name: "docsearch:version", content: refParam || "v7" },
  ];
}
