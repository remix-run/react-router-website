import semver from "semver";

export function parseDocUrl(url: URL, splat: string) {
  // Remove the .md extension if there is one
  splat = splat.replace(/\.md$/, "");
  let pathname = url.pathname.replace(/\.md$/, "");

  let firstSegment = splat.split("/")[0];

  let ref = "main";
  if (
    firstSegment === "dev" ||
    firstSegment === "local" ||
    semver.valid(firstSegment)
  ) {
    ref = firstSegment;
  }

  let slug: string;
  if (pathname.endsWith("/changelog")) {
    slug = "CHANGELOG";
  } else if (pathname.endsWith("/home")) {
    slug = "docs/index";
  } else {
    // Build the docs path, removing refParam if present
    let docsPath = splat.replace(`${ref}/`, "");
    slug = `docs/${docsPath}`;
  }

  return {
    ref,
    slug,
    ...generateGitHubPaths(ref, slug),
  };
}

/**
 * Fixes up ref names to match the actual GitHub ref structure
 * - Branches (dev, main, release-next, local) are used as-is
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
  return ["dev", "main", "release-next", "local"].includes(ref);
}

/**
 * Generates the correct GitHub raw URL based on the ref type
 * - For main/dev/local: uses the ref directly
 * - For semantic versions: uses refs/tags/{version}
 */
function generateGitHubPaths(ref: string, slug: string) {
  let baseUrl = "https://raw.githubusercontent.com/remix-run/react-router";

  // For main, dev, local, or any non-semver ref, use directly
  if (isRefBranch(ref)) {
    return {
      githubPath: `${baseUrl}/${ref}/${slug}.md`,
      githubEditPath: `https://github.com/remix-run/react-router/edit/${ref}/${slug}.md`,
    };
  }

  // For semantic versions, use refs/tags/ structure
  return {
    githubPath: `${baseUrl}/refs/tags/${fixupRefName(ref)}/${slug}.md`,
  };
}
