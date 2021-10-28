import invariant from "tiny-invariant";
import path from "path";
import * as semver from "semver";
import type { Doc as PrismaDoc } from "@prisma/client";

import { prisma } from "~/db.server";

export interface VersionHead {
  /**
   * like v2 or v0.4
   */
  head: string;

  /**
   * The full version like v2.1.1
   */
  version: string;

  /**
   * So we know to fetch from the ref or not
   */
  isLatest: boolean;
}

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

export async function getDoc(
  slug: string,
  paramRef: string,
  lang: string
): Promise<PrismaDoc> {
  let ref = await getLatestRefFromParam(paramRef);
  let doc: PrismaDoc;
  let slugs = [path.join("/", `${slug}.md`), path.join("/", slug, "index.md")];
  try {
    doc = await prisma.doc.findFirst({
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
    throw new Response("", { status: 404, statusText: "Doc not found" });
  }

  return doc;
}

export async function getLatestRefFromParam(refParam: string): Promise<string> {
  let version = semver.valid(refParam)
    ? refParam
    : semver.valid(semver.coerce(refParam))
    ? `v${semver.valid(semver.coerce(refParam))}`
    : null;

  let ref = version ? `refs/tags/${version}` : `refs/heads/${refParam}`;

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

  let sorted = tags.sort((a, b) =>
    semver.rcompare(a, b, { includePrerelease: true })
  );

  let latest = sorted.at(0);

  invariant(latest, "Expected to find a latest version");

  if (tags.includes(version)) {
    return ref;
  }

  let diff = semver.diff(latest, version, { includePrerelease: true });

  if (diff && ["minor", "patch", "prerelease"].includes(diff)) {
    return process.env.REPO_LATEST_BRANCH!;
  }

  return ref;
}

export async function getVersions(): Promise<VersionHead[]> {
  let refs = await prisma.gitHubRef.findMany({
    select: { ref: true },
    where: {
      ref: {
        startsWith: "refs/tags/",
      },
    },
  });

  let tags = refs.map((ref) => ref.ref.replace(/^refs\/tags\//, ""));
  let validTags = tags.filter((ref) =>
    semver.valid(ref.replace(/^refs\/tags\//, ""))
  );

  let sorted = validTags.sort((a, b) => semver.compare(b, a));

  let versions = sorted.map((version) => {
    let tag = semver.coerce(version);

    invariant(tag, "Invalid version");

    let head =
      tag.major > 0
        ? `v${tag.major}`
        : tag.minor > 0
        ? `v0.${tag.minor}`
        : `v0.0.${tag.patch}`;

    return {
      head,
      version,
      isLatest: false,
    };
  });

  versions[0].isLatest = true;

  return versions;
}

export function getVersion(head: string, versions: VersionHead[]) {
  return versions.find((v) => v.head === head);
}
