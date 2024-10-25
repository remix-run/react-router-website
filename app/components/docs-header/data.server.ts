import { type SerializeFrom } from "@remix-run/node";
import { getRepoBranches, getRepoTags } from "~/modules/gh-docs/.server";
import { getLatestVersion } from "~/modules/gh-docs/.server/tags";

export type HeaderData = Awaited<
  SerializeFrom<ReturnType<typeof getHeaderData>>
>;

export async function getHeaderData(lang: string, ref?: string) {
  let githubRef = ref || "main";
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

  let isV7 =
    // We've shipped v7 and they're on the main branch (which doesn't show in
    // the URL anymore)
    (githubRef === "main" && latestVersion.startsWith("7.")) ||
    // they're looking at a v7 tag
    githubRef.startsWith("7.") ||
    // they're looking at the next release
    ["dev", "nightly", "release-next", "local"].includes(githubRef);

  return {
    // TODO: we'll need to add 7 in here when we're ready to start showing it
    versions: [getLatestVersion(tags)],
    latestVersion,
    releaseBranch,
    branches: branchesInMenu,
    currentGitHubRef: githubRef,
    lang,
    isLatest,
    isV7,
    refParam: ref,
  };
}
