import { type loader as docsLoader } from "~/pages/docs-layout";

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
  if (isProductionHost && isMainBranch && refParam !== "main") {
    robots = "index,follow";
  }

  return [
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
  ];
}

export function getDocsSearch(refParam?: string) {
  return [
    { name: "docsearch:language", content: "en" },
    { name: "docsearch:version", content: refParam || "v7" },
  ];
}
