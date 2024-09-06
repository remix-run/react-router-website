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

export async function getHeaderData(lang: string, ref: string, splat?: string) {
  let branchesInMenu = ["main", "dev"];
  let [tags, branches] = await Promise.all([getRepoTags(), getRepoBranches()]);
  if (!tags || !branches)
    throw new Response("Cannot reach GitHub", { status: 503 });

  if (process.env.NODE_ENV === "development") {
    branches.push("local");
    branchesInMenu.push("local");
  }

  let betterUrl = validateParams(tags, branches, { lang, ref, "*": splat });
  if (betterUrl) throw redirect("/" + betterUrl);

  let releaseBranch = "main";
  let latestVersion = getLatestVersion(tags);
  let isLatest = ref === releaseBranch || ref === latestVersion;

  return {
    versions: [getLatestVersion(tags)],
    latestVersion,
    releaseBranch,
    branches: branchesInMenu,
    currentGitHubRef: ref,
    lang,
    isLatest,
  };
}
