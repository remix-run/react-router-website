import * as React from "react";

import { RouteComponent, ActionFunction, Link, json } from "remix";
import { redirect } from "remix";
import { satisfies } from "semver";

import { GitHubRelease } from "~/@types/github";
import { Button } from "~/components/button";
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

  try {
    // generate docs for specified ref
    // otherwise generate docs for all releases
    if (ref) {
      let tag = ref.replace(/^\/refs\/tags\//, "");

      const releasePromise = await fetch(
        `https://api.github.com/repos/${context.docs.owner}/${context.docs.repo}/releases/tags/${tag}`,
        {
          headers: {
            accept: "application/vnd.github.v3+json",
          },
        }
      );

      const release = (await releasePromise.json()) as GitHubRelease;

      await saveDocs(ref, context.docs, release.body);
    } else {
      const releasesPromise = await fetch(
        `https://api.github.com/repos/${context.docs.owner}/${context.docs.repo}/releases`,
        {
          headers: {
            accept: "application/vnd.github.v3+json",
          },
        }
      );

      const releases = (await releasesPromise.json()) as GitHubRelease[];

      const releasesToUse = releases.filter((release: any) => {
        return satisfies(release.tag_name, context.docs.versions);
      });

      await Promise.all(
        releasesToUse.map((release: any) =>
          saveDocs(`/refs/tags/${release.tag_name}`, context.docs, release.body)
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
  let [ref, setRef] = React.useState("");
  let action = ref.length ? `?${ref}` : "";

  return (
    <form method="post" action={action} className="m-10">
      <p className="my-4">
        This will only work if you're on localhost. You probably want to run{" "}
        <code>npm run db:reset</code> first.
      </p>
      <p className="my-4">
        You can do a specific ref by{" "}
        <Link to="/_refreshlocal?ref=/refs/heads/docs">
          adding it to the URL
        </Link>
        .
      </p>
      <Button type="submit">Seed Database</Button>
    </form>
  );
};

export default RefreshInstance;
export { action };
