import {
  RouteComponent,
  ActionFunction,
  LoaderFunction,
  json,
  useRouteData,
} from "remix";
import { redirect } from "remix";
import { prisma } from "../db.server";
import { findMatchingEntries, getPackage } from "../get-docs.server";

let loader: LoaderFunction = async () => {
  return json({ notFound: true }, { status: 404 });
};

let action: ActionFunction = async ({ request, context }) => {
  let token = request.headers.get("Authorization");
  // verify post request and the token matches
  if (request.method !== "POST" && token !== "some-token") {
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

    // let stream = await getPackage("remix-run/react-router", "/refs/tags/v6.0.0-beta.1");
    let stream = await getPackage("remix-run/react-router", "/refs/heads/dev");
    let entries = await findMatchingEntries(stream, "/docs");

    await Promise.all(
      entries.map((entry) =>
        prisma.doc.create({
          data: {
            html: entry.content ?? "",
            fileName: entry.path,
            versionHeadOrBranch: {
              connectOrCreate: {
                create: {
                  fullVersionOrBranch: "dev",
                  versionHeadOrBranch: "dev",
                },
                where: {
                  versionHeadOrBranch: "dev",
                },
              },
            },
          },
        })
      )
    );
    return redirect("/6.0.0-beta.1/faq");
  } catch (error) {
    console.error(error);
    return redirect("/sad");
  }

  return redirect("success");
};

const RefreshAllInstancesDocsPage: RouteComponent = () => {
  let data = useRouteData();

  if (data.notFound) {
    return <p>404</p>;
  }

  return null;
};

export default RefreshAllInstancesDocsPage;
export { action, loader };
