import { describe, it, expect } from "vitest";
import { resolveRef, buildDocPaths } from "./doc-url-parser";

const LATEST = "7.15.1";

describe("resolveRef", () => {
  it("returns the default ref when there is no URL segment", () => {
    expect(resolveRef("start/modes", LATEST)).toEqual({ ref: LATEST });
    expect(resolveRef("", LATEST)).toEqual({ ref: LATEST });
    expect(resolveRef(undefined, LATEST)).toEqual({ ref: LATEST });
  });

  it("maps /main to the main branch", () => {
    expect(resolveRef("main/start/modes", LATEST)).toEqual({
      ref: "main",
      refParam: "main",
    });
    expect(resolveRef("main", LATEST)).toEqual({
      ref: "main",
      refParam: "main",
    });
  });

  it("passes local through", () => {
    expect(resolveRef("local/home", LATEST)).toEqual({
      ref: "local",
      refParam: "local",
    });
  });

  it("recognizes semver segments", () => {
    expect(resolveRef("6.28.0/start/tutorial", LATEST)).toEqual({
      ref: "6.28.0",
      refParam: "6.28.0",
    });
    expect(resolveRef("7.15.1", LATEST)).toEqual({
      ref: "7.15.1",
      refParam: "7.15.1",
    });
  });

  it("prefers the route :ref param over the splat", () => {
    expect(resolveRef("anything", LATEST, "6.30.3")).toEqual({
      ref: "6.30.3",
      refParam: "6.30.3",
    });
    expect(resolveRef(undefined, LATEST, "local")).toEqual({
      ref: "local",
      refParam: "local",
    });
  });

  it("falls back to the default when neither source matches a known segment", () => {
    expect(resolveRef("start/modes", LATEST)).toEqual({ ref: LATEST });
    expect(resolveRef("dev/foo", LATEST)).toEqual({ ref: LATEST });
  });
});

describe("buildDocPaths", () => {
  describe("default ref (latest tag)", () => {
    it("builds a basic doc page", () => {
      expect(
        buildDocPaths("/start/modes", "start/modes", LATEST, undefined),
      ).toEqual({
        slug: "docs/start/modes",
        githubPath: `https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@${LATEST}/docs/start/modes.md`,
      });
    });

    it("strips the .md extension", () => {
      expect(
        buildDocPaths(
          "/getting-started.md",
          "getting-started.md",
          LATEST,
          undefined,
        ),
      ).toEqual({
        slug: "docs/getting-started",
        githubPath: `https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@${LATEST}/docs/getting-started.md`,
      });
    });

    it("detects /home", () => {
      expect(buildDocPaths("/home", "home", LATEST, undefined)).toEqual({
        slug: "docs/index",
        githubPath: `https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@${LATEST}/docs/index.md`,
      });
    });

    it("detects /home.md", () => {
      expect(buildDocPaths("/home.md", "home.md", LATEST, undefined)).toEqual({
        slug: "docs/index",
        githubPath: `https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@${LATEST}/docs/index.md`,
      });
    });

    it("detects /changelog", () => {
      expect(
        buildDocPaths("/changelog", "changelog", LATEST, undefined),
      ).toEqual({
        slug: "CHANGELOG",
        githubPath: `https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@${LATEST}/CHANGELOG.md`,
      });
    });

    it("detects /changelog.md", () => {
      expect(
        buildDocPaths("/changelog.md", "changelog.md", LATEST, undefined),
      ).toEqual({
        slug: "CHANGELOG",
        githubPath: `https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@${LATEST}/CHANGELOG.md`,
      });
    });
  });

  describe("/main (main branch)", () => {
    it("builds a doc page from main", () => {
      expect(
        buildDocPaths("/main/start/modes", "main/start/modes", "main", "main"),
      ).toEqual({
        slug: "docs/start/modes",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/docs/start/modes.md",
        githubEditPath:
          "https://github.com/remix-run/react-router/edit/main/docs/start/modes.md",
      });
    });

    it("detects /main/home", () => {
      expect(buildDocPaths("/main/home", "main/home", "main", "main")).toEqual({
        slug: "docs/index",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/docs/index.md",
        githubEditPath:
          "https://github.com/remix-run/react-router/edit/main/docs/index.md",
      });
    });

    it("detects /main/changelog", () => {
      expect(
        buildDocPaths("/main/changelog", "main/changelog", "main", "main"),
      ).toEqual({
        slug: "CHANGELOG",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/main/CHANGELOG.md",
        githubEditPath:
          "https://github.com/remix-run/react-router/edit/main/CHANGELOG.md",
      });
    });
  });

  describe("semver tags", () => {
    it("uses refs/tags/react-router@X.Y.Z for post-changeset versions", () => {
      expect(
        buildDocPaths(
          "/6.28.0/start/tutorial",
          "6.28.0/start/tutorial",
          "6.28.0",
          "6.28.0",
        ),
      ).toEqual({
        slug: "docs/start/tutorial",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@6.28.0/docs/start/tutorial.md",
      });
    });

    it("strips the .md extension on semver paths", () => {
      expect(
        buildDocPaths(
          "/6.28.0/start/tutorial.md",
          "6.28.0/start/tutorial.md",
          "6.28.0",
          "6.28.0",
        ),
      ).toEqual({
        slug: "docs/start/tutorial",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@6.28.0/docs/start/tutorial.md",
      });
    });

    it("uses v-prefixed tags for pre-6.4.0 versions", () => {
      expect(
        buildDocPaths(
          "/6.2.0/getting-started/installation",
          "6.2.0/getting-started/installation",
          "6.2.0",
          "6.2.0",
        ),
      ).toEqual({
        slug: "docs/getting-started/installation",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/v6.2.0/docs/getting-started/installation.md",
      });
    });

    it("builds versioned changelog paths", () => {
      expect(
        buildDocPaths(
          "/6.28.0/changelog",
          "6.28.0/changelog",
          "6.28.0",
          "6.28.0",
        ),
      ).toEqual({
        slug: "CHANGELOG",
        githubPath:
          "https://raw.githubusercontent.com/remix-run/react-router/refs/tags/react-router@6.28.0/CHANGELOG.md",
      });
    });
  });
});
