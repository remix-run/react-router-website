import { Octokit } from "octokit";

const GH_TOKEN = process.env.GH_TOKEN!;

const env = process.env.NODE_ENV;

if (env !== "test" && !GH_TOKEN) {
  if (env === "production") {
    throw new Error("No GH_TOKEN provided");
  }
  console.warn(
    "\nNo GH_TOKEN provided. You can increase the rate limit from 60/hr to 1000/hr by adding a token to your .env file.\n"
  );
}

const octokit = new Octokit({ auth: GH_TOKEN });

export { octokit };
