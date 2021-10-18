import { processMarkdown } from "@ryanflorence/md";

import { prisma } from "../db.server";
import { findMatchingEntries, getPackage } from "./get-docs.server";

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
  // sometimes I (Logan) still use a leading slash when github doesn't
  ref = ref.startsWith("/") ? ref.slice(1) : ref;

  // check if we have this release already
  let release = await prisma.gitHubRef.findUnique({
    where: { ref },
    select: {
      docs: { select: { filePath: true } },
    },
  });

  // if we don't have this release, create it
  if (!release) {
    await prisma.gitHubRef.create({
      data: {
        ref,
        releaseNotes: await processMarkdown(releaseNotes),
      },
    });
  }

  let existingDocs = release?.docs.map((d) => d.filePath) || [];

  let stream = await getPackage(REPO, ref);
  await findMatchingEntries(stream, ref, "/docs", existingDocs);
}

export { saveDocs };
