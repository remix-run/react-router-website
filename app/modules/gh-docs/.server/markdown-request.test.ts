import { describe, it, expect, vi, beforeEach } from "vitest";
import { CACHE_CONTROL } from "~/http";

const { getRepoTags, getRepoDoc } = vi.hoisted(() => ({
  getRepoTags: vi.fn<() => Promise<string[] | undefined>>(),
  getRepoDoc:
    vi.fn<(ref: string, slug: string) => Promise<{ md: string } | undefined>>(),
}));

vi.mock("./index", () => ({
  getRepoTags: () => getRepoTags(),
  getRepoDoc: (ref: string, slug: string) => getRepoDoc(ref, slug),
}));

import { handleMarkdownRequest } from "./markdown-request";

const LATEST = "7.15.1";
const MD = "---\ntitle: Installation\n---\n\n# Installation\n\nHello.";

function call(
  pathname: string,
  { accept, method = "GET" }: { accept?: string; method?: string } = {},
): Promise<Response | undefined> {
  let url = new URL(`https://reactrouter.com${pathname}`);
  let headers = new Headers();
  if (accept) headers.set("accept", accept);
  let request = new Request(url, { method, headers });
  return handleMarkdownRequest(
    { request, url } as never,
    (async () => undefined) as never,
  ) as Promise<Response | undefined>;
}

describe("handleMarkdownRequest", () => {
  beforeEach(() => {
    getRepoTags.mockReset().mockResolvedValue([LATEST]);
    getRepoDoc.mockReset().mockResolvedValue({ md: MD });
  });

  it("continues for normal browser requests", async () => {
    let res = await call("/start/installation", {
      accept: "text/html,application/xhtml+xml,*/*;q=0.8",
    });
    expect(res).toBeUndefined();
    expect(getRepoDoc).not.toHaveBeenCalled();
  });

  it("serves markdown when Accept prefers it", async () => {
    let res = await call("/start/installation", { accept: "text/markdown" });
    expect(res).toBeInstanceOf(Response);
    expect(res!.status).toBe(200);
    expect(res!.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(res!.headers.get("cache-control")).toBe(CACHE_CONTROL.doc);
    expect(res!.headers.get("vary")).toBe("Accept");
    expect(res!.headers.get("x-markdown-tokens")).toBe(
      String(Math.ceil(MD.length / 4)),
    );
    expect(await res!.text()).toBe(MD);
  });

  it("resolves ref + slug from the URL for content negotiation", async () => {
    await call("/main/start/installation", { accept: "text/markdown" });
    expect(getRepoDoc).toHaveBeenCalledWith("main", "docs/start/installation");
  });

  it("maps /home and /changelog to their special slugs", async () => {
    await call("/home", { accept: "text/markdown" });
    expect(getRepoDoc).toHaveBeenCalledWith(LATEST, "docs/index");

    getRepoDoc.mockClear();
    await call("/changelog", { accept: "text/markdown" });
    expect(getRepoDoc).toHaveBeenCalledWith(LATEST, "CHANGELOG");
  });

  it("serves markdown for the .md suffix without Vary", async () => {
    let res = await call("/start/installation.md");
    expect(res).toBeInstanceOf(Response);
    expect(res!.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(res!.headers.get("vary")).toBeNull();
    expect(getRepoDoc).toHaveBeenCalledWith(LATEST, "docs/start/installation");
  });

  it("returns no body for HEAD but keeps the headers", async () => {
    let res = await call("/start/installation", {
      accept: "text/markdown",
      method: "HEAD",
    });
    expect(res!.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(await res!.text()).toBe("");
  });

  it("continues when the doc does not exist", async () => {
    getRepoDoc.mockResolvedValue(undefined);
    let res = await call("/nope", { accept: "text/markdown" });
    expect(res).toBeUndefined();
  });

  it("continues when GitHub tags are unavailable", async () => {
    getRepoTags.mockResolvedValue(undefined);
    let res = await call("/start/installation", { accept: "text/markdown" });
    expect(res).toBeUndefined();
    expect(getRepoDoc).not.toHaveBeenCalled();
  });

  it("continues when GitHub tags reject", async () => {
    getRepoTags.mockRejectedValue(new Error("boom"));
    let res = await call("/start/installation", { accept: "text/markdown" });
    expect(res).toBeUndefined();
    expect(getRepoDoc).not.toHaveBeenCalled();
  });

  it("continues when the doc lookup throws", async () => {
    getRepoDoc.mockRejectedValue(new Error("boom"));
    let res = await call("/start/installation", { accept: "text/markdown" });
    expect(res).toBeUndefined();
  });

  it("ignores non-GET/HEAD methods", async () => {
    let res = await call("/start/installation", {
      accept: "text/markdown",
      method: "POST",
    });
    expect(res).toBeUndefined();
    expect(getRepoTags).not.toHaveBeenCalled();
  });
});
