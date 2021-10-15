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

    let parentSlug = slug.substr(0, slug.lastIndexOf("/"));
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
  try {
    // go for the language version
    doc = await prisma.doc.findFirst({
      where: {
        OR: [
          {
            githubRef: { ref },
            filePath: "/" + slug + ".md",
            lang,
          },
          {
            githubRef: { ref },
            filePath: path.join("/", slug, "index.md"),
            lang,
          },
          {
            githubRef: { ref },
            filePath: "/" + slug + ".md",
            lang: "en",
          },
          {
            githubRef: { ref },
            filePath: path.join("/", slug, "index.md"),
            lang: "en",
          },
        ],
      },
      rejectOnNotFound: true,
    });
  } catch (error: unknown) {
    throw new Response("", { status: 404, statusText: "Doc not found" });
  }

  return doc;
}

export async function getLatestRefFromParam(refParam: string): Promise<string> {
  let version = semver.valid(semver.coerce(refParam));

  let ref = version ? `/refs/tags/${version}` : `/refs/heads/${refParam}`;

  if (!version) return ref;

  let refs = await prisma.gitHubRef.findMany({
    select: { ref: true },
  });

  let tags = refs
    .filter(
      (ref) =>
        ref.ref.startsWith("/refs/tags/") &&
        semver.valid(ref.ref.replace(/^\/refs\/tags\//, ""))
    )
    .map((ref) => ref.ref.replace(/^\/refs\/tags\//, ""));

  // TODO: remove includePrerelease after v6 release (or before v7 🤪)
  let sorted = semver.sort(tags, { includePrerelease: true });

  let latest = sorted.at(-1);

  invariant(latest, "No tag found");

  if (semver.major(latest) === semver.major(version)) {
    return process.env.REPO_LATEST_BRANCH;
  }

  return latest;
}

export async function getVersions(): Promise<VersionHead[]> {
  let refs = await prisma.gitHubRef.findMany({
    select: { ref: true },
  });

  let sorted = refs
    // we allow saving branches as versions, but we shouldn't show them
    .filter(
      (ref) =>
        ref.ref.startsWith("/refs/tags/") &&
        semver.valid(ref.ref.replace(/^\/refs\/tags\//, ""))
    )
    .sort((a, b) =>
      semver.compare(
        b.ref.replace(/^\/refs\/tags\//, ""),
        a.ref.replace(/^\/refs\/tags\//, "")
      )
    );

  let versions = sorted.map((ref) => {
    let version = ref.ref.replace(/^\/refs\/tags\//, "");
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
