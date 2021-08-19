import path from "path";
import fs from "fs";

import { https } from "follow-redirects";
import gunzip from "gunzip-maybe";
import tar, { Headers as TarHeaders } from "tar-stream";

const githubUrl = "https://github.com";

const agent = new https.Agent({
  keepAlive: true,
});

function get(options: Parameters<typeof https.get>["0"]) {
  return new Promise((accept, reject) => {
    https.get(options, accept).on("error", reject);
  });
}

function bufferStream(stream: NodeJS.ReadWriteStream): Promise<Buffer> {
  return new Promise((accept, reject) => {
    const chunks: any[] = [];

    stream
      .on("error", reject)
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => accept(Buffer.concat(chunks)));
  });
}

/**
 * Returns a stream of the tarball'd contents of the given package.
 */
export async function getPackage(packageName: string, version: string) {
  if (process.env.NODE_ENV === "development") {
    console.debug("USING LOCAL TARBALL");
    const tar = path.join(process.cwd(), "public/react-router-dev.tar.gz");
    return fs.createReadStream(tar).pipe(gunzip());
  }

  const tarballURL = `${githubUrl}/${packageName}/archive/${version}.tar.gz`;

  console.debug("Fetching package for %s from %s", packageName, tarballURL);

  const { hostname, pathname } = new URL(tarballURL);
  const options = {
    agent: agent,
    hostname: hostname,
    path: pathname,
  };

  const res: any = await get(options);

  if (res.statusCode === 200) {
    const stream = res.pipe(gunzip());
    // stream.pause();
    return stream;
  }

  if (res.statusCode === 404) {
    return null;
  }

  const content = (await bufferStream(res)).toString("utf-8");

  console.error(
    "Error fetching tarball for %s@%s (status: %s)",
    packageName,
    version,
    res.statusCode
  );

  console.error(content);

  return null;
}

interface Entry {
  path: string;
  type: TarHeaders["type"];
  content?: string;
}

// http://localhost:3000/_refreshlocal

export async function findMatchingEntries(
  stream: NodeJS.ReadWriteStream,
  filename: string
): Promise<Entry[]> {
  // filename = /some/dir/name
  return new Promise((accept, reject) => {
    const entries: { [path: string]: Entry } = {};

    stream
      .pipe(tar.extract())
      .on("error", reject)
      .on("entry", async (header, stream, next) => {
        const entry: Entry = {
          // Most packages have header names that look like `package/index.js`
          // so we shorten that to just `/index.js` here. A few packages use a
          // prefix other than `package/`. e.g. the firebase package uses the
          // `firebase_npm/` prefix. So we just strip the first dir name.
          path: header.name.replace(/^[^/]+\/?/, "/"),
          type: header.type,
        };

        // Dynamically create "directory" entries for all subdirectories
        // in this entry's path. Some tarballs omit directory entries for
        // some reason, so this is the "brute force" method.
        let dir = path.dirname(entry.path);
        while (dir !== "/") {
          if (!entries[dir] && path.dirname(dir) === filename) {
            entries[dir] = { path: dir, type: "directory" };
          }
          dir = path.dirname(dir);
        }

        // Ignore non-files and files that aren't in this directory.
        if (entry.type !== "file" || path.dirname(entry.path) !== filename) {
          stream.resume();
          stream.on("end", next);
          return;
        }

        try {
          const content = await bufferStream(stream);

          if (entry.type === "file" && path.dirname(entry.path) === filename) {
            console.log("ITS A MATCH", entry.path);
          }

          entry.type = "file";
          entry.content = content.toString("utf-8");

          entries[entry.path] = entry;

          next();
        } catch (error) {
          // @ts-ignore
          next(error);
        }
      })
      .on("finish", () => accept(Object.values(entries)));
  });
}
