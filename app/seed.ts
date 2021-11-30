import { saveDocs } from "./utils/save-docs";
import { installGlobals } from "@remix-run/node";
import type { GitHubRelease } from "./@types/github";
import { rcompare, satisfies } from "semver";
import invariant from "tiny-invariant";

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

  let sorted = releases.sort((a, b) => rcompare(a.tag_name, b.tag_name));

  let latest = sorted.at(0);

  invariant(latest, "Could not determine latest release");

  const releasesToUse = releases.filter((release) => {
    return satisfies(release.tag_name, `>=${latest!.tag_name}`);
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
