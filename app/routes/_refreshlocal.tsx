import { RouteComponent, ActionFunction, json } from "remix";

import { satisfies } from "semver";

import { GitHubRelease } from "~/@types/github";

import { saveDocs } from "~/utils/save-docs";

let action: ActionFunction = async ({ request, context }) => {
  const url = new URL(request.url);

  if (request.method !== "POST") {
    throw new Response("", { status: 405 });
  }

  if (
    // verify post request and the token matches or doing it locally
    !(
      request.headers.get("Authorization") === process.env.AUTH_TOKEN ||
      url.hostname === "localhost"
    )
  ) {
    throw new Response("", { status: 401 });
  }

  const ref = url.searchParams.get("ref");

  console.log(`Refreshing docs for ${url.hostname} for ref ${ref}`);

  try {
    // generate docs for specified ref
    // otherwise generate docs for all releases
    if (ref) {
      let tag = ref.replace(/^refs\/tags\//, "");

      const releasePromise = await fetch(
        `https://api.github.com/repos/${process.env.REPO}/releases/tags/${tag}`,
        {
          headers: {
            accept: "application/vnd.github.v3+json",
          },
        }
      );

      const release = (await releasePromise.json()) as GitHubRelease;

      await saveDocs(ref, release.body);
    } else {
      const releasesPromise = await fetch(
        `https://api.github.com/repos/${process.env.REPO}/releases`,
        {
          headers: {
            accept: "application/vnd.github.v3+json",
          },
        }
      );

      const releases = (await releasesPromise.json()) as GitHubRelease[];

      const releasesToUse = releases.filter((release: any) => {
        return satisfies(release.tag_name, ">=6.0.0");
      });

      await Promise.all(
        releasesToUse.map((release: any) =>
          saveDocs(`refs/tags/${release.tag_name}`, release.body)
        )
      );
    }

    return json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ ok: true }, { status: 500 });
  }
};

const RefreshInstance: RouteComponent = () => {
  return null;
};

export default RefreshInstance;
export { action };
