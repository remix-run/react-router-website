import { describe, it, expect } from "vitest";
import { parseDocUrl } from "./doc-url-parser";

function getSplat(url: URL) {
  return url.pathname.slice(1);
}

describe("parseDocUrl", () => {
  describe("basic doc pages", () => {
    it("should parse a basic doc page", () => {
      const url = new URL("https://reactrouter.com/start/modes");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "main",
        slug: "docs/start/modes",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/docs/start/modes.md",
        githubEditPath:
          "https://github.com/remix-run/react-router/edit/main/docs/start/modes.md",
      });
    });

    it("should handle when URL ends with .md", () => {
      const url = new URL("https://reactrouter.com/getting-started.md");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "main",
        slug: "docs/getting-started",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/docs/getting-started.md",
        githubEditPath:
          "https://github.com/remix-run/react-router/edit/main/docs/getting-started.md",
      });
    });
  });

  describe("home page detection", () => {
    it("should detect home page with /home", () => {
      const url = new URL("https://reactrouter.com/home");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "main",
        slug: "docs/index",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/docs/index.md",
        githubEditPath:
          "https://github.com/remix-run/react-router/edit/main/docs/index.md",
      });
    });

    it("should detect home page with /home.md", () => {
      const url = new URL("https://reactrouter.com/home.md");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "main",
        slug: "docs/index",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/docs/index.md",
        githubEditPath:
          "https://github.com/remix-run/react-router/edit/main/docs/index.md",
      });
    });
  });

  describe("changelog page detection", () => {
    it("should detect changelog page with /changelog", () => {
      const url = new URL("https://reactrouter.com/changelog");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "main",
        slug: "CHANGELOG",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/CHANGELOG.md",
        githubEditPath:
          "https://github.com/remix-run/react-router/edit/main/CHANGELOG.md",
      });
    });

    it("should detect changelog page with /changelog.md", () => {
      const url = new URL("https://reactrouter.com/changelog.md");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "main",
        slug: "CHANGELOG",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/CHANGELOG.md",
        githubEditPath:
          "https://github.com/remix-run/react-router/edit/main/CHANGELOG.md",
      });
    });

    it("should detect versioned changelog page", () => {
      const url = new URL("https://reactrouter.com/6.28.0/changelog");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "6.28.0",
        slug: "CHANGELOG",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@6.28.0/CHANGELOG.md",
      });
    });
  });

  describe("version/ref handling", () => {
    it("should handle dev ref", () => {
      const url = new URL("https://reactrouter.com/dev/start/modes");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "dev",
        slug: "docs/start/modes",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/dev/docs/start/modes.md",
        githubEditPath:
          "https://github.com/remix-run/react-router/edit/dev/docs/start/modes.md",
      });
    });

    it("should handle semantic version ref", () => {
      const url = new URL("https://reactrouter.com/6.28.0/start/tutorial");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "6.28.0",
        slug: "docs/start/tutorial",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@6.28.0/docs/start/tutorial.md",
      });
    });

    it("should handle semantic version ref with .md extension", () => {
      const url = new URL("https://reactrouter.com/6.28.0/start/tutorial.md");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "6.28.0",
        slug: "docs/start/tutorial",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@6.28.0/docs/start/tutorial.md",
      });
    });

    it("should handle pre-6.4.0 semantic version ref with v prefix", () => {
      const url = new URL(
        "https://reactrouter.com/6.2.0/getting-started/installation",
      );
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "6.2.0",
        slug: "docs/getting-started/installation",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/v6.2.0/docs/getting-started/installation.md",
      });
    });
  });
});
