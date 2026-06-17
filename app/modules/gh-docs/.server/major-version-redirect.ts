import { redirect, type MiddlewareFunction } from "react-router";
import * as semver from "semver";
import { getRepoTags } from "./index";

export const handleMajorVersionRedirects: MiddlewareFunction = async ({
  url,
}) => {
  let match = url.pathname.match(/^\/v(\d+)(?:\/(.*))?$/);
  if (!match) return undefined;

  let [, major, rest = ""] = match;
  let tags = await getRepoTags();
  let latest = semver.maxSatisfying(tags, `${major}.x`, {
    includePrerelease: false,
  });

  if (!latest) return undefined;

  url = new URL(url);
  url.pathname = `/${latest}${rest ? `/${rest}` : ""}`;
  throw redirect(url.toString());
};
