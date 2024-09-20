import invariant from "tiny-invariant";
import { type loader as rootLoader } from "~/root";
import { type loader as guidesLoader } from "~/pages/guides-layout";
import { type loader as apiLoader } from "~/pages/api-layout";

type APIData = Awaited<ReturnType<typeof apiLoader>>;
type GuidesData = Awaited<ReturnType<typeof guidesLoader>>;
type RootData = Awaited<ReturnType<typeof rootLoader>>;

export function getRootMatchData(matches: any): RootData {
  let root = matches.find((m: any) => m.id === "root");
  invariant(root, `Expected root route`);
  return root.data;
}

export function getApiMatchData(matches: any): APIData {
  let api = matches.find((m: any) => m.id === "api");
  invariant(api, `Expected api parent route`);
  return api.data;
}

export function getGuideMatchData(matches: any): GuidesData {
  let guides = matches.find(
    (m: any) => m.id === "guides" || m.id === "v6-guides"
  );
  invariant(guides, `Expected guides parent route`);
  return guides.data;
}

export function getDocTitle(api: APIData | GuidesData, title: string) {
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

export function getRobots(
  isProductionHost: boolean,
  parentData: GuidesData | APIData
) {
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
