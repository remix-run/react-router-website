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

export async function getMenu(
  version: string,
  lang: string
): Promise<MenuNode[]> {
  let docs = await prisma.doc.findMany({
    where: {
      lang,
      version: {
        fullVersionOrBranch: version,
      },
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
  versionHeadOrBranch: string,
  lang: string
): Promise<PrismaDoc> {
  let doc: PrismaDoc;
  try {
    // go for the language version
    doc = await prisma.doc.findFirst({
      where: {
        OR: [
          {
            version: {
              versionHeadOrBranch: versionHeadOrBranch,
            },
            filePath: "/" + slug + ".md",
            lang: lang,
          },
          {
            version: {
              versionHeadOrBranch: versionHeadOrBranch,
            },
            filePath: path.join("/", slug, "index.md"),
            lang: lang,
          },
        ],
      },
      rejectOnNotFound: true,
    });
  } catch (error: unknown) {
    // fallback to english
    try {
      doc = await prisma.doc.findFirst({
        where: {
          OR: [
            {
              version: {
                versionHeadOrBranch: versionHeadOrBranch,
              },
              filePath: "/" + slug + ".md",
              lang: "en",
            },
            {
              version: {
                versionHeadOrBranch: versionHeadOrBranch,
              },
              filePath: path.join("/", slug, "index.md"),
              lang: "en",
            },
          ],
        },
        rejectOnNotFound: true,
      });
    } catch (error: unknown) {
      // still not found
      throw new Response("", { status: 404, statusText: "Doc not found" });
    }
  }

  return doc;
}

export async function getVersions(): Promise<VersionHead[]> {
  let originalVersions = await prisma.version.findMany({
    select: { fullVersionOrBranch: true, versionHeadOrBranch: true },
  });

  let sorted = originalVersions
    // we allow saving branches as versions, but we shouldn't show them
    .filter((v: any) => semver.valid(v.fullVersionOrBranch))
    .sort((a: any, b: any) =>
      semver.compare(b.fullVersionOrBranch, a.fullVersionOrBranch)
    );

  let versions = sorted.map((v: any) => ({
    head: v.versionHeadOrBranch,
    version: v.fullVersionOrBranch,
    isLatest: false,
  }));

  versions[0].isLatest = true;

  return versions;
}

export function getVersion(head: string, versions: VersionHead[]) {
  return versions.find((v) => v.head === head);
}
