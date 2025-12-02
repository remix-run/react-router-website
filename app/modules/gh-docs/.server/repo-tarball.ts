import fs from "fs";
import invariant from "tiny-invariant";
import path from "path";
import tar from "tar";

/**
 * Fetches a repo tarball from GitHub or your local repo as a tarball in
 * development.
 *
 * @param ref GitHub ref (main, v6.0.0, etc.) use "local" for local repo.
 * @returns The repo tarball
 */
export async function getRepoTarball(
  repo: string,
  ref: string,
): Promise<Uint8Array> {
  if (ref === "local") {
    return getLocalTarball();
  }

  let tarballURL = `https://github.com/${repo}/archive/${ref}.tar.gz`;
  let res = await fetch(tarballURL);

  if (!res.ok) {
    throw new Error(`Could not fetch ${tarballURL}`);
  }

  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Creates a tarball out of your local source repository so that the rest of the
 * code in this app can continue to work the same for local dev as in
 * production.
 */
async function getLocalTarball(): Promise<Uint8Array> {
  invariant(
    process.env.LOCAL_REPO_RELATIVE_PATH,
    "Expected LOCAL_REPO_RELATIVE_PATH",
  );
  let localDocsPath = path.join(
    process.cwd(),
    process.env.LOCAL_REPO_RELATIVE_PATH,
    "docs",
  );
  await tar.c({ gzip: true, file: ".local.tgz" }, [localDocsPath]);
  let buffer = fs.readFileSync(".local.tgz");
  return new Uint8Array(buffer);
}
