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

    if (release) {
      return redirect("/sad");
    }

    const stream = await getPackage(
      `${context.docs.owner}/${context.docs.repo}`,
      ref
    );

    const entries = await findMatchingEntries(stream, "/docs");

    let tag = coerce(ref);

    if (!tag) {
      throw new Error("tag provided wasnt valid semver");
    }

    let info =
      tag.major > 0
        ? `v${tag.major}`
        : tag.minor > 0
        ? `v0.${tag.minor}`
        : `v0.0.${tag.patch}`;

    const results = await Promise.allSettled(
      entries.map((entry) =>
        prisma.doc.create({
          data: {
            fileName: entry.path,
            html: entry.content ?? "wtf",
            fullVersionOrBranch: {
              connectOrCreate: {
                create: {
                  fullVersionOrBranch: version,
                  versionHeadOrBranch: info,
                },
                where: {
                  fullVersionOrBranch: version,
                },
              },
            },
          },
        })
      )
    );

    for (const result of results) {
      if (result.status === "fulfilled") console.log(result.status);
      else console.log(result);
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
