import path from "path";
import { Migrate } from "@prisma/migrate";
import { ensureDatabaseExists } from "@prisma/migrate/dist/utils/ensureDatabaseExists";
import { printFilesFromMigrationIds } from "@prisma/migrate/dist/utils/printFiles";
import { satisfies } from "semver";
import { GitHubRelease } from "./@types/github";
import { saveDocs } from "./utils/save-docs";
import fetch from "node-fetch";

// FIXME: this is duplicated from `getLoadContext`, should figure out how to not
// do that and figure out what we really even need and where. Might not even
// need this in load context at all.
let context = {
  docs: {
    owner: "remix-run",
    repo: "react-router",
    remotePath: "docs",
    localPath: "../react-router/docs",
    localLangDir: "_i18n",
    versions: ">=6.0.0-beta.6",
  },
};

async function seed() {
  const releasesPromise = await fetch(
    `https://api.github.com/repos/${context.docs.owner}/${context.docs.repo}/releases`,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }
  );

  const releases = (await releasesPromise.json()) as GitHubRelease[];

  const releasesToUse = releases.filter((release) => {
    return satisfies(release.tag_name, context.docs.versions);
  });

  let promises = releasesToUse.map((release: any) =>
    saveDocs(`/refs/tags/${release.tag_name}`, context.docs, release.body)
  );

  // FIXME: remove this, using the docs branch until we track v6 head
  promises.unshift(saveDocs("/refs/heads/dev", context.docs, ""));

  await Promise.all(promises);
}

async function resetAndSeed() {
  let schemaPath = path.join(process.cwd(), "prisma/schema.prisma");
  const migrate = new Migrate(schemaPath);
  await ensureDatabaseExists("create", true, schemaPath);

  let migrationIds: string[];
  try {
    await migrate.reset();

    const { appliedMigrationNames } = await migrate.applyMigrations();
    migrationIds = appliedMigrationNames;
  } finally {
    migrate.stop();
  }

  await migrate.tryToRunGenerate();

  if (migrationIds.length === 0) {
    console.info("Database reset successful\n");
  } else {
    console.log("Database reset successful");
  }

  await seed();
}

resetAndSeed();
