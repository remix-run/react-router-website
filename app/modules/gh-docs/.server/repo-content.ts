import fsp from "fs/promises";
import invariant from "tiny-invariant";
import path from "path";

/**
 * Fetches the contents of a file in a repository or from your local disk.
 *
 * @param ref The GitHub ref, use `"local"` for local docs development
 * @param filepath The filepath inside the repo (including "docs/")
 * @returns The text of the file
 */
export async function getRepoContent(
  repoPair: string,
  ref: string,
  filepath: string,
): Promise<string | null> {
  if (ref === "local") return getLocalContent(filepath);
  let [owner, repo] = repoPair.split("/");
  let pathname = `/${owner}/${repo}/${ref}/${filepath}`;
  let response = await fetch(
    new URL(pathname, "https://raw.githubusercontent.com/").href,
    {
      headers: { "User-Agent": `docs:${owner}/${repo}` },
      // Don't let a slow GitHub hold requests open forever
      signal: AbortSignal.timeout(15_000),
    },
  );
  // only a 404 means the file doesn't exist, other failures shouldn't look it
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Could not fetch ${pathname}: ${response.status}`);
  }
  return response.text();
}

/**
 * Reads a single file from your local source repository
 */
async function getLocalContent(filepath: string): Promise<string> {
  invariant(
    process.env.LOCAL_REPO_RELATIVE_PATH,
    "Expected LOCAL_REPO_RELATIVE_PATH",
  );
  let localFilePath = path.join(process.env.LOCAL_REPO_RELATIVE_PATH, filepath);
  let content = await fsp.readFile(localFilePath);
  return content.toString();
}
