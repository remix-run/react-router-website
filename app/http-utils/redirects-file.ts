import { redirect } from "@remix-run/node";
import fs from "fs/promises";
import path from "path";

// relative to where we're built, build/index.js
type Redirect = [string, string, number?];
let redirects: null | Redirect[] = null;

// TODO: add support with pathToRegexp to redirect with * and stuff
export async function handleRedirects(request: Request) {
  console.log("handleRedirects");
  if (redirects === null) {
    let filePath = path.join(process.cwd(), "_redirects");
    redirects = (await fs.readFile(filePath))
      .toString()
      .split("\n")
      .reduce((redirects, line: string) => {
        if (line.startsWith("#") || line.trim() === "") {
          return redirects;
        }

        let code = 302;
        let [from, to, maybeCode] = line.split(/\s+/);
        if (maybeCode) {
          code = parseInt(maybeCode, 10);
        }
        redirects.push([from, to, code]);

        return redirects;
      }, [] as Redirect[]);
  }

  let url = new URL(request.url);
  for (let r of redirects) {
    let [from, location, status] = r;
    if (url.pathname === from) {
      throw redirect(location, { status });
    }
  }
  return null;
}
