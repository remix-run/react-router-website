import { promises as fs } from "fs";
import path from "path";
import parseAttributes from "gray-matter";
import { processMarkdown } from "@ryanflorence/md";
import { LoaderFunction, redirect, Request } from "remix";
import * as semver from "semver";

let GITHUB_TOKEN = process.env.GITHUB_TOKEN;

let where = process.env.NODE_ENV === "production" ? "remote" : "local";

let menuCache = new Map<string, MenuDir>();
let versionCache: VersionHead[];

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

  let dirName = where === "remote" ? config.remotePath : ".";
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
  version: VersionHead
): Promise<Doc | null> {
  let fileContents =
    where === "remote"
      ? await getDocRemote(config, slug, version)
      : await getDocLocal(config, slug);

  if (!fileContents) return null;

  let { data, content } = parseAttributes(fileContents);
  let title = data.title || slug;
  // console.time(`process markdown ${slug}`);
  let html = await processMarkdown(`## toc\n\n${content}`);
  // console.timeEnd(`process markdown ${slug}`);
  let doc: Doc = { attributes: data, html: html.toString(), title };
  return doc;
}

async function getDocRemote(
  config: Config,
  filePath: string,
  version: VersionHead
): Promise<string> {
  let dirName = path.join(config.remotePath, filePath);
  let ext = `.md`;

  let fileName = dirName + ext;
  let indexName = path.join(dirName, "index") + ext;
  let notFoundFileName = path.join(config.remotePath, "404") + ext;

  try {
    return await getFileRemote(config, fileName, version);
  } catch (error) {
    try {
      return await getFileRemote(config, indexName, version);
    } catch (error) {
      try {
        return await getFileRemote(config, notFoundFileName, version);
      } catch (error) {
        // seriously, come on...
        throw new Error("Doc not found, also, the 404 doc was not found.");
      }
    }
  }
}

async function getDocLocal(config: Config, filePath: string): Promise<string> {
  let root = path.resolve(process.cwd(), config.localPath);
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
  return file.toString();
}

// TODO: make this return a list of File[]
async function getContentsRemote(
  config: Config,
  slug: string,
  version: VersionHead
) {
  let href = `/repos/${config.owner}/${config.repo}/contents/${slug}`;
  if (!version.isLatest) {
    href += `?ref=v${version.version}`;
  }

  return fetchGithub<File[]>(href);
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
      ? await getFileRemote(config, diskPath, version)
      : await getFileLocal(config, diskPath);
  let { data, content } = parseAttributes(contents);
  return { attributes: data, content };
}

async function getFileLocal(config: Config, fileName: string) {
  let docsRoot = path.resolve(process.cwd(), config.localPath);
  let resolvedPath = path.join(docsRoot, fileName);
  let file = await fs.readFile(resolvedPath);
  return file;
}

async function getFileRemote(
  config: Config,
  slug: string,
  version: VersionHead
) {
  let href = `/repos/${config.owner}/${config.repo}/contents/${slug}`;
  if (!version.isLatest) {
    href += `?ref=v${version.version}`;
  }

  let data = await fetchGithub<{ content: string }>(href);
  return Buffer.from(data.content, "base64").toString("utf-8");
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
      ? await getContentsRemote(config, dirPath, version)
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
            let linkPath = file.path
              .replace(rootName, "")
              .slice(0, -ext.length);
            return {
              name: file.name,
              path: `/${version.head}${linkPath}`,
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

/**
 * Adds trailing slashes so relative markdown links resolve correctly in the browser
 */
export function addTrailingSlash(request: Request) {
  return (fn: () => ReturnType<LoaderFunction>) => {
    let url = new URL(request.url);
    if (
      // not a fetch request
      !url.searchParams.has("_data") &&
      // doesn't have a trailing slash
      !url.pathname.endsWith("/")
    ) {
      return redirect(request.url + "/", { status: 308 });
    }
    return fn();
  };
}

export async function getVersions(
  config: Config,
  ignoreCache: boolean = false
): Promise<VersionHead[]> {
  // always return the cached version, update in the background
  if (versionCache && !ignoreCache) {
    getVersions(config, true);
    return versionCache;
  }

  let json = await fetchGithub<{ ref: string }[]>(
    `/repos/${config.owner}/${config.repo}/git/refs/tags`
  );

  let tags: string[] = json
    .map((tag: any) => tag.ref.replace(/^refs\/tags\//, ""))
    .filter((tag: string) => semver.satisfies(tag, config.versions));

  let versions = transformVersionsToLatest(tags);
  versionCache = versions;
  return versions;
}

// Takes a list of semver tags and returns just the top of each major(ish)
// version in reverse order (latest first)
export function transformVersionsToLatest(tags: string[]) {
  let sorted = semver.sort(tags);
  let heads = new Map<string, string>();

  for (let tag of sorted) {
    let info = semver.coerce(tag)!;
    if (info.major > 0) {
      // 1.x.x
      heads.set(`v${info.major}`, info.version);
    } else if (info.minor > 0) {
      // 0.1.x
      heads.set(`v0.${info.minor}`, info.version);
    } else {
      // 0.0.1
      heads.set(`v0.0.${info.patch}`, info.version);
    }
  }

  let versions: VersionHead[] = [];

  for (let [head, version] of heads) {
    versions.unshift({ head: head, version: version, isLatest: false });
  }

  versions[0].isLatest = true;

  return versions;
}

export function getVersion(head: string, versions: VersionHead[]) {
  return versions.find((v) => v.head === head);
}

async function fetchGithub<T>(href: string): Promise<T> {
  let res = await fetch(`https://api.github.com${href}`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      accept: "application/json",
    },
  });

  if (res.status !== 200) {
    let error = await res.json();
    throw new Error(
      `Could not fetch from GitHub: ${href}: ${res.statusText}; ${
        error && error.message
      }`
    );
  }

  return res.json();
}
