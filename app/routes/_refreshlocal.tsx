import * as React from "react";

import {
  RouteComponent,
  ActionFunction,
  LoaderFunction,
  json,
  useRouteData,
} from "remix";
import { redirect } from "remix";
import { coerce } from "semver";

import { prisma } from "../db.server";
import { findMatchingEntries, getPackage } from "../utils/get-docs.server";
import { processDocs } from "../utils/process-docs.server";

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
  if (request.method !== "POST") {
    return redirect("/");
  }

  const ref = url.searchParams.get("ref");
  if (!ref) {
    return redirect("/sad");
  }

  const version = ref.replace(/^\/refs\/tags\//, "");

  try {
    // check if we have this release already
    let release = await prisma.version.findUnique({
      where: {
        fullVersionOrBranch: version,
      },
    });

    const stream = await getPackage(
      `${context.docs.owner}/${context.docs.repo}`,
      ref
    );

    const entries = await findMatchingEntries(stream, "/docs");
    const entriesWithProcessedMD = await processDocs(entries);

    let tag = coerce(ref);

    if (!tag) {
      throw new Error("tag provided wasn't valid semver");
    }

    let info =
      tag.major > 0
        ? `v${tag.major}`
        : tag.minor > 0
        ? `v0.${tag.minor}`
        : `v0.0.${tag.patch}`;

    // release exists already, so we need to update it
    if (release) {
      const result = await prisma.version.update({
        where: {
          fullVersionOrBranch: version,
        },
        data: {
          docs: {
            updateMany: entriesWithProcessedMD.map((entry) => ({
              data: {
                html: entry.html,
              },
              where: {
                fileName: entry.path,
              },
            })),
          },
        },
      });

      console.log(`Updated release for version: ${result.fullVersionOrBranch}`);
    } else {
      const result = await prisma.version.create({
        data: {
          fullVersionOrBranch: version,
          versionHeadOrBranch: info,
          docs: {
            create: entriesWithProcessedMD.map((entry) => ({
              fileName: entry.path,
              html: entry.html,
            })),
          },
        },
      });

      console.log(`Created release for version: ${result.fullVersionOrBranch}`);
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
