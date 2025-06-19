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
        shouldRedirect: false,
      });
    });

    it("should parse a nested doc page", () => {
      const url = new URL("https://reactrouter.com/tutorials/quick-start");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "main",
        slug: "docs/tutorials/quick-start",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/docs/tutorials/quick-start.md",
        shouldRedirect: false,
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
        shouldRedirect: false,
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
        shouldRedirect: true,
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
        shouldRedirect: false,
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
        shouldRedirect: true,
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
        shouldRedirect: false,
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
        shouldRedirect: false,
      });
    });

    it("should handle local ref", () => {
      const url = new URL("https://reactrouter.com/local/getting-started");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "local",
        slug: "docs/getting-started",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/local/docs/getting-started.md",
        shouldRedirect: false,
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
        shouldRedirect: false,
      });
    });

    it("should handle nested paths with version", () => {
      const url = new URL("https://reactrouter.com/6.28.0/start/tutorial");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "6.28.0",
        slug: "docs/start/tutorial",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@6.28.0/docs/start/tutorial.md",
        shouldRedirect: false,
      });
    });

    it("should default to main for invalid version", () => {
      const url = new URL(
        "https://reactrouter.com/invalid-version/getting-started",
      );
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "main",
        slug: "docs/invalid-version/getting-started",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/docs/invalid-version/getting-started.md",
        shouldRedirect: false,
      });
    });
  });

  describe("markdown extension handling", () => {
    it("should flag for redirect when URL ends with .md", () => {
      const url = new URL("https://reactrouter.com/getting-started.md");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result.shouldRedirect).toBe(true);
      expect(result.slug).toBe("docs/getting-started.md");
    });

    it("should handle .md extension with versioned URL", () => {
      const url = new URL("https://reactrouter.com/6.28.0/getting-started.md");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "6.28.0",
        slug: "docs/getting-started.md",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@6.28.0/docs/getting-started.md",
        shouldRedirect: true,
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty splat", () => {
      const url = new URL("https://reactrouter.com/");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "main",
        slug: "docs/",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/docs/.md",
        shouldRedirect: false,
      });
    });

    it("should handle deep nested paths", () => {
      const url = new URL(
        "https://reactrouter.com/guides/routing/lazy-loading",
      );
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "main",
        slug: "docs/guides/routing/lazy-loading",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/docs/guides/routing/lazy-loading.md",
        shouldRedirect: false,
      });
    });

    it("should handle paths with hyphens and numbers", () => {
      const url = new URL("https://reactrouter.com/v6.28.0/api-reference");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result).toEqual({
        ref: "v6.28.0",
        slug: "docs/api-reference",

        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@v6.28.0/docs/api-reference.md",
        shouldRedirect: false,
      });
    });
  });

  describe("GitHub URL generation", () => {
    it("should use direct ref for main branch", () => {
      const url = new URL("https://reactrouter.com/getting-started");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result.githubPath).toBe(
        "https://raw.githubusercontent.com/remix-run/react-router/main/docs/getting-started.md",
      );
    });

    it("should use direct ref for dev branch", () => {
      const url = new URL("https://reactrouter.com/dev/getting-started");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result.githubPath).toBe(
        "https://raw.githubusercontent.com/remix-run/react-router/dev/docs/getting-started.md",
      );
    });

    it("should use direct ref for local branch", () => {
      const url = new URL("https://reactrouter.com/local/getting-started");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result.githubPath).toBe(
        "https://raw.githubusercontent.com/remix-run/react-router/local/docs/getting-started.md",
      );
    });

    it("should use refs/tags/ for semantic versions", () => {
      const url = new URL("https://reactrouter.com/v6.28.0/getting-started");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result.githubPath).toBe(
        "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@v6.28.0/docs/getting-started.md",
      );
    });

    it("should use refs/tags/ for semantic versions without v prefix", () => {
      const url = new URL("https://reactrouter.com/7.6.2/getting-started");
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result.githubPath).toBe(
        "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@7.6.2/docs/getting-started.md",
      );
    });

    it("should use direct ref for invalid version strings", () => {
      const url = new URL(
        "https://reactrouter.com/invalid-version/getting-started",
      );
      const splat = getSplat(url);
      const result = parseDocUrl(url, splat);

      expect(result.githubPath).toBe(
        "https://raw.githubusercontent.com/remix-run/react-router/main/docs/invalid-version/getting-started.md",
      );
    });
  });
});
