import path from "path";
import { reactRouterProcessMarkdown as processMarkdown } from "./process-markdown";

import { prisma } from "../db.server";
import { saveMatchingEntries, getPackage } from "./get-docs.server";

if (!process.env.REPO) {
  throw new Error("yo, you forgot something, REPO is not set");
}

if (!process.env.REPO_DOCS_PATH) {
  throw new Error("yo, you forgot something, REPO_DOCS_PATH is not set");
}

if (!process.env.REPO_LATEST_BRANCH) {
  throw new Error("yo, you forgot something, REPO_LATEST_BRANCH is not set");
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
        releaseNotes: await processMarkdown(releaseNotes, {
          preserveLinks: true,
        }),
      },
    });
  }

  let existingDocs = release?.docs.map((d) => d.filePath) || [];

  let stream = await getPackage(process.env.REPO, ref);
  await saveMatchingEntries(
    stream,
    ref,
    path.resolve("/", process.env.REPO_DOCS_PATH),
    existingDocs
  );
}

export { saveDocs };
