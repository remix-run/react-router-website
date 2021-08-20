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

import { GitHubReleaseAPIResponse } from "../@types/github";
import { prisma } from "../db.server";
import { findMatchingEntries, getPackage } from "../utils/get-docs.server";

let loader: LoaderFunction = async () => {
  // return json({ notFound: true }, { status: 404 });
  return json({});
};

let action: ActionFunction = async ({ request, context }) => {
  let token = request.headers.get("Authorization");
  // verify post request and the token matches
  if (request.method !== "POST") {
    return redirect("/");
  }

  try {
    /**
     * 1. download github data
     ** 1.a put versions/branches in db
     ** 1.b { id: versionHeadOrBranch, ref: fullVersionOrBranch }
     ** 1.c special case the latest version to use "master" branch
     ** 1.d find semantic "head" like v1 for v1.2.2
     * 2. fetch tarball for versions not in database
     ** 2.a use public tarball url
     * 3. unzip tarball
     ** 3.a parse frontmatter
     ** 3.b process markdown with ryan's module
     * 4. store in db
     ** 4.a { id: filename + versionHeadOrBranch, filepath, ref, md, html, frontmatter }
     */

    const releasesPromise = await fetch(
      `https://api.github.com/repos/remix-run/react-router/releases`
    );

    const releases = (await releasesPromise.json()) as GitHubReleaseAPIResponse;

    const versionsWeHave = await prisma.version.findMany({
      select: { fullVersionOrBranch: true },
    });

    const justVersion = versionsWeHave.map((v) => v.fullVersionOrBranch);

    const versionsWeNeed = releases.filter(
      (x) => !justVersion.includes(x.tag_name)
    );

    console.log(versionsWeNeed.map((v) => v.tag_name));

    let streams: {
      stream: any;
      version: string;
    }[] = await Promise.all(
      versionsWeNeed.map(async (version) => {
        const stream = await getPackage(
          "remix-run/react-router",
          `/refs/tags/${version.tag_name}`
        );

        return {
          stream,
          version: version.tag_name,
        };
      })
    );

    let allEntries = await Promise.all(
      streams.map(async (entry) => {
        const entries = await findMatchingEntries(entry.stream, "/docs");
        return { entries, version: entry.version };
      })
    );

    let versionPromises = [];
    let docPromises = [];

    for (const entries of allEntries) {
      let tag = coerce(entries.version);
      if (!tag) continue;
      let info =
        tag.major > 0
          ? `v${tag.major}`
          : tag.minor > 0
          ? `v0.${tag.minor}`
          : `v0.0.${tag.patch}`;

      versionPromises.push(
        prisma.version.create({
          data: {
            fullVersionOrBranch: entries.version,
            versionHeadOrBranch: info,
          },
        })
      );

      docPromises.push(
        entries.entries.map(async (entry) => {
          return prisma.doc.create({
            data: {
              fileName: entry.path,
              html: entry.content ?? "wtf",
              fullVersionOrBranch: {
                connectOrCreate: {
                  create: {
                    fullVersionOrBranch: entries.version,
                    versionHeadOrBranch: info,
                  },
                  where: {
                    fullVersionOrBranch: entries.version,
                  },
                },
              },
            },
          });
        })
      );
    }

    const versionResults = await Promise.allSettled(versionPromises);
    const docResults = await Promise.allSettled(docPromises);

    for (const result of versionResults) {
      console.log(result);
    }
    for (const result of docResults) {
      console.log(result);
    }

    // if (versionsWeNeed.length > 0) {
    //   let versionPromises: Promise<any>[] = [];

    //   for (const version of versionsWeNeed) {
    //     let tag = coerce(version.tag_name);
    //     if (!tag) continue;

    //     let info =
    //       tag.major > 0
    //         ? `v${tag.major}`
    //         : tag.minor > 0
    //         ? `v0.${tag.minor}`
    //         : `v0.0.${tag.patch}`;

    //     versionPromises.push(
    //       prisma.version.create({
    //         data: {
    //           fullVersionOrBranch: version.tag_name,
    //           versionHeadOrBranch: info,
    //         },
    //       })
    //     );
    //   }
    // }

    return redirect("/_refreshlocal");
  } catch (error) {
    console.error(error);
    return redirect("/_refreshlocal");
  }
};

const RefreshAllInstancesDocsPage = () => {
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
