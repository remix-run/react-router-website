import fsp from "fs/promises";
import path from "path";

import { PrismaClient } from "@prisma/client";
import chokidar from "chokidar";

import { processDoc, ProcessedDoc } from "../app/utils/process-docs.server";

let prisma = new PrismaClient();

if (!process.env.REPO_LATEST_BRANCH || !process.env.LOCAL_DOCS_PATH) {
  throw new Error(
    "yo, you forgot something, missing one of the following LOCAL_DOCS_PATH, REPO_LATEST_BRANCH"
  );
}

let DOCS_DIR = path.resolve(process.cwd(), process.env.LOCAL_DOCS_PATH);
let DOCS_FILES = DOCS_DIR + "/**/*.md";
let BRANCH = process.env.REPO_LATEST_BRANCH;

async function updateOrCreateDoc(processed: ProcessedDoc) {
  let exists = await prisma.doc.findFirst({
    where: {
      filePath: processed.path,
      lang: processed.lang,
      githubRef: { ref: BRANCH },
    },
  });

  if (exists) {
    try {
      await prisma.doc.updateMany({
        where: {
          filePath: processed.path,
          lang: processed.lang,
          githubRef: { ref: BRANCH },
        },
        data: {
          ...processed.attributes,
          filePath: processed.path,
          md: processed.md,
          html: processed.html,
          lang: processed.lang,
          hasContent: processed.hasContent,
          title: processed.title,
        },
      });
      console.log(`updated doc ${processed.path}`);
    } catch (error) {
      console.error(`failed to update doc ${processed.path}`, error);
    }
  } else {
    try {
      await prisma.doc.create({
        data: {
          ...processed.attributes,
          filePath: processed.path,
          md: processed.md,
          html: processed.html,
          lang: processed.lang,
          hasContent: processed.hasContent,
          title: processed.title,
          githubRef: {
            connectOrCreate: {
              where: {
                ref: BRANCH,
              },
              create: {
                ref: BRANCH,
                releaseNotes: "",
              },
            },
          },
        },
      });
      console.log(`created doc ${processed.path}`);
    } catch (error) {
      console.error(`failed to create doc ${processed.path}`, error);
    }
  }
}

let watcher = chokidar.watch(DOCS_FILES, {
  persistent: true,
  ignoreInitial: true,
  cwd: DOCS_DIR,
});

watcher
  .on("ready", async () => {
    console.log("Syncing all local files with the DB");
    let entries = Object.entries(watcher.getWatched());
    let allFiles = entries.reduce<string[]>((acc, [dir, files]) => {
      let newPaths = files.map((file) => path.join(DOCS_DIR, dir, file));
      return [...acc, ...newPaths];
    }, []);

    let promises = [];

    for (let filepath of allFiles) {
      let content = await fsp.readFile(filepath, "utf8");
      let actualFilePath = path.join(
        "/docs",
        path.relative(DOCS_DIR, filepath)
      );

      let processed = await processDoc({
        type: "file",
        content,
        path: actualFilePath,
      });

      promises.push(updateOrCreateDoc(processed));
    }

    await Promise.all(promises);

    console.log("Initial scan complete. Ready for changes");
  })
  .on("error", (error) => console.error(error))
  .on("add", async (filepath) => {
    let actualFilePath = path.join("/docs", filepath);
    console.log(`File ${actualFilePath} has been added`);
    let absolutePath = path.join(DOCS_DIR, filepath);
    let content = await fsp.readFile(absolutePath, "utf8");
    let processed = await processDoc({
      type: "file",
      content,
      path: actualFilePath,
    });

    await updateOrCreateDoc(processed);
  })
  .on("change", async (filepath) => {
    let actualFilePath = path.join("/docs", filepath);
    console.log(`File ${actualFilePath} has been changed`);
    let absolutePath = path.join(DOCS_DIR, filepath);
    let content = await fsp.readFile(absolutePath, "utf8");
    let processed = await processDoc({
      type: "file",
      content,
      path: actualFilePath,
    });

    await updateOrCreateDoc(processed);
  })
  .on("unlink", (filepath) => {
    let actualFilePath = path.join("/docs", filepath);
    console.log(`File ${actualFilePath} has been removed`);
    // TODO: delete from db
  });
