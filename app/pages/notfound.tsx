import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { type MetaFunction } from "@remix-run/react";
import { Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import * as semver from "semver";
import { CACHE_CONTROL } from "~/http";
import { getRepoTags } from "~/modules/gh-docs/.server";

/**
 * This let's us have `v6/*` or `v7/*` URLs in changelogs and console warnings
 * so we can link people to the latest doc of the version they're using.
 */
async function maybeRedirectToDoc(pathname: string) {
  let [, s, ...rest] = pathname.split("/");
  let version = s.replace(/^v/, "");
  let regex = /^\d+(\.\d+)?(\.\d+)?$/;
  if (regex.test(version)) {
    let versions = await getRepoTags();
    let latest = semver.maxSatisfying(versions, `${s}.x`, {
      includePrerelease: false,
    });
    if (latest) {
      throw redirect(`/en/${latest}/${rest.join("/")}`);
    }
  }
}

export let loader = async ({ request }: LoaderFunctionArgs) => {
  let url = new URL(request.url);
  await maybeRedirectToDoc(url.pathname);
  // TODO: use `data` or whatever we end up with in single fetch instead of
  // throwing here
  throw new Response("Not Found", { status: 404 });
};

export const meta: MetaFunction = () => {
  let robots = "noindex, nofollow";
  return [
    { title: "Not Found | React Router" },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
  ];
};

export function headers() {
  return { "Cache-Control": CACHE_CONTROL.none };
}

export default function Catchall() {
  return null;
}

export function ErrorBoundary() {
  let error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-bold">{error.status}</div>
        <div>{error.statusText || "Not Found"}</div>
        <Link to="/" className="mt-8 underline">
          Go Home
        </Link>
      </div>
    );
  }

  throw error;
}
