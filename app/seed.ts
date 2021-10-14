import { satisfies } from "semver";
import { GitHubRelease } from "./@types/github";
import { saveDocs } from "./utils/save-docs";
import { installGlobals } from "@remix-run/node";
installGlobals();

// FIXME: this is duplicated from `getLoadContext`, should figure out how to not
// do that and figure out what we really even need and where. Might not even
// need this in load context at all.
let context = {
  docs: {
    owner: "remix-run",
    repo: "react-router",
    remotePath: "docs",
    localPath: "../react-router/docs",
    localLangDir: "_i18n",
    versions: ">=6.0.0-beta.6",
  },
};

async function seed() {
  // FIXME: remove this, using the docs branch until we track v6 head
  await saveDocs("/refs/heads/docs", context.docs, "");

  // the rest
  const releasesPromise = await fetch(
    `https://api.github.com/repos/${context.docs.owner}/${context.docs.repo}/releases`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );

  const releases = (await releasesPromise.json()) as GitHubRelease[];

  const releasesToUse = releases.filter((release) => {
    return satisfies(release.tag_name, context.docs.versions);
  });

  await Promise.all(
    releasesToUse.map((release: any) =>
      saveDocs(`/refs/tags/${release.tag_name}`, context.docs, release.body)
    )
  );
}

try {
  seed();
} catch (e) {
  throw e;
}
