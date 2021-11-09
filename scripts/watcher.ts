import fsp from "fs/promises";
import path from "path";

import { PrismaClient } from "@prisma/client";
import chokidar from "chokidar";

import { processDoc, ProcessedDoc } from "../app/utils/process-docs.server";

let prisma = new PrismaClient();

if (!process.env.REPO_LATEST_BRANCH) {
  throw new Error("yo, you forgot something, missing REPO_LATEST_BRANCH");
}

if (!process.env.LOCAL_DOCS_PATH) {
  throw new Error("yo, you forgot something, missing LOCAL_DOCS_PATH");
}

if (!process.env.LOCAL_EXAMPLES_PATH) {
  throw new Error("yo, you forgot something, missing LOCAL_EXAMPLES_PATH");
}

let BRANCH = process.env.REPO_LATEST_BRANCH;

let DOCS_DIR = path.resolve(process.cwd(), process.env.LOCAL_DOCS_PATH);
let DOCS_FILES = DOCS_DIR + "/**/*.md";

let EXAMPLES_DIR = path.resolve(process.cwd(), process.env.LOCAL_EXAMPLES_PATH);
let EXAMPLES_FILES = EXAMPLES_DIR + "/**/*.md";

let WATCH = [DOCS_FILES, EXAMPLES_FILES];

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
          sourceFilePath: processed.source,
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
          sourceFilePath: processed.source,
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

let watcher = chokidar.watch(WATCH, {
  persistent: true,
  ignoreInitial: true,
  cwd: DOCS_DIR,
});

watcher
  .on("ready", async () => {
    console.log("Removing all previous local files from the DB");
    await prisma.doc.deleteMany({
      where: {
        githubRefId: BRANCH,
      },
    });

    console.log("Adding all local files to the DB");
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

    console.log(
      `Initial scan complete. Ready for changes, http://localhost:3000/docs/en/${
        BRANCH.split("/").reverse()[0]
      }`
    );
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
  .on("unlink", async (filepath) => {
    let actualFilePath = path.join("/docs", filepath);
    console.log(`File ${actualFilePath} has been removed`);
    let langMatch = actualFilePath.match(/^\/docs\/_i18n\/(?<lang>[a-z]{2})\//);

    let lang = langMatch?.groups?.lang ?? "en";

    let nonLocalizedPath = actualFilePath.replace(
      /^\/docs\/_i18n\/[a-z]{2}/,
      ""
    );

    await prisma.doc.deleteMany({
      where: {
        filePath: nonLocalizedPath,
        lang,
      },
    });
  });
