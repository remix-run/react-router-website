const fsp = require("fs/promises");
const path = require("path");

const { PrismaClient } = require("@prisma/client");
const chokidar = require("chokidar");
const parseAttributes = require("gray-matter");
const { processMarkdown } = require("@ryanflorence/md");

let prisma = new PrismaClient();

let DOCS_DIR = path.resolve(process.cwd(), "../react-router/docs");
let DOCS_FILES = DOCS_DIR + "/**/*.md";
let BRANCH = "local";

async function processFile(entry) {
  let { data, content } = parseAttributes(entry.content);
  let hasContent = content.trim() !== "";

  let path = entry.path.replace(DOCS_DIR, "");
  let title = data.title || path;
  let html = hasContent
    ? await processMarkdown(data.toc === false ? content : "## toc\n" + content)
    : "";

  let langMatch = path.match(/^\/_i18n\/(?<lang>[a-z]{2})\//);

  let lang = langMatch?.groups?.lang ?? "en";

  return {
    attributes: {
      disabled: data.disabled ?? false,
      toc: data.toc,
      hidden: data.hidden ?? false,
      siblingLinks: data.siblingLinks ?? false,
      title: title,
      order: data.order,
      description: data.description,
      published: data.published,
    },
    html: html.toString(),
    title,
    path,
    md: content,
    hasContent,
    lang,
  };
}

async function updateOrCreateDoc(processed) {
  let exists = await prisma.doc.findFirst({
    where: {
      filePath: processed.path,
      version: { fullVersionOrBranch: BRANCH },
    },
  });

  if (exists) {
    try {
      await prisma.doc.updateMany({
        where: {
          filePath: processed.path,
          version: { fullVersionOrBranch: BRANCH },
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
          version: {
            connectOrCreate: {
              create: {
                fullVersionOrBranch: BRANCH,
                versionHeadOrBranch: BRANCH,
                releaseNotes: "",
              },
              where: { fullVersionOrBranch: BRANCH },
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
    let allFiles = Object.entries(watcher.getWatched()).reduce(
      (acc, [dir, files]) => {
        let newPaths = files.map((file) => path.join(DOCS_DIR, dir, file));
        return [...acc, ...newPaths];
      },
      []
    );

    let promises = [];

    for (let filepath of allFiles) {
      let content = await fsp.readFile(filepath, "utf8");
      let processed = await processFile({
        type: "file",
        content,
        path: filepath,
      });
      promises.push(updateOrCreateDoc(processed));
    }

    await Promise.all(promises);
    console.log(allFiles);

    console.log("Initial scan complete. Ready for changes");
  })
  .on("error", (error) => console.error(error))
  .on("add", async (filepath) => {
    console.log(`File ${filepath} has been added`);
    let absolutePath = path.join(DOCS_DIR, filepath);
    let content = await fsp.readFile(absolutePath, "utf8");
    let processed = await processFile({
      type: "file",
      content,
      path: filepath,
    });

    await updateOrCreateDoc(processed);
  })
  .on("change", async (filepath) => {
    console.log(`File ${filepath} has been changed`);
    let absolutePath = path.join(DOCS_DIR, filepath);
    let content = await fsp.readFile(absolutePath, "utf8");
    let processed = await processFile({
      type: "file",
      content,
      path: filepath,
    });

    await updateOrCreateDoc(processed);
  })
  .on("unlink", (filepath) => console.log(`File ${filepath} has been removed`));
