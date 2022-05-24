import { saveDocs } from "./utils/save-docs";
import { installGlobals } from "@remix-run/node";
import type { GitHubRelease } from "./@types/github";
import { rcompare, satisfies } from "semver";
import invariant from "tiny-invariant";

installGlobals();

async function seed() {
  // let releasesPromise = await fetch(
  //   `https://api.github.com/repos/${process.env.REPO}/releases`,
  //   {
  //     headers: {
  //       accept: "application/vnd.github.v3+json",
  //     },
  //   }
  // );

  let promises: Promise<void>[] = [
    saveDocs("refs/heads/main", ""),
    saveDocs("refs/heads/v6.3.0", "")
  ];

  await Promise.all(promises);
}

try {
  seed();
} catch (error) {
  throw error;
}
