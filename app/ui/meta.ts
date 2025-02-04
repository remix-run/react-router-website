import type { HeaderData } from "~/components/docs-header/data.server";
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

export function getRobots(
  isProductionHost: boolean,
  docSearchVersion: HeaderData["docSearchVersion"],
) {
  let robots = "noindex,nofollow";
  if (isProductionHost && docSearchVersion !== null) {
    robots = "index,follow";
  }

  return [
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
  ];
}

export function getDocsSearch(
  docSearchVersion: HeaderData["docSearchVersion"],
) {
  if (!docSearchVersion) return [];
  return [
    { name: "docsearch:language", content: "en" },
    { name: "docsearch:version", content: docSearchVersion },
  ];
}
