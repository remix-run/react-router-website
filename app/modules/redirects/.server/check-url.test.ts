import { checkUrl } from "./check-url";
import { getRedirects } from "./get-redirects";
import type { Redirect } from "./get-redirects";

describe("handleRedirects", () => {
  let redirects: Redirect[];

  beforeAll(async () => {
    vi.mock(
      "../../../../_redirects?raw",
      async () => await import("./__fixtures__/_redirects?raw")
    );
    redirects = await getRedirects();
  });

  afterAll(() => {
    vi.restoreAllMocks();
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
