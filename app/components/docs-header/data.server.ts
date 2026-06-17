import { getLatestMajorVersions } from "~/modules/gh-docs/.server/tags";
import semver from "semver";

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

  let versions = getLatestMajorVersions(tags);
  let latestVersion = versions[0];
  let latestMajor = semver.parse(latestVersion)?.major;

  if (!latestMajor) {
    throw new Error(
      `Latest version ${latestVersion} is not a valid semver version`,
    );
  }

  let githubRefMajor = semver.parse(githubRef)?.major;
  let isLatest = githubRef === latestVersion;

  let hasAPIDocs =
    // they're on main (the unreleased docs at /main/*) or "local"
    branchesInMenu.includes(githubRef) ||
    // they're looking at a stable version with API docs
    (githubRefMajor !== undefined && githubRefMajor >= 7);

  let apiDocsRef =
    githubRefMajor !== undefined && githubRefMajor >= 7
      ? `v${githubRefMajor}`
      : branchesInMenu.includes(githubRef)
        ? `v${latestMajor}`
        : null;

  // Search engines should only crawl root URLs, not versioned URLs.
  let shouldIndexDocPage = refParam === undefined;

  // Set the version for docsearch to use as a facet filter so that the search
  // results are context aware.
  let docSearchVersion =
    githubRefMajor !== undefined ? `v${githubRefMajor}` : `v${latestMajor}`;

  return {
    versions,
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
    shouldIndexDocPage,
  } as const;
}
