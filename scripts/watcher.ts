import fsp from "fs/promises";
import path from "path";

import chokidar from "chokidar";

import { Entry, processDoc } from "../app/utils/process-docs.server";
import { prisma } from "../app/db.server";
import invariant from "tiny-invariant";
import { File } from "@mcansh/undoc";
import { Prisma } from "@prisma/client";

invariant(
  process.env.REPO_LATEST_BRANCH,
  "🚨 you forgot to set REPO_LATEST_BRANCH"
);

invariant(process.env.LOCAL_DOCS_PATH, "🚨 you forgot to set LOCAL_DOCS_PATH");

invariant(
  process.env.LOCAL_EXAMPLES_PATH,
  "🚨 you forgot to set LOCAL_EXAMPLES_PATH"
);

invariant(process.env.REPO_DOCS_PATH, "🚨 you forgot to set REPO_DOCS_PATH");

invariant(
  process.env.REPO_EXAMPLES_PATH,
  "yo, you forgot something, missing REPO_EXAMPLES_PATH"
);

let BRANCH = process.env.REPO_LATEST_BRANCH;

let DOCS_DIR = path.resolve(process.cwd(), process.env.LOCAL_DOCS_PATH);
let DOCS_FILES = DOCS_DIR + "/**/*.md";

let EXAMPLES_DIR = path.resolve(process.cwd(), process.env.LOCAL_EXAMPLES_PATH);
let EXAMPLES_FILES = EXAMPLES_DIR + "/**/*.md";

let WATCH = [DOCS_FILES, EXAMPLES_FILES];

let watcher = chokidar.watch(WATCH, {
  persistent: true,
  ignoreInitial: true,
  cwd: DOCS_DIR,
  ignored: /node_modules/,
});

let docsDir = process.env.REPO_DOCS_PATH.startsWith("/")
  ? process.env.REPO_DOCS_PATH
  : `/${process.env.REPO_DOCS_PATH}`;
let examplesDir = process.env.REPO_EXAMPLES_PATH.startsWith("/")
  ? process.env.REPO_EXAMPLES_PATH
  : `/${process.env.REPO_EXAMPLES_PATH}`;

async function onEntry(entry: Entry) {
  let doc = await processDoc(entry);

  let docToSave: Prisma.DocCreateWithoutGithubRefInput = {
    ...doc.attributes,
    filePath: doc.path,
    sourceFilePath: doc.source,
    md: doc.md,
    html: doc.html,
    hasContent: doc.hasContent,
    title: doc.title,
    lang: doc.lang,
  };

  await prisma.doc.upsert({
    where: {
      filePath_githubRefId_lang: {
        filePath: doc.path,
        githubRefId: BRANCH,
        lang: doc.lang,
      },
    },
    create: {
      ...docToSave,
      githubRef: {
        connect: { ref: BRANCH },
      },
    },
    update: docToSave,
  });

  console.log(`💿 Saved ${doc.path} for ${BRANCH}`);
}

async function saveExamples(entry: File) {
  let examplesRegex = /^\/examples\/(?<exampleName>[^\/+]+)\/README.md/;
  let isExample = entry.path.match(examplesRegex);
  let exampleName = isExample?.groups?.exampleName;
  let isExampleRoot = entry.path === `${examplesDir}/README.md`;

  if (isExample && !exampleName) {
    throw new Error(`🚨 Example name not found; path: "${entry.path}"`);
  }

  let filePath = isExampleRoot
    ? `${examplesDir}/index.md`
    : entry.path.replace(examplesRegex, `${examplesDir}/${exampleName}.md`);

  return onEntry({
    path: filePath,
    content: entry.content,
    lang: "en",
    source: entry.path,
  });
}

async function createFile(filepath: string): Promise<File> {
  let docUrl = path.join(docsDir, filepath);
  let content = await fsp.readFile(path.join(DOCS_DIR, filepath), "utf8");

  return {
    content,
    path: withLeadingSlash(docUrl),
    type: "file",
  };
}

async function saveDoc(entry: File) {
  let langMatch = entry.path.match(/^\/_i18n\/(?<lang>[a-z]{2})\//);
  let lang = langMatch?.groups?.lang ?? "en";
  let filePath = entry.path.replace(/^\/_i18n\/[a-z]{2}/, "");

  return onEntry({
    path: filePath,
    content: entry.content,
    lang,
    source: entry.path,
  });
}

watcher
  .on("ready", async () => {
    console.log("🗑  Removing all previous local files from the DB");
    await prisma.doc.deleteMany({
      where: { githubRefId: BRANCH },
    });

    console.log("🛟 Adding all local files to the DB");
    let entries = Object.entries(watcher.getWatched());

    let allFiles = entries.reduce<string[]>((acc, [dir, files]) => {
      let newPaths = files.map((file) => path.join(DOCS_DIR, dir, file));
      return [...acc, ...newPaths];
    }, []);

    let promises = [];
    for (let filePath of allFiles) {
      let content = await fsp.readFile(filePath, "utf8");
      let docUrl = path.join(docsDir, path.relative(DOCS_DIR, filePath));

      if (docUrl.startsWith(examplesDir)) {
        let opts: File = { content, path: docUrl, type: "file" };
        promises.push(saveExamples(opts));
      } else {
        let opts: File = {
          content,
          path: withLeadingSlash(docUrl),
          type: "file",
        };
        promises.push(saveDoc(opts));
      }
    }

    await Promise.all(promises);

    console.log(
      `✅ Initial scan complete. Ready for changes, http://localhost:3000/docs/en/${
        BRANCH.split("/").reverse()[0]
      }`
    );
  })
  .on("error", (error) => {
    console.error(error);
  })
  .on("add", async (filepath) => {
    console.log(`➕ File ${filepath} has been added`);
    let entry = await createFile(filepath);
    await saveDoc(entry);
  })
  .on("change", async (filepath) => {
    console.log(`✍️  File ${filepath} has been changed`);
    let entry = await createFile(filepath);
    await saveDoc(entry);
  })
  .on("unlink", async (filepath) => {
    let actualFilePath = path.join(docsDir, filepath);
    console.log(`➖ File ${actualFilePath} has been removed`);
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

function withLeadingSlash(filepath: string) {
  return filepath.startsWith("/") ? filepath : `/${filepath}`;
}
