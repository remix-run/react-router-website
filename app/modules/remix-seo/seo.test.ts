import { getSeo } from "./seo";

describe("getSeo", () => {
  it("provides default stuff", () => {
    let seo = getSeo({});
    expect(seo({})).toMatchInlineSnapshot(`
      [
        {
          "googlebot": "index,follow,",
          "robots": "index,follow,",
        },
        [],
      ]
    `);
  });

  it("provides a default title", () => {
    let seo = getSeo({ defaultTitle: "Test default title" });
    expect(seo({})).toMatchInlineSnapshot(`
      [
        {
          "googlebot": "index,follow,",
          "robots": "index,follow,",
          "title": "Test default title",
        },
        [],
      ]
    `);
  });

  it("overrides the title", () => {
    let DEFAULT_TITLE = "default title";
    let TITLE = "real title";
    let seo = getSeo({ defaultTitle: DEFAULT_TITLE });
    let [meta] = seo({ title: TITLE });
    expect(meta.title).toBe(TITLE);
  });

  it("defaults the description for everybody who who hates the normal description", () => {
    let seo = getSeo({});
    let [meta] = seo({ description: "Heyooo" });
    expect(meta).toMatchInlineSnapshot(`
      {
        "description": "Heyooo",
        "googlebot": "index,follow,",
        "og:description": "Heyooo",
        "robots": "index,follow,",
      }
    `);
  });

  it("adds the host to the images", () => {
    let seo = getSeo({ host: "test://example.com" });
    let [meta] = seo({
      openGraph: { images: [{ url: "/beef.jpg", alt: "beef!" }] },
      twitter: { image: { url: "/beef.jpg", alt: "beef!" } },
    });
    expect(meta).toMatchInlineSnapshot(`
      {
        "googlebot": "index,follow,",
        "og:image": "test://example.com/beef.jpg",
        "og:image:alt": "beef!",
        "robots": "index,follow,",
        "twitter:card": "summary",
        "twitter:image": "test://example.com/beef.jpg",
        "twitter:image:alt": "beef!",
      }
    `);
  });

  it("tells bots not to index", () => {
    let seo = getSeo({
      robots: {
        noindex: true,
      },
    });
    let [meta] = seo({});
    expect(meta).toMatchInlineSnapshot(`
      {
        "googlebot": "noindex,follow,",
        "robots": "noindex,follow,",
      }
    `);
  });
});
