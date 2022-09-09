import LRUCache from "lru-cache";
import { octokit } from "./github";

/**
 * Fetches the repo tags
 */
export async function getBranches(repo: string) {
  return branchesCache.fetch(repo);
}

declare global {
  var branchesCache: LRUCache<string, string[]>;
}

global.branchesCache ??= new LRUCache<string, string[]>({
  // let branchesCache = new LRUCache<string, string[]>({
  max: 3,
  ttl: 1000 * 60 * 5, // 5 minutes, so we can see new tags quickly
  allowStale: true,
  noDeleteOnFetchRejection: true,
  fetchMethod: async (key) => {
    console.log("Fetching fresh branches", key);
    let [owner, repo] = key.split("/");
    const { data } = await octokit.rest.repos.listBranches({
      mediaType: { format: "json" },
      owner,
      repo,
      per_page: 100,
    });
    return data.map((branch: { name: string }) => branch.name);
  },
});
