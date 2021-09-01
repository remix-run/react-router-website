import { coerce } from "semver";

import { prisma } from "~/db.server";
import { findMatchingEntries, getPackage } from "./get-docs.server";
import { processDocs } from "./process-docs.server";
import type { Config } from "~/utils.server";

/**
 * ref: /refs/tags/v6.0.0-beta.1
 * ref: /refs/heads/dev
 */
async function saveDocs(ref: string, config: Config) {
  let version = ref.replace(/^\/refs\/tags\//, "");

  let tag = coerce(ref);

  let info: string;

  if (!tag) {
    let branch = ref.replace(/^\/refs\/heads\//, "");
    version = branch;
    info = branch;
  } else {
    info =
      tag.major > 0
        ? `v${tag.major}`
        : tag.minor > 0
        ? `v0.${tag.minor}`
        : `v0.0.${tag.patch}`;
  }

  const stream = await getPackage(`${config.owner}/${config.repo}`, ref);
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
    const releaseDocs = release.docs.map((doc) => doc.filePath);
    const existingEntries = entriesWithProcessedMD.filter((entry) => {
      return releaseDocs.includes(entry.path);
    });

    const newEntries = entriesWithProcessedMD.filter((entry) => {
      return !releaseDocs.includes(entry.path);
    });

    const result = await prisma.version.update({
      where: {
        fullVersionOrBranch: version,
      },
      data: {
        docs: {
          create: newEntries.map((entry) => ({
            ...entry.attributes,
            filePath: entry.path,
            html: entry.html,
            md: entry.md,
            title: entry.path,
            lang: entry.lang,
          })),
          updateMany: existingEntries.map((entry) => ({
            data: {
              ...entry.attributes,
              html: entry.html,
              md: entry.md,
            },
            where: {
              filePath: entry.path,
            },
          })),
        },
      },
    });

    console.log(`Updated release for version: ${result.fullVersionOrBranch}`);
    return result;
  } else {
    const result = await prisma.version.create({
      data: {
        fullVersionOrBranch: version,
        versionHeadOrBranch: info,
        docs: {
          create: entriesWithProcessedMD.map((entry) => ({
            ...entry.attributes,
            filePath: entry.path,
            html: entry.html,
            md: entry.md,
            title: entry.path,
            lang: entry.lang,
          })),
        },
      },
    });

    console.log(`Created release for version: ${result.fullVersionOrBranch}`);

    return result;
  }
}

export { saveDocs };
