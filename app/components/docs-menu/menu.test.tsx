import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { MenuDoc } from "~/modules/gh-docs/.server/docs";

vi.mock("./link-with-spinner", () => ({
  LinkWithSpinner: ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => <a href={to}>{children}</a>,
}));

import { renderMenu } from "./menu";

describe("server-rendered docs menu", () => {
  it("renders versioned links without mutating cached menu order", () => {
    const child = (title: string, order: number): MenuDoc => ({
      attrs: { title, order },
      filename: `${title}.md`,
      slug: `start/${title}`,
      hasContent: true,
      children: [],
    });
    const children = [child("second", 2), child("first", 1)];
    Object.freeze(children);
    const menu: MenuDoc[] = [
      {
        attrs: { title: "Start" },
        filename: "start.md",
        slug: "start",
        hasContent: false,
        children,
      },
    ];
    const html = renderToStaticMarkup(
      renderMenu({ menu, prefix: "/v7/", changelogHref: "/v7/changelog" }),
    );

    expect(html).toContain('href="/v7/changelog"');
    expect(html).toContain('href="/v7/start/first"');
    expect(html.indexOf("start/first")).toBeLessThan(
      html.indexOf("start/second"),
    );
    expect(children.map((doc) => doc.attrs.title)).toEqual(["second", "first"]);
  });

  it("renders an error message instead of throwing when menu data is missing", () => {
    const html = renderToStaticMarkup(renderMenu({ prefix: "/" }));
    expect(html).toContain("Failed to load menu");
  });
});
