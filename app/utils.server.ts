import { promises as fs } from "fs";
import path from "path";
import parseAttributes from "gray-matter";
import { processMarkdown } from "@ryanflorence/md";
import * as semver from "semver";
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
  type: "dir";
  name: string;
  path: string;
  title: string;
  files: MenuFile[];
  dirs?: MenuDir[];
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

interface File {
  type: string;
  name: string;
  path: string;
}

export type Doc = {
  html: string;
  title: string;
  attributes: {
    [key: string]: string | boolean;
  };
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
  if (menuCache.has(version.version)) {
    return menuCache.get(version.version)!;
  }

  let dirName = "/";

  let menu =
    where === "remote"
      ? await getRemoteMenu(version)
      : await getLocalMenu(config, dirName, "root", dirName, version);

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
  let doc = await prisma.doc.findFirst({
    where: {
      OR: [
        {
          AND: [
            {
              lang,
              filePath: filePath,
              version: {
                fullVersionOrBranch: version.head,
              },
            },
          ],
        },
        {
          AND: [
            {
              lang,
              filePath: filePath,
              version: {
                versionHeadOrBranch: version.head,
              },
            },
          ],
        },
        {
          AND: [
            {
              lang,
              filePath: path.join(filePath, "index.md"),
              version: {
                fullVersionOrBranch: version.head,
              },
            },
          ],
        },
        {
          AND: [
            {
              lang,
              filePath: path.join(filePath, "index.md"),
              version: {
                versionHeadOrBranch: version.head,
              },
            },
          ],
        },
      ],
    },
  });

  if (!doc) {
    console.error(`NO DOC FOUND FOR "${filePath}"`, { lang, version });
    return null;
  }

  return {
    attributes: {
      title: doc.title,
    },
    html: doc.html,
    title: doc.title ?? doc.filePath,
  };
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
  let html = await processMarkdown(
    data.toc === false ? content : "## toc\n" + content
  );
  let doc: Doc = { attributes: data, html: html.toString(), title };
  return doc;
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
  attributes: Attributes;
  content: string;
} | null> {
  const doc = await prisma.doc.findFirst({
    where: {
      filePath: { equals: filename },
      version: {
        fullVersionOrBranch: {
          equals: version.version,
        },
      },
    },
  });

  if (!doc) {
    return null;
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

async function getFileLocal(
  config: Config,
  fileName: string
): Promise<{
  attributes: Attributes;
  content: string;
}> {
  let docsRoot = path.resolve(process.cwd(), config.localPath);
  let resolvedPath = path.join(docsRoot, fileName);
  let file = await fs.readFile(resolvedPath);
  let { data, content } = parseAttributes(file);
  return { attributes: data, content } as {
    attributes: Attributes;
    content: string;
  };
}

// TODO: need to get the "root route path" into these links
async function getLocalMenu(
  config: Config,
  dirPath: string,
  dirName: string,
  rootName: string,
  version: VersionHead
): Promise<MenuDir> {
  let contents = await getContentsLocal(config, dirPath);

  if (!Array.isArray(contents)) {
    throw new Error(
      `You need to have some folders inside of ${dirPath} to make a menu`
    );
  }

  let files = contents.filter(
    (file) =>
      file.type === "file" &&
      // is markdown
      file.path.match(/\.md$/) &&
      // not 404
      !file.path.match(/^404\.md$/)
  );

  let hasIndexFile = !!contents.find((file) => {
    let parsed = path.parse(file.path);
    return parsed.base === "index.md";
  });

  let attributes: Attributes = {} as Attributes;
  let content: string = "";

  if (hasIndexFile) {
    let parsed = await getAttributes(
      config,
      path.join(dirPath, `index.md`),
      version
    );
    if (parsed) {
      attributes = parsed.attributes;
      content = parsed.content;
    }
  }

  let hasIndex = content.trim() !== "";
  let ext = `.md`;

  let dirFiles = await Promise.all(
    files
      .filter((file) => !file.path.endsWith(`index${ext}`))
      .map(async (file): Promise<MenuFile | null> => {
        let parsed = await getAttributes(config, file.path, version);

        if (!parsed) return null;

        if (parsed.attributes.hidden) return null;

        let parsedPath = path.parse(file.path);

        let filePath = path.format({
          ...parsedPath,
          name: parsedPath.name === "index" ? undefined : parsedPath.name,
          base: parsedPath.name === "index" ? undefined : parsedPath.name,
          ext: undefined,
        });

        return {
          name: file.path,
          path: filePath,
          type: "file",
          attributes: parsed.attributes,
          title: parsed.attributes.title,
        };
      })
  );

  let dir: MenuDir = {
    type: "dir",
    name: dirName,
    path: `/${dirPath.replace(rootName, "")}`,
    hasIndex,
    attributes,
    title: attributes.title || dirName,
    files: dirFiles
      .filter((file): file is MenuFile => file !== null)
      .sort(sortByAttributes),
  };

  let dirs = contents.filter((file) => file.type === "dir");
  if (dirs.length) {
    dir.dirs = (
      await Promise.all(
        dirs.map((dir) =>
          getLocalMenu(config, dir.path, dir.path, rootName, version)
        )
      )
    )
      // get rid of directories with no files
      .filter((dir) => dir.files.length)
      .sort(sortByAttributes);
  }

  return dir;
}

async function getRemoteMenu(version: VersionHead): Promise<MenuDir> {
  const docs = await prisma.doc.findMany({
    where: {
      version: {
        fullVersionOrBranch: version.version,
      },
    },
  });

  let dirMap = new Map<string, MenuItem[]>();

  for (let doc of docs) {
    let dirname = path.dirname(doc.filePath);
    let files: MenuFile[] = docs
      .filter((doc) => path.dirname(doc.filePath) === dirname)
      .map((file) => {
        return {
          name: file.title,
          path: file.filePath,
          title: file.title,
          type: "file",
          attributes: {
            title: file.title,
            disabled: file.disabled,
            hidden: file.hidden,
            siblingLinks: file.siblingLinks,
            toc: file.toc,
            description: file.description ?? undefined,
            order: file.order ?? undefined,
            published: file.published ?? undefined,
          },
        };
      });

    dirMap.set(dirname, files);
  }

  let menu: MenuDir = {
    type: "dir",
    name: "root",
    path: "/",
    hasIndex: false,
    attributes: {} as Attributes,
    title: "root",
    files: [],
    dirs: [],
  };

  for (let [dir, files] of dirMap) {
    let indexFile = files.find((file) => file.path.endsWith("index.md"));
    if (dir === "/") {
      menu.attributes = {
        title: dir,
        disabled: false,
        hidden: false,
        siblingLinks: false,
        toc: false,
      };
      menu.dirs = [];
      menu.hasIndex = !!indexFile;
      menu.title = indexFile ? indexFile.attributes.title : "root";
      menu.type = "dir";
      menu.files = files
        .filter((file) => !file.path.endsWith(`index.md`))
        .sort(sortByAttributes)
        .map((file) => ({
          ...file,
          type: "file",
        }));
    } else {
      if (!menu.dirs) menu.dirs = [];
      let indexFile = files.find((file) => file.path.endsWith("index.md"));
      menu.dirs.push({
        attributes: {
          title: dir,
          disabled: false,
          hidden: false,
          siblingLinks: false,
          toc: false,
        },
        type: "dir",
        hasIndex: !!indexFile,
        title: indexFile ? indexFile.attributes.title : dir,
        path: dir,
        name: dir,
        dirs: [],
        files: files
          .filter((file) => !file.path.endsWith(`index.md`))
          .sort(sortByAttributes)
          .map((file) => ({
            ...file,
            type: "file",
          })),
      });
    }
  }

  return menu;
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
    .filter((v) => semver.valid(v.fullVersionOrBranch))
    .sort((a, b) =>
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
