import { reactRouterProcessMarkdown as processMarkdown } from "./process-markdown";

import { prisma } from "../db.server";
import { findMatchingEntries, getPackage } from "./get-docs.server";

const REPO = process.env.REPO as string;
let REPO_DOCS_PATH = process.env.REPO_DOCS_PATH as string;
const REPO_LATEST_BRANCH = process.env.REPO_LATEST_BRANCH as string;
let REPO_EXAMPLES_PATH = process.env.REPO_EXAMPLES_PATH as string;

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

REPO_DOCS_PATH = REPO_DOCS_PATH.startsWith("/")
  ? REPO_DOCS_PATH
  : `/${REPO_DOCS_PATH}`;
REPO_EXAMPLES_PATH = REPO_EXAMPLES_PATH.startsWith("/")
  ? REPO_EXAMPLES_PATH
  : `/${REPO_EXAMPLES_PATH}`;

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
    await prisma.gitHubRef.create({
      data: {
        ref,
        releaseNotes: await processMarkdown(releaseNotes, {
          preserveLinks: true,
        }),
      },
    });
  }

  let existingDocs = release?.docs.map((d) => d.filePath) || [];

  let stream = await getPackage(REPO, ref);
  await Promise.all([
    findMatchingEntries(stream, ref, REPO_DOCS_PATH, existingDocs),
    findMatchingEntries(stream, ref, REPO_EXAMPLES_PATH, existingDocs),
  ]);
}

export { saveDocs };
