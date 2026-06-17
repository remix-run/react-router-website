import type { HeaderData } from "~/components/docs-header/data.server";
import type { loader as docsLoader } from "~/pages/docs-layout";

type DocsData = Awaited<ReturnType<typeof docsLoader>>;

export function getDocTitle(api: DocsData, title: string) {
  let { isLatest, branches, currentGitHubRef } = api.header;

  let titleRef = isLatest
    ? ""
    : branches.includes(currentGitHubRef)
      ? `(${currentGitHubRef} branch)`
      : currentGitHubRef.startsWith("v")
        ? currentGitHubRef
        : `v${currentGitHubRef}`;

  return `${title} ${titleRef}`;
}

export function getSearchMetaTags(
  isProductionHost: boolean,
  docSearchVersion: HeaderData["docSearchVersion"],
  shouldIndexDocPage: HeaderData["shouldIndexDocPage"],
) {
  let robots = "noindex,nofollow";
  if (isProductionHost && shouldIndexDocPage) {
    robots = "index,follow";
  }

  let tags = [
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
  ];

  if (docSearchVersion) {
    tags.push(
      { name: "docsearch:language", content: "en" },
      { name: "docsearch:version", content: docSearchVersion },
    );
  }

  return tags;
}
