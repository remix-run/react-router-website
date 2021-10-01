import { promises as fs } from "fs";
import path from "path";

import parseAttributes from "gray-matter";
import { processMarkdown } from "@ryanflorence/md";
import * as semver from "semver";
import type { Doc as PrismaDoc } from "@prisma/client";

import { prisma } from "./db.server";
import { Attributes } from "./utils/process-docs.server";

let where: "remote" | "local" =
  process.env.NODE_ENV === "production"
    ? "remote"
    : process.env.REMOTE_DOCS === "true"
    ? "remote"
    : "local";

let menuCache = new Map<string, MenuDir>();

export interface MenuDir {
  type: "directory";
  name: string;
  path: string;
  title: string;
  files: MenuFile[];
  dirs: MenuDir[];
  hasIndex: boolean;
  attributes: Attributes;
}

export interface MenuFile {
  type: "file";
  /**
   * The file name on disk, with extension
   */
  name: string;
  /**
   * The url path in the UI
   */
  path: string;
  title: string;
  attributes: Attributes;
}

export type MenuItem = MenuDir | MenuFile;

export interface File {
  type: "file" | "directory";
  name: string;
  path: string;
}

export type Doc = {
  html: string;
  title: string;
  attributes: Attributes;
};

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

export async function getMenu(
  config: Config,
  version: VersionHead
): Promise<MenuDir> {
  let dirName = "/";
  let menu = await getContentsRecursively(
    config,
    dirName,
    "root",
    dirName,
    version
  );
  return menu;
}

// TODO: this is a mess, could be optimized and not even need to be recursive, but here we are
async function getContentsRemote(
  version: VersionHead,
  slug: string
): Promise<File[]> {
  let slugWithLeadingSlash = slug.startsWith("/") ? slug : `/${slug}`;

  const docs = await prisma.doc.findMany({
    where: {
      lang: "en",
      filePath: { startsWith: slugWithLeadingSlash },
      version: {
        fullVersionOrBranch: version.version,
      },
    },
    select: {
      filePath: true,
      title: true,
    },
  });

  let files = new Map<string, File>();

  for (let doc of docs) {
    let dirname = path.dirname(doc.filePath);

    if (dirname === slugWithLeadingSlash) {
      files.set(doc.filePath, {
        name: doc.title,
        path: doc.filePath,
        type: "file",
      });
    } else {
      dirname = dirname.replace(slugWithLeadingSlash, "");
      files.set(dirname, {
        name: doc.title,
        path: dirname.startsWith("/") ? dirname : `/${dirname}`,
        type: "directory",
      });
    }
  }

  let returnValue: File[] = [];

  for (let [, value] of files) {
    returnValue.push(value);
  }

  return returnValue;
}

async function getContentsLocal(config: Config, slug: string): Promise<File[]> {
  let root = path.join(process.cwd(), config.localPath);
  let dirPath = path.join(root, slug);
  let dir = await fs.readdir(dirPath);

  return Promise.all(
    dir.map(async (fileName): Promise<File> => {
      let fileDiskPath = path.join(dirPath, fileName);
      let isDir = (await fs.stat(fileDiskPath)).isDirectory();

      let emulatedRemotePath = `${slug}/${fileName}`;

      return {
        type: isDir ? "directory" : "file",
        name: fileName,
        path: emulatedRemotePath,
      };
    })
  );
}

async function getContentsRecursively(
  config: Config,
  dirPath: string,
  dirName: string,
  rootName: string,
  version: VersionHead
): Promise<MenuDir> {
  let contents =
    where === "remote"
      ? await getContentsRemote(version, dirPath)
      : await getContentsLocal(config, dirPath);

  if (!Array.isArray(contents)) {
    throw new Error(
      `You need to have some folders inside of ${dirPath} to make a menu`
    );
  }

  let files = contents.filter(
    (file) =>
      file.type === "file" &&
      // is markdown
      file.name.match(/\.md$/) &&
      // not 404
      !file.name.match(/^404\.md$/)
  );

  let hasIndexFile = !!contents.find((file) => file.name === `index.md`);
  let { attributes, content } = hasIndexFile
    ? await getAttributes(config, path.join(dirPath, `index.md`), version, "en")
    : ({ attributes: {}, content: "" } as {
        attributes: Attributes;
        content: string;
      });

  let hasIndex = content.trim() !== "";
  let ext = `.md`;

  let dir: MenuDir = {
    type: "directory",
    name: dirName,
    path: dirPath.replace(rootName, ""),
    hasIndex,
    attributes,
    title: attributes.title || dirName,
    dirs: [],
    files: (
      await Promise.all(
        files
          .filter((file) => file.name !== `index${ext}`)
          .map(async (file): Promise<MenuFile> => {
            let { attributes } = await getAttributes(
              config,
              file.path,
              version,
              "en"
            );
            let linkPath = file.path
              .replace(rootName, "")
              .slice(0, -ext.length);

            return {
              name: attributes.title || path.basename(linkPath),
              path: linkPath.startsWith("/") ? linkPath : `/${linkPath}`,
              type: "file",
              attributes,
              title: attributes.title || path.basename(linkPath),
            };
          })
      )
    ).sort(sortByAttributes),
  };

  let dirs = contents.filter((file) => file.type === "directory");
  if (dirs.length) {
    let subDirs = await Promise.all(
      dirs.map((dir) =>
        getContentsRecursively(config, dir.path, dir.name, rootName, version)
      )
    );

    // grab the current directories files and make them directories
    // this lets us sort them into the correct order
    // (e.g /guides/migrating-5-to-6 will be before /guides/building-the-user-interface/index.md)
    let subDirFiles = [...dir.files].map<MenuDir>((file) => ({
      attributes: file.attributes,
      dirs: [],
      files: [],
      hasIndex: true,
      name: file.name,
      path: file.path,
      title: file.attributes.title,
      type: "directory",
    }));

    // empty out the current directories files to prevent duplication
    dir.files = [];

    // merge the sub directories and files into the current directory and sort them
    let sortedSubDirs = [...subDirs, ...subDirFiles].sort(sortByAttributes);

    // add the sub directories to the current directory
    dir.dirs.push(...sortedSubDirs);
  }

  return dir;
}

export async function getDoc(
  config: Config,
  slug: string,
  version: VersionHead,
  lang: string
): Promise<Doc> {
  return where === "remote"
    ? getDocRemote(slug, version, lang)
    : getDocLocal(config, slug, lang);
}

async function getDocRemote(
  slug: string,
  version: VersionHead,
  lang: string
): Promise<Doc> {
  let doc: PrismaDoc;
  try {
    doc = await prisma.doc.findFirst({
      where: {
        OR: [
          {
            version: {
              versionHeadOrBranch: version.head,
            },
            filePath: slug + ".md",
            lang: lang,
          },
          {
            version: {
              versionHeadOrBranch: version.head,
            },
            filePath: path.join(slug, "index.md"),
            lang: lang,
          },
        ],
      },
      rejectOnNotFound: true,
    });
  } catch (error: unknown) {
    try {
      doc = await prisma.doc.findFirst({
        where: {
          OR: [
            {
              version: {
                versionHeadOrBranch: version.head,
              },
              filePath: slug + ".md",
              lang: "en",
            },
            {
              version: {
                versionHeadOrBranch: version.head,
              },
              filePath: path.join(slug, "index.md"),
              lang: "en",
            },
          ],
        },
        rejectOnNotFound: true,
      });
    } catch (error: unknown) {
      // still not found
      throw new Error("Doc not found.");
    }
  }

  return {
    attributes: {
      title: doc.title,
      disabled: doc.disabled,
      hidden: doc.hidden,
      description: doc.description ?? undefined,
      siblingLinks: doc.siblingLinks,
      toc: doc.toc,
      order: doc.order ?? undefined,
      published: doc.published ?? undefined,
    },
    html: doc.html,
    title: doc.title,
  };
}

async function getDocLocal(
  config: Config,
  slug: string,
  lang: string
): Promise<Doc> {
  let root =
    lang === "en"
      ? path.resolve(process.cwd(), config.localPath)
      : path.resolve(
          process.cwd(),
          config.localPath,
          config.localLangDir,
          lang
        );
  let dirName = path.join(root, slug);
  let ext = ".md";

  let fileName = dirName.endsWith(ext) ? dirName : dirName + ext;
  let indexName = path.join(dirName, "index") + ext;
  let notFoundFileName = path.join(root, "404") + ext;

  let actualFileWeWant;

  try {
    // if it's a folder
    const stats = await fs.stat(dirName);
    if (stats.isDirectory()) {
      actualFileWeWant = indexName;
    } else {
      actualFileWeWant = fileName;
    }
  } catch (error: unknown) {
    actualFileWeWant = fileName;
  }

  try {
    // see if we have the file
    await fs.access(actualFileWeWant);
  } catch (error: unknown) {
    // 404 doc
    actualFileWeWant = notFoundFileName;
    try {
      fs.access(actualFileWeWant);
    } catch (error: unknown) {
      // seriously, come on...
      throw new Error("Doc not found, also, the 404 doc was not found.");
    }
  }

  let file = await fs.readFile(actualFileWeWant, "utf-8");

  let { data, content } = parseAttributes(file);
  let title = data.title || slug;
  let html =
    content.trim() === ""
      ? ""
      : await processMarkdown(
          data.toc === false ? content : "## toc\n" + content
        );

  return {
    attributes: {
      title,
      disabled: data.disabled ?? false,
      hidden: data.hidden ?? false,
      description: data.description ?? undefined,
      siblingLinks: data.siblingLinks ?? false,
      toc: data.toc ?? true,
      order: data.order ?? undefined,
      published: data.published ?? undefined,
    },
    html: html.toString(),
    title,
  };
}

async function getAttributes(
  config: Config,
  slug: string,
  version: VersionHead,
  lang: string
): Promise<{ attributes: Attributes; content: string }> {
  let contents =
    where === "remote"
      ? await getRemoteFileAttributes(config, slug, version, lang)
      : await getLocalFileAttributes(config, slug, version, lang);

  return contents;
}

async function getRemoteFileAttributes(
  config: Config,
  slug: string,
  version: VersionHead,
  lang: string
): Promise<{
  attributes: Attributes;
  content: string;
}> {
  let doc: PrismaDoc;
  try {
    doc = await prisma.doc.findFirst({
      where: {
        filePath: slug,
        version: { fullVersionOrBranch: version.version },
        lang: lang,
      },
      rejectOnNotFound: true,
    });
  } catch (error: unknown) {
    try {
      doc = await prisma.doc.findFirst({
        where: {
          filePath: slug,
          version: { fullVersionOrBranch: version.version },
          lang: "en",
        },
        rejectOnNotFound: true,
      });
    } catch (error) {
      // still not found...
      throw new Error("Doc not found");
    }
  }

  return {
    attributes: {
      title: doc.title,
      order: doc.order ?? undefined,
      disabled: doc.disabled,
      siblingLinks: doc.siblingLinks,
      published: doc.published ?? undefined,
      description: doc.description ?? undefined,
      hidden: doc.hidden,
      toc: doc.toc,
    },
    content: doc.html,
  };
}

async function getLocalFileAttributes(
  config: Config,
  slug: string,
  version: VersionHead,
  lang: string
): Promise<{
  attributes: Attributes;
  content: string;
}> {
  let doc = await getDocLocal(config, slug, lang);

  return {
    attributes: doc.attributes,
    content: doc.html,
  };
}

function sortByAttributes(a: MenuItem, b: MenuItem) {
  if (a.attributes.order && !b.attributes.order) return -1;
  if (a.attributes.order && b.attributes.order) {
    return a.attributes.order - b.attributes.order;
  }

  if (a.attributes.published && b.attributes.published) {
    return (
      new Date(b.attributes.published).getTime() -
      new Date(a.attributes.published).getTime()
    );
  }

  return a.title.localeCompare(b.title);
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
