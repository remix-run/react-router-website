import { prisma } from "../db.server";
import { findMatchingEntries, getPackage } from "@mcansh/undoc";
import type { File } from "@mcansh/undoc";
import invariant from "tiny-invariant";
import { Entry, processDoc } from "./process-docs.server";
import { processMarkdown } from "@ryanflorence/md";
import type { Prisma } from "@prisma/client";

const REPO = process.env.REPO as string;
const REPO_DOCS_PATH = process.env.REPO_DOCS_PATH as string;
const REPO_LATEST_BRANCH = process.env.REPO_LATEST_BRANCH as string;
const REPO_EXAMPLES_PATH = process.env.REPO_EXAMPLES_PATH as string;

if (!REPO) {
  throw new Error("yo, you forgot something, REPO is not set");
}

if (!REPO_DOCS_PATH) {
  throw new Error("yo, you forgot something, REPO_DOCS_PATH is not set");
}

if (!REPO_LATEST_BRANCH) {
  throw new Error("yo, you forgot something, REPO_LATEST_BRANCH is not set");
}

if (!REPO_EXAMPLES_PATH) {
  throw new Error("yo, you forgot something, REPO_EXAMPLES_PATH is not set");
}

/**
 * ref: refs/tags/v6.0.0-beta.1
 * ref: refs/heads/dev
 */
async function saveDocs(ref: string, releaseNotes: string) {
  // check if we have this release already
  let release = await prisma.gitHubRef.findUnique({
    where: { ref },
    select: {
      docs: { select: { filePath: true } },
    },
  });

  // if we don't have this release, create it
  if (!release) {
    release = await prisma.gitHubRef.create({
      data: {
        ref,
        releaseNotes: await processMarkdown(releaseNotes),
      },
      select: {
        docs: { select: { filePath: true } },
      },
    });
  }

  let existingDocs = release.docs.map((d) => d.filePath);

  let existingDocsForRef = existingDocs.filter(
    (d) => !d.startsWith("/examples")
  );
  let existingExamplesForRef = existingDocs.filter((e) =>
    e.startsWith("/examples")
  );

  let docsDir = REPO_DOCS_PATH.startsWith("/")
    ? REPO_DOCS_PATH
    : `/${REPO_DOCS_PATH}`;
  let examplesDir = REPO_EXAMPLES_PATH.startsWith("/")
    ? REPO_EXAMPLES_PATH
    : `/${REPO_EXAMPLES_PATH}`;

  let stream = await getPackage(REPO, ref);
  invariant(stream, "no stream");

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
          githubRefId: ref,
          lang: doc.lang,
        },
      },
      create: {
        ...docToSave,
        githubRef: {
          connect: { ref },
        },
      },
      update: docToSave,
    });

    console.log(`> Added or updated ${doc.path} for ${ref}`);
  }

  let docsToDelete: string[] = [];

  async function onDeletedEntries(entries: string[]) {
    docsToDelete.push(...entries);
  }

  await findMatchingEntries(stream, docsDir, existingDocsForRef, {
    onEntry(entry) {
      let langMatch = entry.path.match(/^\/_i18n\/(?<lang>[a-z]{2})\//);
      let lang = langMatch?.groups?.lang ?? "en";
      let source = entry.path.replace(/^\/_i18n\/[a-z]{2}/, "");

      return onEntry({
        path: source,
        content: entry.content,
        lang,
      });
    },
    onDeletedEntries,
  });

  await findMatchingEntries(stream, examplesDir, existingExamplesForRef, {
    onEntry(entry) {
      let examplesRegex = /^\/examples\/(?<exampleName>[^\/+]+)\/README.md/;
      let isExample = entry.path.match(examplesRegex);
      let exampleName = isExample?.groups?.exampleName;
      let isExampleRoot = entry.path === "/examples/README.md";

      if (isExample && !exampleName) {
        throw new Error(`example name not found; path: "${entry.path}"`);
      }

      let filePath = isExampleRoot
        ? "/examples/index.md"
        : entry.path.replace(examplesRegex, `/examples/${exampleName}.md`);

      return onEntry({
        path: filePath,
        content: entry.content,
        lang: "en",
      });
    },
    onDeletedEntries,
  });

  if (docsToDelete.length > 0) {
    // TODO: figure out how to tell the lang of the doc to delete so we don't have to delete all of them if one lang is missing.
    console.log("> Deleted docs not in tarball");

    await prisma.doc.deleteMany({
      where: {
        AND: [
          {
            filePath: {
              in: docsToDelete,
            },
          },
          {
            githubRef: {
              ref,
            },
          },
        ],
      },
    });

    for (let entry of docsToDelete) {
      console.log(`> Deleted ${entry} for ${ref}`);
    }
  } else {
    console.log("> No docs to delete");
  }
}

export { saveDocs };
