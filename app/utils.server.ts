import invariant from "tiny-invariant";
import path from "path";
import * as semver from "semver";

import { prismaRead as prisma } from "~/db.server";
import { Prisma } from "@prisma/client";

export interface MenuNode {
  title: string;
  slug: string;
  hasContent: boolean;
  order: number | null;
  children: MenuNode[];
}

export type Config = {
  /**
   * The owner of the repo containing the docs
   */
  owner: string;
  /**
   * The repo name containing the docs.
   */
  repo: string;
  /**
   * The path of the docs in the repo on GitHub
   */
  remotePath: string;
  /**
   * Local path of files during development
   */
  localPath: string;
  /**
   * Directory name of where to find localized docs during development
   */
  localLangDir: string;
  /**
   * Semver range of versions you want to show up in the versions dropdown
   */
  versions: string;
};

export async function getMenu(
  versionOrBranchParam: string,
  lang: string
): Promise<MenuNode[]> {
  let ref = await getLatestRefFromParam(versionOrBranchParam);

  let docs = await prisma.doc.findMany({
    where: {
      lang,
      githubRef: { ref },
    },
    select: {
      filePath: true,
      title: true,
      order: true,
      hidden: true,
      hasContent: true,
    },
  });

  let sluggedDocs = [];

  // first pass we figure out the slugs
  for (let doc of docs) {
    if (doc.hidden) continue;
    let slug = doc.filePath.replace(/\.md$/, "");
    let isIndex = slug.endsWith("/index");
    if (isIndex) {
      slug = slug.slice(0, -6);
    }
    sluggedDocs.push({ slug, doc });
  }

  // sort so we can process parents before children
  sluggedDocs.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));

  let tree: MenuNode[] = [];
  let map = new Map<string, MenuNode>();

  // second pass, we construct the hierarchy
  for (let { slug, doc } of sluggedDocs) {
    let node: MenuNode = {
      slug,
      title: doc.title,
      hasContent: doc.hasContent,
      order: doc.order,
      children: [],
    };

    let parentSlug = slug.substring(0, slug.lastIndexOf("/"));
    map.set(slug, node);
    if (parentSlug) {
      let parent = map.get(parentSlug);
      invariant(parent, `Expected ${parentSlug} in tree`);
      parent.children.push(node);
    } else {
      tree.push(node);
    }
  }

  return tree;
}

const slimDoc = Prisma.validator<Prisma.DocArgs>()({
  select: {
    html: true,
    title: true,
    description: true,
    toc: true,
  },
});

export type SlimDoc = Prisma.DocGetPayload<typeof slimDoc>;

export async function getDoc(
  slug: string,
  paramRef: string,
  lang: string
): Promise<SlimDoc> {
  let ref = await getLatestRefFromParam(paramRef);

  let doc: SlimDoc;
  let slugs = [path.join("/", `${slug}.md`), path.join("/", slug, "index.md")];
  try {
    doc = await prisma.doc.findFirst({
      select: slimDoc.select,
      where: {
        OR: [
          {
            githubRef: { ref },
            lang,
            filePath: {
              in: slugs,
            },
          },
          {
            githubRef: { ref },
            lang: "en",
            filePath: {
              in: slugs,
            },
          },
        ],
      },
      rejectOnNotFound: true,
    });
  } catch (error: unknown) {
    console.error(error);
    console.error(
      `Failed to find doc for the following slugs: ${slugs.join(
        ", "
      )} for ${ref}`
    );

    throw new Response("No Doc Found", { status: 404 });
  }

  return doc;
}

export async function getLatestRefFromParam(refParam: string): Promise<string> {
  let version = semver.valid(refParam);

  let ref = version ? `refs/tags/v${version}` : `refs/heads/${refParam}`;

  if (!version) {
    return ref;
  }

  let refs = await prisma.gitHubRef.findMany({
    select: { ref: true },
    where: {
      ref: {
        startsWith: "refs/tags/",
      },
    },
  });

  let tags = refs
    .filter((ref) => semver.valid(ref.ref.replace(/^refs\/tags\//, "")))
    .map((ref) => ref.ref.replace(/^refs\/tags\//, ""));

  // TODO: remove includePrerelease after v6 release (or before v7 🤪)
  let sorted = tags.sort((a, b) =>
    semver.rcompare(a, b, { includePrerelease: true })
  );

  let latest = sorted.at(0);

  invariant(latest, "No tag found");

  // if the version requested is the latest we have, give them the REPO_LATEST_BRANCH version
  if (semver.eq(latest, version, { includePrerelease: true })) {
    return process.env.REPO_LATEST_BRANCH!;
  }

  // otherwise give them the tag version
  return ref;
}

export async function getVersions(): Promise<string[]> {
  let refs = await prisma.gitHubRef.findMany({
    select: { ref: true },
    where: {
      ref: {
        startsWith: "refs/tags/",
      },
    },
  });

  let tags = refs.map((ref) => ref.ref.replace(/^refs\/tags\//, ""));

  let sorted = tags
    // we allow saving branches as versions, but we shouldn't show them
    .filter((ref) => semver.valid(ref))
    .sort((a, b) => semver.rcompare(a, b));

  return sorted;
}
