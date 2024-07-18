import { Octokit } from "octokit";

const GH_TOKEN = process.env.GH_TOKEN!;

if (process.env.NODE_ENV !== "test" && !GH_TOKEN) {
  throw new Error("Missing GH_TOKEN");
}

const octokit = new Octokit();

export { octokit };
