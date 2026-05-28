import {
  getLatestV6Version,
  getLatestVersion,
} from "~/modules/gh-docs/.server/tags";

export type HeaderData = Awaited<ReturnType<typeof getHeaderData>>;

export function getHeaderData(
  lang: string,
  ref: string,
  tags: string[],
  refParam?: string,
) {
  let githubRef = ref;

  let branchesInMenu = [
    "main",
    ...(process.env.NODE_ENV === "development" ? ["local"] : []),
  ];

  let latestVersion = getLatestVersion(tags);
  let latestV6Version = getLatestV6Version(tags);
  let isLatest = githubRef === latestVersion;

  let hasAPIDocs =
    // they're on main (the unreleased docs at /main/*) or "local"
    branchesInMenu.includes(githubRef) ||
    // they're looking at a v7 tag (or the default latest tag, if v7)
    githubRef.startsWith("7.");

  // TODO: make this smarter before v8
  let apiDocsRef = "v7";

  // Set the version for docsearch to use as a facet filter so that the search
  // results are context aware
  // This value is also used for determining whether the docs should have
  // robots="index,follow"
  let docSearchVersion: "v7" | "v6" | null = null;
  if (githubRef === "main" || githubRef.startsWith("7.")) {
    docSearchVersion = "v7";
  } else if (refParam === latestV6Version) {
    docSearchVersion = "v6";
  }

  return {
    versions: [latestVersion, latestV6Version],
    latestVersion,
    branches: branchesInMenu,
    currentGitHubRef: githubRef,
    lang,
    isLatest,
    hasAPIDocs,
    refParam,
    ref,
    apiDocsRef,
    docSearchVersion,
  } as const;
}
