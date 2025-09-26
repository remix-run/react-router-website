import { getRepoBranches, getRepoTags } from "~/modules/gh-docs/.server";
import {
  getLatestV6Version,
  getLatestVersion,
} from "~/modules/gh-docs/.server/tags";

export type HeaderData = Awaited<ReturnType<typeof getHeaderData>>;

export async function getHeaderData(
  lang: string,
  ref: string,
  refParam?: string,
) {
  let githubRef = ref;
  let branchesInMenu = ["main", "dev"];
  let [tags, branches] = await Promise.all([getRepoTags(), getRepoBranches()]);
  if (!tags || !branches)
    throw new Response("Cannot reach GitHub", { status: 503 });

  if (process.env.NODE_ENV === "development") {
    branches.push("local");
    branchesInMenu.push("local");
  }

  // TODO: we're not really using `releaseBranch` consistently, so maybe just
  // ditch it, we know "main" is the release branch, don't need it force
  // plumbing this value through everywhere it's needed
  let releaseBranch = "main";
  let latestVersion = getLatestVersion(tags);
  let isLatest = githubRef === releaseBranch || githubRef === latestVersion;

  let hasAPIDocs =
    // We've shipped v7 and they're on the main branch (which doesn't show in
    // the URL anymore)
    (githubRef === "main" && latestVersion.startsWith("7.")) ||
    // they're looking at a v7 tag
    githubRef.startsWith("7.") ||
    // they're looking at the next release
    ["dev", "nightly", "release-next", "local"].includes(githubRef);

  // TODO: make this smarter before v8
  let apiDocsRef = "v7";

  let latestV6Version = getLatestV6Version(tags);

  // Set the version for docsearch to use as a facet filter so that the search
  // results are context aware
  // This value is also used for determining whether the docs should have
  // robots="index,follow"
  let docSearchVersion: "v7" | "v6" | null = null;
  if (githubRef === "main" && latestVersion.startsWith("7.")) {
    docSearchVersion = "v7";
  } else if (refParam === latestV6Version) {
    docSearchVersion = "v6";
  }

  return {
    versions: [latestVersion, latestV6Version],
    latestVersion,
    releaseBranch,
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
