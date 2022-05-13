import LRUCache from "lru-cache";
import { octokit } from "./github";

/**
 * Fetches the repo tags
 */
export async function getTags(repo: string) {
  return tagsCache.fetch(repo);
}

declare global {
  var tagsCache: LRUCache<string, string[]>;
}

let tagsCache =
  // we need a better hot reload story here
  global.tagsCache ||
  (global.tagsCache = new LRUCache<string, string[]>({
    max: 100,
    ttl: 30000, // 5 minutes, so we can see new tags quickly
    fetchMethod: async (key) => {
      console.log("Fetching fresh tags", key);
      let [owner, repo] = key.split("/");
      const { data } = await octokit.rest.repos.listTags({
        mediaType: { format: "json" },
        owner,
        repo,
        per_page: 100,
      });
      return data.map((tag: { name: string }) => tag.name);
    },
  }));
