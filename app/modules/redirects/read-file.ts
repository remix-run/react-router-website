import fs from "fs/promises";
import path from "path";

export type Redirect = [string, string, boolean, number?];
let redirects: null | Redirect[] = null;

/**
 * Reads and caches the redirects file.
 *
 * @param relativePath path of the redirects file relative to process.cwd(),
 * defaults to `_redirects`
 * @returns string
 */
export async function readRedirectsFile(relativePath: string = "_redirects") {
  if (redirects) {
    return redirects;
  }

  let filePath = path.join(process.cwd(), relativePath);
  let buffer = await fs.readFile(filePath);

  redirects = buffer
    .toString()
    .split("\n")
    .reduce((redirects, line: string) => {
      if (line.startsWith("#") || line.trim() === "") {
        return redirects;
      }

      let code = 302;
      let splat = false;
      let [from, to, maybeCode] = line.split(/\s+/);
      if (maybeCode) {
        code = parseInt(maybeCode, 10);
      }
      // super basic support for splats
      if (from.endsWith("/*")) {
        from = from.slice(0, -2);
        splat = true;
      }
      redirects.push([from, to, splat, code]);

      return redirects;
    }, [] as Redirect[]);

  return redirects;
}
