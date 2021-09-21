import * as React from "react";

import { RouteComponent, ActionFunction } from "remix";
import { redirect } from "remix";
import { satisfies } from "semver";

import { saveDocs } from "~/utils/save-docs";

let action: ActionFunction = async ({ request, context }) => {
  // verify post request and the token matches
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.AUTH_TOKEN
  ) {
    return redirect("/");
  }

  const url = new URL(request.url);
  const ref = url.searchParams.get("ref");

  try {
    // generate docs for specified ref
    // otherwise generate docs for all releases
    if (ref) {
      await saveDocs(ref, context.docs);
    } else {
      const releasesPromise = await fetch(
        `https://api.github.com/repos/${context.docs.owner}/${context.docs.repo}/releases`
      );

      const releases = await releasesPromise.json();

      const releasesToUse = releases.filter((release: any) => {
        return satisfies(release.tag_name, context.docs.versions);
      });

      await Promise.all(
        releasesToUse.map((release: any) =>
          saveDocs(`/refs/tags/${release.tag_name}`, context.docs)
        )
      );
    }

    return redirect(request.url);
  } catch (error) {
    console.error(error);
    return redirect(request.url);
  }
};

const RefreshInstance: RouteComponent = () => {
  return <p>404</p>;
};

export default RefreshInstance;
export { action };
