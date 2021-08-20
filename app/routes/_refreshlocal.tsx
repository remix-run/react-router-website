import * as React from "react";

import {
  RouteComponent,
  ActionFunction,
  LoaderFunction,
  json,
  useRouteData,
} from "remix";
import { redirect } from "remix";
import { satisfies } from "semver";

import { saveDocs } from "../utils/save-docs";

let loader: LoaderFunction = async () => {
  // return json({ notFound: true }, { status: 404 });
  return json({});
};

let action: ActionFunction = async ({ request, context }) => {
  const url = new URL(request.url);

  if (process.env.NODE_ENV === "development") {
    if (!url.port) url.port = "3000";
  }

  let token = request.headers.get("Authorization");
  // verify post request and the token matches
  if (
    request.method !== "POST" ||
    (process.env.NODE_ENV !== "development" && token !== process.env.AUTH_TOKEN)
  ) {
    return redirect("/");
  }

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
        return satisfies(release.tag_name, context.docs.versions, {
          includePrerelease: true,
        });
      });

      await Promise.all(
        releasesToUse.map((release: any) =>
          saveDocs(`/refs/tags/${release.tag_name}`, context.docs)
        )
      );
    }

    return redirect(url.toString());
  } catch (error) {
    console.error(error);
    return redirect(url.toString());
  }
};

const RefreshAllInstancesDocsPage: RouteComponent = () => {
  let data = useRouteData();

  if (data.notFound) {
    return <p>404</p>;
  }

  return (
    <form method="post">
      <button type="submit">Refresh!</button>
    </form>
  );
};

export default RefreshAllInstancesDocsPage;
export { action, loader };
