import { promises as fs } from "fs";
import path from "path";
import parseAttributes from "gray-matter";
import { processMarkdown } from "@ryanflorence/md";
import * as semver from "semver";
import { prisma } from "./db.server";
import { maxSatisfying } from "semver";

let where: "remote" | "local" = "remote"; //process.env.NODE_ENV === "production" ? "remote" : "local";

let menuCache = new Map<string, MenuDir>();

export interface MenuDir {
  type: "dir";
  name: string;
  path: string;
  title: string;
  files: MenuFile[];
  dirs?: MenuDir[];
  hasIndex: boolean;
  attributes: { [key: string]: string };
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
  attributes: { [key: string]: string };
}

export type MenuItem = MenuDir | MenuFile;

interface File {
  type: string;
  name: string;
  path: string;
}

export type Doc = {
  html: string;
  title: string;
  attributes: { [key: string]: string };
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
  version: VersionHead,
  lang: string
): Promise<MenuDir> {
  if (menuCache.has(version.version)) {
    return menuCache.get(version.version)!;
  }

  let dirName = "/";

  let menu = await getContentsRecursively(
    config,
    dirName,
    "root",
    dirName,
    version
  );
  menuCache.set(version.version, menu);
  return menu;
}

export async function getDoc(
  config: Config,
  slug: string,
  version: VersionHead,
  lang: string
): Promise<Doc | null> {
  let fileContents =
    where === "remote"
      ? await getDocRemote(slug, version, lang)
      : await getDocLocal(config, slug, lang);

  console.log({ fileContents });

  // retry with english
  if (!fileContents) {
    let englishFileContents =
      where === "remote"
        ? await getDocRemote(slug, version, "en")
        : await getDocLocal(config, slug, "en");

    return englishFileContents;
  }

  return fileContents;
}

async function getDocRemote(
  filePath: string,
  version: VersionHead,
  lang: string
): Promise<Doc | null> {
  const docs = await prisma.doc.findMany({
    where: {
      OR: [
        {
          AND: [
            {
              lang,
              filePath: filePath + ".md",
              fullVersionOrBranch: {
                versionHeadOrBranch: {
                  equals: version.head,
                },
              },
            },
          ],
        },
        {
          AND: [
            {
              lang,
              filePath: filePath + ".md",
              fullVersionOrBranch: {
                fullVersionOrBranch: {
                  equals: version.head,
                },
              },
            },
          ],
        },
      ],
    },
    include: {
      fullVersionOrBranch: true,
    },
  });

  if (!docs) {
    console.log("NO DOCS FOUND", version, filePath, lang);
    return null;
  }

  const versions = docs.map((d) => d.fullVersionOrBranch.fullVersionOrBranch);

  const headVersion = maxSatisfying(versions, "*", { includePrerelease: true });

  const doc = docs.find((doc) => {
    return doc.fullVersionOrBranch.fullVersionOrBranch === headVersion;
  });

  if (!doc) {
    console.log("NO DOC FOUND", version, filePath, lang);
    return null;
  }

  console.log(
    `using version ${doc.fullVersionOrBranch.fullVersionOrBranch} of ${filePath} in ${lang}`
  );

  const returnDoc: Doc = {
    attributes: {
      title: doc.title,
    },
    html: doc.html,
    title: doc.title ?? doc.filePath,
  };
  return returnDoc;
}

async function getDocLocal(
  config: Config,
  filePath: string,
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
  let dirName = path.join(root, filePath);
  let ext = `.md`;

  let fileName = dirName + ext;
  let indexName = path.join(dirName, "index") + ext;
  let notFoundFileName = path.join(root, "404") + ext;

  let actualFileWeWant;

  try {
    // if it's a folder
    await fs.access(dirName);
    actualFileWeWant = indexName;
  } catch (e) {
    actualFileWeWant = fileName;
  }

  try {
    // see if we have the file
    await fs.access(actualFileWeWant);
  } catch (error) {
    // 404 doc
    actualFileWeWant = notFoundFileName;
    try {
      fs.access(actualFileWeWant);
    } catch (error) {
      // seriously, come on...
      throw new Error("Doc not found, also, the 404 doc was not found.");
    }
  }

  let file = await fs.readFile(actualFileWeWant);

  let { data, content } = parseAttributes(file);
  let title = data.title || filePath;
  let html = await processMarkdown(`## toc\n\n${content}`);
  let doc: Doc = { attributes: data, html: html.toString(), title };
  return doc;
}

// TODO: this is a mess, could be optimized and not even need to be recursive, but here we are
async function getContentsRemote(
  version: VersionHead,
  slug: string
): Promise<File[]> {
  let slugWithLeadingSlash = slug.startsWith("/") ? slug : `/${slug}`;

  const docs = await prisma.doc.findMany({
    where: {
      AND: [
        { lang: "en" },
        {
          filePath: {
            startsWith: slugWithLeadingSlash,
          },
        },
        {
          fullVersionOrBranch: {
            fullVersionOrBranch: {
              equals: version.version,
            },
          },
        },
      ],
    },
    select: {
      filePath: true,
      title: true,
    },
  });

  let files: File[] = docs
    .map((doc) => {
      let dirs = doc.filePath.split("/").filter(Boolean).slice(0, -1);
      let joined = "/" + dirs.join("/");

      if (joined === slugWithLeadingSlash) {
        return {
          name: doc.title,
          path: doc.filePath,
          type: "file",
        };
      }

      return {
        type: "dir",
        name: doc.title,
        path: joined,
      };
    })
    // remove duplicates
    .filter((f, i, arr) => {
      return arr.findIndex((a) => a.path === f.path) === i;
    });

  return files;
}

async function getContentsLocal(config: Config, slug: string): Promise<File[]> {
  let root = path.join(process.cwd(), config.localPath);
  let dirPath = path.join(root, slug);
  let dir = await fs.readdir(dirPath);

  return Promise.all(
    dir.map(async (fileName) => {
      let fileDiskPath = path.join(dirPath, fileName);
      let isDir = (await fs.stat(fileDiskPath)).isDirectory();
      let emulatedRemotePath = `${slug}/${fileName}`;
      return {
        type: isDir ? "dir" : "file",
        name: fileName,
        path: emulatedRemotePath,
      };
    })
  );
}

async function getAttributes(
  config: Config,
  diskPath: string,
  version: VersionHead
) {
  let contents =
    where === "remote"
      ? await getFileRemote(diskPath, version)
      : await getFileLocal(config, diskPath);

  return contents;
}

async function getFileRemote(
  filename: string,
  version: VersionHead
): Promise<{
  attributes: {
    [key: string]: any;
  };
  content: string;
}> {
  const doc = await prisma.doc.findFirst({
    where: {
      filePath: { equals: filename },
      fullVersionOrBranch: {
        fullVersionOrBranch: {
          equals: version.version,
        },
      },
    },
  });

  if (!doc) {
    return {
      attributes: {},
      content: "",
    };
  }

  return {
    attributes: {
      title: doc.title,
      order: doc.order,
    },
    content: doc.html,
  };
}

async function getFileLocal(
  config: Config,
  fileName: string
): Promise<{
  attributes: {
    [key: string]: any;
  };
  content: string;
}> {
  let docsRoot = path.resolve(process.cwd(), config.localPath);
  let resolvedPath = path.join(docsRoot, fileName);
  let file = await fs.readFile(resolvedPath);
  let { data, content } = parseAttributes(file);
  return { attributes: data, content };
}

// TODO: need to get the "root route path" into these links
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
    ? await getAttributes(config, path.join(dirPath, `index.md`), version)
    : { attributes: {}, content: "" };

  let hasIndex = content.trim() !== "";
  let ext = `.md`;

  let dir: MenuDir = {
    type: "dir",
    name: dirName,
    path: `/${version.head}${dirPath.replace(rootName, "")}`,
    hasIndex,
    attributes,
    title: attributes.title || dirName,
    files: (
      await Promise.all(
        files
          .filter((file) => file.name !== `index${ext}`)
          .map(async (file): Promise<MenuFile> => {
            let { attributes } = await getAttributes(
              config,
              file.path,
              version
            );

            let linkPath = file.path.slice(0, -ext.length);

            return {
              name: file.name,
              path: linkPath,
              type: "file",
              attributes,
              title: attributes.title || path.basename(linkPath),
            };
          })
      )
    ).sort(sortByAttributes),
  };

  let dirs = contents.filter((file) => file.type === "dir");
  if (dirs.length) {
    dir.dirs = (
      await Promise.all(
        dirs.map((dir) =>
          getContentsRecursively(config, dir.path, dir.name, rootName, version)
        )
      )
    )
      // get rid of directories with no files
      .filter((dir) => dir.files.length)
      .sort(sortByAttributes);
  }

  return dir;
}

function sortByAttributes(a: MenuItem, b: MenuItem) {
  if (a.attributes.order && !b.attributes.order) return -1;
  if (a.attributes.order && b.attributes.order) {
    return (
      parseInt(a.attributes.order || "0") - parseInt(b.attributes.order || "0")
    );
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
    distinct: "versionHeadOrBranch",
  });

  let sorted = originalVersions.sort((a, b) =>
    semver.compare(b.fullVersionOrBranch, a.fullVersionOrBranch)
  );

  let versions = sorted.map((v) => ({
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
