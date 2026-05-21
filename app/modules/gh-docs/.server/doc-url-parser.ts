import semver from "semver";

/**
 * URL segment ↔ GitHub ref mapping:
 * - "main"  → main branch — unreleased docs
 * - "local" → "local" branch (dev only)
 * - semver  → tagged release
 * - no segment → `defaultRef` (typically the latest released tag)
 */
export interface ResolvedRef {
  /** GitHub ref to fetch from (e.g. "main", "7.15.1", "local") */
  ref: string;
  /**
   * URL-facing segment (e.g. "main", "7.15.1", "local"). Undefined when the
   * URL has no ref segment and the default tag is used.
   */
  refParam?: string;
}

/**
 * Resolves the GitHub ref + URL-facing segment from a splat / `:ref` param.
 *
 * Pass `routeRefParam` when the route uses `/:ref` (the v6 layout). Otherwise
 * the first segment of the splat is inspected.
 */
export function resolveRef(
  splat: string | undefined,
  defaultRef: string,
  routeRefParam?: string,
): ResolvedRef {
  let segment = routeRefParam ?? splat?.split("/")[0] ?? "";

  if (segment === "main") return { ref: "main", refParam: "main" };
  if (segment === "local") return { ref: "local", refParam: "local" };
  if (semver.valid(segment)) return { ref: segment, refParam: segment };

  return { ref: defaultRef };
}

export function buildDocPaths(
  pathname: string,
  splat: string,
  ref: string,
  refParam: string | undefined,
) {
  splat = splat.replace(/\.md$/, "");
  pathname = pathname.replace(/\.md$/, "");

  let slug: string;
  if (pathname.endsWith("/changelog")) {
    slug = "CHANGELOG";
  } else if (pathname.endsWith("/home")) {
    slug = "docs/index";
  } else {
    let docsPath = refParam ? splat.replace(`${refParam}/`, "") : splat;
    slug = `docs/${docsPath}`;
  }

  return {
    slug,
    ...generateGitHubPaths(ref, slug),
  };
}

/**
 * Fixes up ref names to match the actual GitHub ref structure
 * - Branches (main, local) are used as-is
 * - Pre-changeset versions (< 6.4.0) get "v" prefix
 * - Post-changeset versions get "react-router@" prefix
 */
export function fixupRefName(ref: string): string {
  if (isRefBranch(ref)) {
    return ref;
  }

  // pre changesets, tags were like v6.2.0, so add a "v" to the ref from the URL
  if (semver.lt(ref, "6.4.0")) {
    return `v${ref}`;
  }

  // add react-router@ because that's what the tags are called after changesets
  return `react-router@${ref}`;
}

function isRefBranch(ref: string): boolean {
  return ["main", "local"].includes(ref);
}

/**
 * Generates the correct GitHub raw URL based on the ref type
 * - For main/local: uses the ref directly
 * - For semantic versions: uses refs/tags/{version}
 */
function generateGitHubPaths(ref: string, slug: string) {
  let baseUrl = "https://raw.githubusercontent.com/remix-run/react-router";

  if (isRefBranch(ref)) {
    return {
      githubPath: `${baseUrl}/${ref}/${slug}.md`,
      githubEditPath: `https://github.com/remix-run/react-router/edit/${ref}/${slug}.md`,
    };
  }

  return {
    githubPath: `${baseUrl}/refs/tags/${fixupRefName(ref)}/${slug}.md`,
  };
}
