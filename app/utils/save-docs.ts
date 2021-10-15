import { coerce, sort } from "semver";

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
 * ref: /refs/tags/v6.0.0-beta.1
 * ref: /refs/heads/dev
 */
async function saveDocs(ref: string, releaseNotes: string) {
  let version = ref.replace(/^\/refs\/tags\//, "");

  let tag = coerce(ref);

  let info: string;

  if (!tag) {
    if (ref === REPO_LATEST_BRANCH) {
      let versions = await prisma.version.findMany({
        select: { fullVersionOrBranch: true },
      });

      let [latest] = sort(
        versions.map((v) => v.fullVersionOrBranch),
        { includePrerelease: true }
      );
      version = latest;
      info = latest;
    } else {
      let branch = ref.replace(/^\/refs\/heads\//, "");
      version = branch;
      info = branch;
    }
  } else {
    info =
      tag.major > 0
        ? `v${tag.major}`
        : tag.minor > 0
        ? `v0.${tag.minor}`
        : `v0.0.${tag.patch}`;
  }

  const stream = await getPackage(REPO, ref);
  const entries = await findMatchingEntries(stream, "/docs");
  const entriesWithProcessedMD = await processDocs(entries);

  // check if we have this release already
  let release = await prisma.version.findUnique({
    where: {
      fullVersionOrBranch: version,
    },
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
      where: {
        version: {
          fullVersionOrBranch: release.fullVersionOrBranch,
        },
      },
    });

    const result = await prisma.version.update({
      where: {
        fullVersionOrBranch: version,
      },
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

    console.info(`Updated release for version: ${result.fullVersionOrBranch}`);
    return result;
  } else {
    const result = await prisma.version.create({
      data: {
        fullVersionOrBranch: version,
        versionHeadOrBranch: info,
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

    console.info(`Created release for version: ${result.fullVersionOrBranch}`);
    return result;
  }
}

export { saveDocs };
