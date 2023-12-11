import { getSeo } from "./seo";

describe("getSeo", () => {
  it("provides default stuff", () => {
    let seo = getSeo({});
    expect(seo({})).toMatchInlineSnapshot(`
      [
        [],
        [],
      ]
    `);
  });

  it("provides a default title", () => {
    let seo = getSeo({ defaultTitle: "Test default title" });
    expect(seo({})).toMatchInlineSnapshot(`
      [
        [
          {
            "title": "Test default title",
          },
        ],
        [],
      ]
    `);
  });

  it("overrides the title", () => {
    let DEFAULT_TITLE = "default title";
    let TITLE = "real title";
    let seo = getSeo({ defaultTitle: DEFAULT_TITLE });
    let [meta] = seo({ title: TITLE });
    let titleMeta = meta.find((m) => "title" in m && m.title != null);
    expect("title" in titleMeta! ? titleMeta.title : null).toBe(TITLE);
  });

  it("defaults the description for everybody who who hates the normal description", () => {
    let seo = getSeo({});
    let [meta] = seo({ description: "Heyooo" });
    expect(meta).toMatchInlineSnapshot(`
      [
        {
          "content": "Heyooo",
          "name": "description",
        },
        {
          "content": "Heyooo",
          "name": "og:description",
        },
      ]
    `);
  });

  it("adds the host to the images", () => {
    let seo = getSeo({ host: "test://example.com" });
    let [meta] = seo({
      openGraph: { images: [{ url: "/beef.jpg", alt: "beef!" }] },
      twitter: { image: { url: "/beef.jpg", alt: "beef!" } },
    });
    expect(meta).toMatchInlineSnapshot(`
      [
        {
          "content": "test://example.com/beef.jpg",
          "name": "twitter:image",
        },
        {
          "content": "beef!",
          "name": "twitter:image:alt",
        },
        {
          "content": "summary",
          "name": "twitter:card",
        },
        {
          "content": "test://example.com/beef.jpg",
          "name": "og:image",
        },
        {
          "content": "beef!",
          "name": "og:image:alt",
        },
      ]
    `);
  });
});
