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
  let { latestVersion, releaseBranch, currentGitHubRef, refParam } =
    parentData.header;
  let isMainBranch = currentGitHubRef === releaseBranch;
  let postV7 = latestVersion.startsWith("7.");
  let robots = "noindex,nofollow";
  if (postV7) {
    // Since "main" is the default branch we pull docs from, we don't want to
    // index the indentical pages that have "main" in the URL
    //
    // ✅ "/api/start/overview"
    // ❌ "/api/main/start/overview"
    //
    // `isMainBranch` is true with "main" and an undefined `refParam`, so we have
    // to explicitly check for the param to know if we should index
    if (isProductionHost && isMainBranch && refParam !== "main") {
      robots = "index,follow";
    }
  } else {
    // TODO: delete this else block post v7 launch
    if (isProductionHost && isMainBranch) {
      robots = "index,follow";
    }
  }

  return [
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
  ];
}

export function getDocsSearch(refParam?: string) {
  return [
    { name: "docsearch:language", content: "en" },
    // TODO: change this to v7 after launch and maybe look into how it works?
    { name: "docsearch:version", content: refParam || "v6" },
  ];
}
