import LRUCache from "lru-cache";
import { octokit } from "../gh-docs/github";

export interface Stats {
  label: string;
  svgId: string;
  count: number;
}

interface StatCounts {
  npmDownloads: number;
  githubContributors: number;
  githubStars: number;
  githubDependents: number;
}

declare global {
  var statCountsCache: LRUCache<string, StatCounts>;
}

global.statCountsCache ??= new LRUCache<string, StatCounts>({
  // let statCountsCache = new LRUCache<string, StatCounts>({
  max: 3,
  // ttl: process.env.NO_CACHE ? 1 : 1000 * 60 * 60, // 1 hour
  ttl: 1000 * 60 * 60, // 1 hour
  allowStale: true,
  noDeleteOnFetchRejection: true,
  fetchMethod: async (key) => {
    console.log("Fetching fresh stats");
    let [npmDownloads, githubContributors, githubStars, githubDependents] =
      await Promise.all([
        fetchNpmDownloads(),
        fetchGithubContributors(),
        fetchGithubStars(),
        fetchGithubDependents(),
      ]);
    return {
      npmDownloads,
      githubContributors,
      githubStars,
      githubDependents,
    };
  },
});

export async function getStats(): Promise<Stats[] | undefined> {
  let cacheKey = "ONE_STATS_KEY_TO_RULE_THEM_ALL";
  let statCounts = await statCountsCache.fetch(cacheKey);

  return statCounts
    ? [
        {
          count: statCounts.npmDownloads,
          label: "Downloads on npm",
          svgId: "stat-download",
        },
        {
          count: statCounts.githubContributors,
          label: "Contributors on GitHub",
          svgId: "stat-users",
        },
        {
          count: statCounts.githubStars,
          label: "Stars on GitHub",
          svgId: "stat-star",
        },
        {
          count: statCounts.githubDependents,
          label: "Dependents on GitHub",
          svgId: "stat-box",
        },
      ]
    : undefined;
}

/**
 * Haven't figured out a good way to get this yet, so it's hard-coded from:
 * https://github.com/remix-run/react-router/network/dependents?package_id=UGFja2FnZS00OTM0MDEzMDg%3D
 * @returns {Number}
 */
async function fetchGithubDependents() {
  return 3597612;
}

/**
 * Fetch public stats from npm
 * https://github.com/npm/registry/blob/master/docs/download-counts.md
 *
 * @returns {Number}
 */
async function fetchNpmDownloads() {
  try {
    // You can only get stats for 18 months at a time
    // But doing date math is hard, so we'll just do 1 year at a time
    // Earliest date for data is 2015-01-10, so we start there
    // Hacky? Sure, but it doesn't break until like 2036 so we're good
    const currentYear = new Date().getFullYear();
    let urls = [];
    let year = 2015;
    let day = 10;
    while (year <= currentYear) {
      urls.push(
        `https://api.npmjs.org/downloads/point/${year}-01-${day}:${
          year + 1
        }-01-${day}/react-router`
      );
      year++;
      day++;
    }
    const queryData = await Promise.all(
      urls.map((url) => fetch(url).then((res) => res.json()))
    );
    const allTimeDownloads = queryData.reduce(
      (acc, { downloads = 0 }) => acc + downloads,
      0
    );
    return allTimeDownloads;
  } catch (e) {
    // If this fails for some reason, just return a hard-coded value fetched
    // on June 17, 2022
    console.error(
      "Failed to fetch stats for npm downloads. Falling back to a hard-coded value",
      e
    );
    return 844617220;
  }
}

/**
 * Fetch the number of contributors from a header in the GitHub API
 * https://stackoverflow.com/questions/44347339/github-api-how-efficiently-get-the-total-contributors-amount-per-repository/60458265
 * @returns {Number}
 */
async function fetchGithubContributors() {
  try {
    const { headers } = await octokit.rest.repos.listContributors({
      owner: "remix-run",
      repo: "react-router",
      anon: "true",
      per_page: 1,
    });
    const link = headers.link || "";
    const matches = link.match(/rel="next".*&page=(\d*)/);
    if (!(matches && matches[1])) {
      throw Error("Unable to find the number of contributors using a regex.");
    }
    return Number(matches[1]);
  } catch (e) {
    console.error(
      "Failed to fetch stats for GitHub contributors. Falling back to a hard-coded value",
      e
    );
    // Return a hard-coded value retrieved manually on Jun 15, 2022
    return 737;
  }
}

/**
 * Fetch the number of stars from Github
 * @returns {Number}
 */
async function fetchGithubStars() {
  try {
    const {
      data: { stargazers_count },
    } = await octokit.rest.repos.get({
      owner: "remix-run",
      repo: "react-router",
    });
    return stargazers_count;
  } catch (e) {
    console.log(
      "Failed to fetch stats for GitHub stars. Falling back to a hard-coded value",
      e
    );
    // Return hard-coded value retrieved Jun 15, 2022
    return 47245;
  }
}
