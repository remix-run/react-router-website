import { saveDocs } from "./utils/save-docs";
import { installGlobals } from "@remix-run/node";
import type { GitHubRelease } from "./@types/github";
import { satisfies } from "semver";

installGlobals();

async function seed() {
  let releasesPromise = await fetch(
    `https://api.github.com/repos/${process.env.REPO}/releases`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );

  let releases = (await releasesPromise.json()) as GitHubRelease[];

  const releasesToUse = releases.filter((release: any) => {
    return satisfies(release.tag_name, ">=6.0.0");
  });

  let promises: Promise<void>[] = [saveDocs("refs/heads/main", "")];

  for (let release of releasesToUse) {
    promises.push(saveDocs(`refs/tags/${release.tag_name}`, release.body));
  }

  await Promise.all(promises);
}

try {
  seed();
} catch (error) {
  throw error;
}
