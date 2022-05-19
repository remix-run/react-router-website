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

let branchesCache =
  global.branchesCache ||
  (global.branchesCache = new LRUCache<string, string[]>({
    max: 100,
    ttl: 30000, // 5 minutes, so we can see new tags quickly
    fetchMethod: async (key) => {
      console.log("Fetching fresh tags", key);
      let [owner, repo] = key.split("/");
      const { data } = await octokit.rest.repos.listBranches({
        mediaType: { format: "json" },
        owner,
        repo,
        per_page: 100,
      });
      return data.map((branch: { name: string }) => branch.name);
    },
  }));
