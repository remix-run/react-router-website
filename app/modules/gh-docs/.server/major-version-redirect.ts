import { redirect, type MiddlewareFunction } from "react-router";
import * as semver from "semver";
import { getRepoTags } from "./index";

export const handleMajorVersionRedirects: MiddlewareFunction = async ({
  url,
}) => {
  let [, firstSegment, ...rest] = url.pathname.split("/");
  let major = firstSegment?.match(/^v(\d+)$/)?.[1];
  if (!major) return undefined;

  let tags = await getRepoTags();
  let latest = semver.maxSatisfying(tags, `${major}.x`, {
    includePrerelease: false,
  });

  if (!latest) return undefined;

  url = new URL(url);
  url.pathname = `/${[latest, ...rest].join("/")}`;
  throw redirect(url.toString());
};
