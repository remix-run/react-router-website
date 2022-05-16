import fsp from "fs/promises";
import invariant from "tiny-invariant";
import path from "path";
import { octokit } from "./github";

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
  filepath: string
): Promise<string | null> {
  if (ref === "local") return getLocalContent(filepath);
  let [owner, repo] = repoPair.split("/");
  try {
    const { data } = await octokit.rest.repos.getContent({
      mediaType: { format: "raw" },
      owner,
      repo,
      path: filepath,
      ref,
    });

    // @ts-expect-error - `format: raw` returns a string but the type doesn't know
    // that.
    return data;
  } catch (e: any) {
    if (e.status === 404) {
      return null;
    }
    throw e;
  }
}

/**
 * Reads a single file from your local source repository
 */
async function getLocalContent(filepath: string): Promise<string> {
  invariant(
    process.env.LOCAL_REPO_RELATIVE_PATH,
    "Expected LOCAL_REPO_RELATIVE_PATH"
  );
  let localFilePath = path.join(process.env.LOCAL_REPO_RELATIVE_PATH, filepath);
  let content = await fsp.readFile(localFilePath);
  return content.toString();
}
