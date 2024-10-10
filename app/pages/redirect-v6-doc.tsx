import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getRepoTags } from "~/modules/gh-docs/.server";
import * as semver from "semver";

export async function loader({ request }: LoaderFunctionArgs) {
  let url = new URL(request.url);
  let [, s, ...rest] = url.pathname.split("/");

  let versions = await getRepoTags();
  let latest = semver.maxSatisfying(versions, `${s}.x`, {
    includePrerelease: false,
  });
  if (latest) {
    return redirect(`/en/${latest}/${rest.join("/")}${url.search}`);
  }

  return new Response("Not Found", { status: 404 });
}
