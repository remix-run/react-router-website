import { coerce } from "semver";

import { prisma } from "../db.server";
import { Config } from "../utils.server";
import { findMatchingEntries, getPackage } from "./get-docs.server";
import { processDocs } from "./process-docs.server";

/**
 * ref: /refs/tags/v6.0.0-beta.1
 */
async function saveDocs(ref: string, config: Config) {
  const version = ref.replace(/^\/refs\/tags\//, "");

  // check if we have this release already
  let release = await prisma.version.findUnique({
    where: {
      fullVersionOrBranch: version,
    },
  });

  const stream = await getPackage(`${config.owner}/${config.repo}`, ref);

  const entries = await findMatchingEntries(stream, "/docs");
  const entriesWithProcessedMD = await processDocs(entries);

  let tag = coerce(ref);

  if (!tag) {
    throw new Error("tag provided wasn't valid semver");
  }

  let info =
    tag.major > 0
      ? `v${tag.major}`
      : tag.minor > 0
      ? `v0.${tag.minor}`
      : `v0.0.${tag.patch}`;

  // release exists already, so we need to update it
  if (release) {
    const result = await prisma.version.update({
      where: {
        fullVersionOrBranch: version,
      },
      data: {
        docs: {
          updateMany: entriesWithProcessedMD.map((entry) => ({
            data: {
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
            filePath: entry.path,
            html: entry.html,
            md: entry.md,
          })),
        },
      },
    });

    console.log(`Created release for version: ${result.fullVersionOrBranch}`);

    return result;
  }
}

export { saveDocs };
