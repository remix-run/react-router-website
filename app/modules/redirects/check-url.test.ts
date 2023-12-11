import path from "path";
import { checkUrl } from "./check-url.server";
import { readRedirectsFile } from "./read-file.server";
import type { Redirect } from "./read-file.server";

describe("handleRedirects", () => {
  let redirects: Redirect[];

  beforeAll(async () => {
    redirects = await readRedirectsFile(
      path.join("app", "modules", "redirects", "__fixtures__", "_redirects")
    );
  });

  it("redirects static string", async () => {
    let response = await checkUrl("/hamburger", redirects);
    expect(response?.headers.get("location")).toBe("/taco");
  });

  it("redirects splats", async () => {
    let response = await checkUrl("/beef/one/two/three", redirects);
    expect(response?.headers.get("location")).toBe("/cheese/one/two/three");
  });

  it("redirects more splats", async () => {
    let response = await checkUrl("/docs/one/two/three", redirects);
    expect(response?.headers.get("location")).toBe("/one/two/three");
  });

  it("redirects to root", async () => {
    let response = await checkUrl("/docs", redirects);
    expect(response?.headers.get("location")).toBe("/");
  });

  it("redirects splats to other domains", async () => {
    let response = await checkUrl("/core/one/two", redirects);
    expect(response?.headers.get("location")).toBe(
      "https://v5.reactrouter.com/core/one/two"
    );
  });
});
