import { beforeEach, describe, expect, it, vi } from "vitest";

const getRepoTags = vi.hoisted(() => vi.fn<() => Promise<string[]>>());

vi.mock("./index", () => ({
  getRepoTags,
}));

import { handleMajorVersionRedirects } from "./major-version-redirect";

describe("handleMajorVersionRedirects", () => {
  let tags = ["6.30.1", "7.9.6", "7.8.2", "8.0.0", "8.0.0-pre.0", "12.1.0"];

  beforeEach(() => {
    getRepoTags.mockReset();
  });

  it("redirects major version URLs to the latest stable matching version", async () => {
    await expectRedirect("/v7/start", "/7.9.6/start");
    await expectRedirect("/v8/start", "/8.0.0/start");
    await expectRedirect("/v12/start", "/12.1.0/start");
  });

  it("redirects major version index URLs", async () => {
    await expectRedirect("/v7", "/7.9.6");
  });

  it("ignores prereleases", async () => {
    getRepoTags.mockResolvedValue(["8.0.0-pre.0"]);

    await expectNoRedirect("/v8/start");
  });

  it("continues for non-major-version URLs", async () => {
    await expectNoRedirect("/7/start");
    await expectNoRedirect("/v7x/start");
    await expectNoRedirect("/version7/start");
  });

  it("preserves query strings in the middleware redirect", async () => {
    await expectRedirect(
      "/v7/start?framework=true",
      "/7.9.6/start?framework=true",
    );
  });

  async function expectRedirect(pathname: string, expectedPathname: string) {
    getRepoTags.mockResolvedValue(tags);
    let url = new URL(pathname, "https://reactrouter.com");

    try {
      await handleMajorVersionRedirects(
        { url } as never,
        (() => undefined) as never,
      );
      throw new Error("Expected redirect");
    } catch (response) {
      expect(response).toBeInstanceOf(Response);
      expect((response as Response).headers.get("location")).toBe(
        new URL(expectedPathname, "https://reactrouter.com").toString(),
      );
    }
  }

  async function expectNoRedirect(pathname: string) {
    let url = new URL(pathname, "https://reactrouter.com");

    await expect(
      handleMajorVersionRedirects({ url } as never, (() => undefined) as never),
    ).resolves.toBeUndefined();
  }
});
