import { prisma } from "../db.server";
import { findMatchingEntries, getPackage } from "./get-docs.server";
import { processDocs } from "./process-docs.server";
import { processMarkdown } from "@ryanflorence/md";

const REPO = process.env.REPO as string;
const REPO_DOCS_PATH = process.env.REPO_DOCS_PATH as string;
const REPO_LATEST_BRANCH = process.env.REPO_LATEST_BRANCH as string;

if (!REPO || !REPO_DOCS_PATH || !REPO_LATEST_BRANCH) {
  throw new Error(
    "yo, you forgot something, missing of the following REPO, REPO_DOCS_PATH, REPO_LATEST_BRANCH"
  );
}

/**
 * ref: refs/tags/v6.0.0-beta.1
 * ref: refs/heads/dev
 */
async function saveDocs(ref: string, releaseNotes: string) {
  const stream = await getPackage(REPO, ref);
  const entries = await findMatchingEntries(stream, "/docs");
  const entriesWithProcessedMD = await processDocs(entries);

  // check if we have this release already
  let release = await prisma.gitHubRef.findUnique({
    where: { ref },
    include: {
      docs: {
        select: {
          filePath: true,
        },
      },
    },
  });

  // release exists already, so we need to update it
  if (release) {
    await prisma.doc.deleteMany({
      where: { githubRef: { ref } },
    });

    const result = await prisma.gitHubRef.update({
      where: { ref },
      data: {
        docs: {
          create: entriesWithProcessedMD.map((entry) => ({
            filePath: entry.path,
            html: entry.html,
            lang: entry.lang,
            md: entry.md,
            hasContent: entry.hasContent,
            title: entry.attributes.title,
            description: entry.attributes.description,
            disabled: entry.attributes.disabled,
            hidden: entry.attributes.hidden,
            order: entry.attributes.order,
            published: entry.attributes.published,
            siblingLinks: entry.attributes.siblingLinks,
            toc: entry.attributes.toc ?? true,
          })),
        },
      },
    });

    console.info(`Updated release for version: ${result.ref}`);
    return result;
  } else {
    const result = await prisma.gitHubRef.create({
      data: {
        ref,
        releaseNotes: await processMarkdown(releaseNotes),
        docs: {
          create: entriesWithProcessedMD.map((entry) => ({
            filePath: entry.path,
            html: entry.html,
            lang: entry.lang,
            md: entry.md,
            hasContent: entry.hasContent,
            title: entry.attributes.title,
            description: entry.attributes.description,
            disabled: entry.attributes.disabled,
            hidden: entry.attributes.hidden,
            order: entry.attributes.order,
            published: entry.attributes.published,
            siblingLinks: entry.attributes.siblingLinks,
            toc: entry.attributes.toc ?? true,
          })),
        },
      },
    });

    console.info(`Created release for version: ${result.ref}`);
    return result;
  }
}

export { saveDocs };
