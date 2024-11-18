import { redirect } from "react-router";
import { getRepoTags } from "~/modules/gh-docs/.server";
import * as semver from "semver";
import type { Route } from "./+types/redirect-v7-doc";

export async function loader({ request }: Route.LoaderArgs) {
  let url = new URL(request.url);
  let [, s, ...rest] = url.pathname.split("/");

  let versions = await getRepoTags();
  versions.push("7.0.0");
  versions.push("7.0.1");
  let latest = semver.maxSatisfying(versions, `${s}.x`, {
    includePrerelease: false,
  });
  if (latest) {
    return redirect(`/${latest}/${rest.join("/")}${url.search}`);
  }

  return new Response("Not Found", { status: 404 });
}
