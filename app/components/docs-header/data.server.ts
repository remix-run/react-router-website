import { redirect, type SerializeFrom } from "@remix-run/node";
import {
  getRepoBranches,
  getRepoTags,
  validateParams,
} from "~/modules/gh-docs/.server";
import { getLatestVersion } from "~/modules/gh-docs/.server/tags";

export type HeaderData = Awaited<
  SerializeFrom<ReturnType<typeof getHeaderData>>
>;

export async function getHeaderData(
  lang: string,
  ref?: string,
  splat?: string
) {
  let githubRef = ref || "main";
  let branchesInMenu = ["main", "dev"];
  let [tags, branches] = await Promise.all([getRepoTags(), getRepoBranches()]);
  if (!tags || !branches)
    throw new Response("Cannot reach GitHub", { status: 503 });

  if (process.env.NODE_ENV === "development") {
    branches.push("local");
    branchesInMenu.push("local");
  }

  let betterUrl = validateParams(tags, branches, {
    lang,
    ref: githubRef,
    "*": splat,
  });
  if (betterUrl) throw redirect("/" + betterUrl);

  // TODO: we're not really using `releaseBranch` consistently, so maybe just
  // ditch it, we know "main" is the release branch, don't need it force
  // plumbing this value through everywhere it's needed
  let releaseBranch = "main";
  let latestVersion = getLatestVersion(tags);
  let isLatest = githubRef === releaseBranch || githubRef === latestVersion;

  let isV7 =
    ["dev", "nightly", "release-next", "local"].includes(githubRef) ||
    (latestVersion.startsWith("7.") && githubRef === "main");

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
