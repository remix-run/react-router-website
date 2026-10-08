import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Doc } from "~/modules/gh-docs/.server";

const { getRepoDoc, getRepoTags } = vi.hoisted(() => ({
  getRepoDoc: vi.fn(),
  getRepoTags: vi.fn(),
}));
vi.mock("~/modules/gh-docs/.server", () => ({ getRepoDoc, getRepoTags }));
// Client interactions have their own tests; this exercises the loader/article.
vi.mock("~/components/copy-page-dropdown", () => ({
  CopyPageDropdown: () => null,
}));
vi.mock("~/components/doc-interactions", () => ({
  DocInteractions: ({ children }: { children: React.ReactNode }) => children,
  MarkdownContent: ({ children }: { children: React.ReactNode }) => children,
}));

import { loader } from "./doc";

const doc: Doc = {
  attrs: { title: "Installation", internal: "not client metadata" },
  filename: "docs/start/framework/installation.md",
  slug: "docs/start/framework/installation",
  html: "<h1>Installation</h1>",
  md: "# Installation\n\nRaw source stays on the server.",
  headings: [],
  children: [],
};

describe("server-rendered doc loader", () => {
  beforeEach(() => {
    getRepoTags.mockReset().mockResolvedValue(["8.4.0"]);
    getRepoDoc.mockReset().mockResolvedValue(doc);
  });

  function load() {
    return loader({
      url: new URL("https://reactrouter.com/start/framework/installation"),
      params: { "*": "start/framework/installation" },
    } as never);
  }

  it("returns only client metadata plus a server-rendered article", async () => {
    const data = await load();
    expect(data.doc).toEqual({ attrs: { title: "Installation" } });
    expect(renderToStaticMarkup(data.content)).toContain(
      "<h1>Installation</h1>",
    );
    expect(data.githubPath).toContain("start/framework/installation.md");
    expect(data.githubEditPath).toContain("/main/");
  });

  it("keeps missing documents as 404 responses", async () => {
    getRepoDoc.mockResolvedValue(undefined);
    await expect(load()).rejects.toMatchObject({ status: 404 });
  });

  it("keeps unavailable GitHub metadata as a 503 response", async () => {
    getRepoTags.mockResolvedValue(undefined);
    await expect(load()).rejects.toMatchObject({ status: 503 });
  });
});
